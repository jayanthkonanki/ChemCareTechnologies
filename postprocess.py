#!/usr/bin/env python3
"""
Fix data_full.json:
1. Re-assign products to correct categories using products-and-services.html as source of truth
2. Remove products with no data (404s)
3. Copy to frontend/public/
"""
import json, re, gzip, urllib.request, shutil, os, time

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Encoding": "gzip, deflate",
    "Accept": "text/html,*/*",
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    r = urllib.request.urlopen(req, timeout=20)
    raw = r.read()
    enc = r.info().get("Content-Encoding", "")
    if enc == "gzip":
        import gzip as gz
        raw = gz.decompress(raw)
    return raw.decode("utf-8", errors="replace")

def clean(s):
    s = re.sub(r"&amp;", "&", s or "")
    s = re.sub(r"&[lg]t;", "", s)
    return s.strip()

print("Fetching products-and-services.html (authoritative category list)...")
html = fetch("https://www.indiamart.com/chemcaretechnologies/products-and-services.html")

# Parse: category links followed by product links
# Build: pid -> {category_name, category_slug, product_name}
SKIP = {"products-and-services","profile","enquiry","photos","testimonial"}

pid_to_cat = {}   # pid -> (cat_name, cat_slug)
cat_order = []    # [slug, ...]
cat_names = {}    # slug -> display name

pattern = re.compile(
    r'href="(?:https?://www\.indiamart\.com)?/chemcaretechnologies/([\w-]+)\.html(?:#(\d+))?"[^>]*>\s*([^<]{2,120}?)\s*</a>',
    re.IGNORECASE
)

current_cat_slug = None
current_cat_name = None

for m in pattern.finditer(html):
    slug = m.group(1)
    pid  = m.group(2) or ""
    text = clean(m.group(3).strip())

    if slug in SKIP:
        continue
    if not text or text in ("View More","View more details","Home","Our Products","About Us","Photos","Contact Us","Testimonial"):
        continue

    if not pid:
        # Category header
        current_cat_slug = slug
        current_cat_name = text
        if slug not in cat_names:
            cat_names[slug] = text
            cat_order.append(slug)
    else:
        # Product under current category
        if current_cat_slug and pid not in pid_to_cat:
            pid_to_cat[pid] = (current_cat_name, current_cat_slug)

print(f"  Found {len(cat_order)} categories, {len(pid_to_cat)} products with category assignment")

# Load existing data_full.json
with open("data_full.json", encoding="utf-8") as f:
    data = json.load(f)

# Build pid -> full product detail from existing data
existing = {}
for cat in data.get("categories", []):
    for p in cat.get("products", []):
        pid = str(p.get("proddispid",""))
        if pid:
            existing[pid] = p

print(f"  Existing scraped products: {len(existing)}")

# Build new category structure
new_cats = {}  # slug -> {name, slug, products:[]}
for slug in cat_order:
    new_cats[slug] = {"name": cat_names[slug], "slug": slug, "products": []}

# Also add "Other Chemicals" for products not on p&s page
uncategorized_pids = []

for pid, pdata in existing.items():
    # Skip 404/empty products
    if not pdata.get("prodname") or pdata["prodname"].startswith("Product "):
        if not pdata.get("thumbnail") and not pdata.get("images"):
            continue  # completely empty, skip

    # Assign to correct category from p&s page
    if pid in pid_to_cat:
        cat_name, cat_slug = pid_to_cat[pid]
        if cat_slug not in new_cats:
            new_cats[cat_slug] = {"name": cat_name, "slug": cat_slug, "products": []}
        # Update category fields in product
        pdata["category"] = cat_name
        pdata["category_slug"] = cat_slug
        # Avoid duplicates
        existing_ids = {str(p["proddispid"]) for p in new_cats[cat_slug]["products"]}
        if pid not in existing_ids:
            new_cats[cat_slug]["products"].append(pdata)
    else:
        uncategorized_pids.append(pid)

# Handle uncategorized  
if uncategorized_pids:
    new_cats["other-chemicals"] = {"name": "Other Chemicals", "slug": "other-chemicals", "products": []}
    for pid in uncategorized_pids:
        pdata = existing[pid]
        if pdata.get("prodname"):
            pdata["category"] = "Other Chemicals"
            pdata["category_slug"] = "other-chemicals"
            new_cats["other-chemicals"]["products"].append(pdata)

# Build ordered list (follow p&s page order)
ordered_cats = []
for slug in cat_order:
    if slug in new_cats and new_cats[slug]["products"]:
        ordered_cats.append(new_cats[slug])
# Any extra
for slug, cat in new_cats.items():
    if slug not in cat_order and cat["products"]:
        ordered_cats.append(cat)

data["categories"] = ordered_cats
data["meta"]["total_categories"] = len(ordered_cats)
data["meta"]["total_products"] = sum(len(c["products"]) for c in ordered_cats)
data["meta"]["fixed_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

with open("data_full.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

os.makedirs("frontend/public", exist_ok=True)
shutil.copy("data_full.json", "frontend/public/data_full.json")

print(f"\n=== Fixed ===")
print(f"  Categories: {data['meta']['total_categories']}")
print(f"  Products:   {data['meta']['total_products']}")
for c in ordered_cats:
    print(f"    {c['name']}: {len(c['products'])} products")
