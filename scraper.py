#!/usr/bin/env python3
"""
Complete scraper for Chem Care Technologies IndiaMart profile.
Fetches ALL categories + products from products-and-services.html,
then scrapes each product detail page.
"""
import json, re, time, urllib.request, gzip, zlib, os, shutil

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    "Accept-Encoding": "gzip, deflate",
    "Accept": "text/html,application/xhtml+xml,*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
}

BASE = "https://www.indiamart.com/chemcaretechnologies"

def fetch(url, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            r = urllib.request.urlopen(req, timeout=20)
            raw = r.read()
            enc = r.info().get("Content-Encoding", "")
            if enc == "gzip":
                raw = gzip.decompress(raw)
            elif enc == "deflate":
                try:
                    raw = zlib.decompress(raw)
                except:
                    raw = zlib.decompress(raw, -15)
            for e in ["utf-8", "latin-1"]:
                try:
                    return raw.decode(e)
                except:
                    pass
            return raw.decode("utf-8", errors="replace")
        except Exception as e:
            print(f"    [retry {i+1}] {url}: {e}")
            time.sleep(2 * (i + 1))
    return ""

def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()

def clean(s):
    s = re.sub(r"&amp;", "&", s or "")
    s = re.sub(r"&gt;", ">", s)
    s = re.sub(r"&lt;", "<", s)
    s = re.sub(r"&nbsp;", " ", s)
    s = re.sub(r"&#\d+;", "", s)
    return s.strip()

# ─── NAV SLUGS TO SKIP ───
SKIP_SLUGS = {"products-and-services", "profile", "enquiry", "photos", "testimonial"}


def parse_all_categories(html):
    """
    Parse products-and-services.html.
    Returns ordered list of {name, slug, products: [{id, name}]}
    """
    cat_map = {}
    cat_order = []
    
    # All links with href containing the seller path
    pattern = re.compile(
        r'href="(?:https?://www\.indiamart\.com)?/chemcaretechnologies/([\w-]+)\.html(?:#(\d+))?"[^>]*>\s*([^<]{2,100}?)\s*</a>',
        re.IGNORECASE
    )
    
    for m in pattern.finditer(html):
        slug = m.group(1)
        prod_id = m.group(2) or ""
        text = clean(m.group(3).strip())
        
        if slug in SKIP_SLUGS:
            continue
        if not text or text in ("View More", "View more details", "Home", "Our Products",
                                "About Us", "Photos", "Contact Us", "Testimonial"):
            continue
        
        if not prod_id:
            # Category link
            if slug not in cat_map:
                cat_map[slug] = {"name": text, "slug": slug, "products": []}
                cat_order.append(slug)
        else:
            # Product link
            if slug not in cat_map:
                cat_map[slug] = {"name": slug.replace("-", " ").title(), "slug": slug, "products": []}
                cat_order.append(slug)
            existing = {p["id"] for p in cat_map[slug]["products"]}
            if prod_id not in existing:
                cat_map[slug]["products"].append({"id": prod_id, "name": text})
    
    # Append any remaining categories that exist after the 30th link
    # Also try to parse more product IDs from the JS top_prd JSON if present
    top_prd_m = re.search(r"top_prd\s*=\s*'(\[.*?\])';", html, re.DOTALL)
    if top_prd_m:
        try:
            prods = json.loads(top_prd_m.group(1))
            for p in prods:
                pid = str(p.get("proddispid", ""))
                pname = p.get("prodname", "")
                pimg = p.get("image", "")
                if pid and pname:
                    # Find which category this belongs to
                    found = False
                    for slug, cat in cat_map.items():
                        for cp in cat["products"]:
                            if cp["id"] == pid:
                                found = True
                                break
                        if found:
                            break
                    if not found:
                        # Add to first matching category or misc
                        if "all-products" not in cat_map:
                            cat_map["all-products"] = {"name": "All Products", "slug": "all-products", "products": []}
                            cat_order.append("all-products")
                        cat_map["all-products"]["products"].append({"id": pid, "name": pname, "thumbnail": pimg})
        except Exception as e:
            print(f"  top_prd parse error: {e}")
    
    return [cat_map[slug] for slug in cat_order if slug in cat_map]


def scrape_category_page(slug):
    """Get ALL products from a category page. Returns list of {id, name}"""
    url = f"{BASE}/{slug}.html"
    html = fetch(url)
    if not html:
        return []
    
    products = []
    seen = set()
    
    # Pattern: anchor tags with product IDs
    for pid, name in re.findall(
        r'href="[^"]*#(\d{8,})"[^>]*>\s*([^<]{3,120}?)\s*</a>',
        html
    ):
        name = clean(name.strip())
        if pid not in seen and name and name not in ("View More", "View more details"):
            seen.add(pid)
            products.append({"id": pid, "name": name})
    
    # h2/h3 wrapped links
    for pid, name in re.findall(
        r'<(?:h[23])[^>]*>.*?href="[^#]*#(\d{8,})"[^>]*>([^<]+)</a>.*?</(?:h[23])>',
        html, re.DOTALL | re.IGNORECASE
    ):
        name = clean(name.strip())
        if pid not in seen and name:
            seen.add(pid)
            products.append({"id": pid, "name": name})
    
    return products


def scrape_product(prod_id, prod_name):
    url = f"https://www.indiamart.com/proddetail/{prod_id}.html"
    html = fetch(url)
    
    detail = {
        "proddispid": prod_id,
        "prodname": prod_name,
        "product_url": url,
        "description": "",
        "price": "",
        "unit": "",
        "min_order": "",
        "images": [],
        "thumbnail": "",
        "specifications": {},
    }
    
    if not html:
        return detail
    
    # Description
    for pat in [
        r'<div[^>]*class="[^"]*prod-desc[^"]*"[^>]*>(.*?)</div>',
        r'(?:Product Description|About the Product)[^\n]*\n+\s*([\w][^\n]{30,})',
        r'"description"\s*:\s*"([^"]{20,500})"',
    ]:
        m = re.search(pat, html, re.DOTALL | re.IGNORECASE)
        if m:
            desc = clean(strip_tags(m.group(1)))
            if len(desc) > 15:
                detail["description"] = desc[:1500]
                break
    
    # Price
    for pat in [r'₹\s*([\d,]+(?:\.\d+)?)', r'Rs\.?\s*([\d,]+(?:\.\d+)?)']: 
        pm = re.search(pat, html)
        if pm:
            detail["price"] = pm.group(0).strip()
            break
    
    # Min order quantity
    mo_m = re.search(r'(?:Minimum Order|MOQ)[^:]*?:\s*([^\n<]{2,40})', html, re.IGNORECASE)
    if mo_m:
        detail["min_order"] = clean(mo_m.group(1).strip())
    
    # Images — prefer seller-specific large images
    imgs_large = re.findall(
        r'"(https://[^"]+imimg\.com[^"]+6407096[^"]+(?:500x500|1000x1000)[^"]*\.(?:jpg|jpeg|png))"',
        html
    )
    imgs_large = list(dict.fromkeys(imgs_large))[:8]
    
    # Fallback to any 500/1000 images
    if not imgs_large:
        imgs_large = re.findall(
            r'"(https://[^"]+imimg\.com[^"]+(?:500x500|1000x1000)[^"]*\.(?:jpg|jpeg|png))"',
            html
        )
        imgs_large = list(dict.fromkeys(imgs_large))[:8]
    
    detail["images"] = imgs_large
    
    # Thumbnail
    thumb_m = re.search(
        r'"(https://[^"]+imimg\.com[^"]+6407096[^"]+250x250[^"]*\.(?:jpg|jpeg|png))"',
        html
    )
    if thumb_m:
        detail["thumbnail"] = thumb_m.group(1)
    elif imgs_large:
        detail["thumbnail"] = imgs_large[0]
    else:
        # Any imimg thumbnail for this product
        any_thumb = re.search(
            r'"(https://[^"]+imimg\.com[^"]+(?:250x250|125x125)[^"]*\.(?:jpg|jpeg|png))"',
            html
        )
        if any_thumb:
            detail["thumbnail"] = any_thumb.group(1)
    
    # Specifications
    specs = {}
    
    # Table rows (key-value pairs)
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL | re.IGNORECASE)
    for row in rows:
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.DOTALL | re.IGNORECASE)
        cells = [clean(strip_tags(c)) for c in cells if c.strip()]
        if len(cells) == 2 and cells[0] and cells[1] and len(cells[0]) < 80 and len(cells[1]) < 300:
            specs[cells[0]] = cells[1]
    
    # DL/DT/DD
    for k, v in re.findall(r'<dt[^>]*>(.*?)</dt>\s*<dd[^>]*>(.*?)</dd>', html, re.DOTALL | re.IGNORECASE):
        k = clean(strip_tags(k))
        v = clean(strip_tags(v))
        if k and v and len(k) < 80 and len(v) < 300:
            specs[k] = v
    
    # Remove noise
    noise = {"Price", "Availability", "Ships from", "Shipping", "View in Hindi",
             "Price Excluding all taxes", "Excluding all taxes"}
    specs = {k: v for k, v in specs.items() if k not in noise and len(k) > 1 and len(v) > 0}
    detail["specifications"] = specs
    
    return detail


def main():
    print("=== FULL Chem Care Technologies IndiaMart Scraper ===\n")
    
    print("Fetching products-and-services.html...")
    ps_html = fetch(f"{BASE}/products-and-services.html")
    print(f"  Page size: {len(ps_html)} chars")
    
    categories = parse_all_categories(ps_html)
    print(f"\nFound {len(categories)} categories:\n")
    for c in categories:
        print(f"  {c['name']} ({c['slug']}): {len(c['products'])} products listed")
    
    # Expand each category page to get ALL products
    print("\nExpanding categories with full category page scraping...")
    all_prod_meta = {}  # id -> {name, category, slug}
    
    for cat in categories:
        slug = cat["slug"]
        cat_name = cat["name"]
        
        # Add products already found from main page
        for p in cat["products"]:
            pid = p["id"]
            if pid not in all_prod_meta:
                all_prod_meta[pid] = {
                    "name": p["name"],
                    "category": cat_name,
                    "slug": slug,
                    "thumbnail": p.get("thumbnail", "")
                }
        
        # Scrape category page
        print(f"  -> {cat_name}")
        extra = scrape_category_page(slug)
        added = 0
        for p in extra:
            pid = p["id"]
            if pid not in all_prod_meta:
                all_prod_meta[pid] = {"name": p["name"], "category": cat_name, "slug": slug, "thumbnail": ""}
                added += 1
        if added:
            print(f"     +{added} more products")
        time.sleep(0.4)
    
    total = len(all_prod_meta)
    print(f"\nTotal unique products to scrape: {total}")
    
    # Scrape each product
    print("\nScraping product detail pages...")
    product_details = {}
    
    for i, (pid, meta) in enumerate(all_prod_meta.items(), 1):
        print(f"  [{i:2d}/{total}] {meta['name'][:60]}")
        d = scrape_product(pid, meta["name"])
        d["category"] = meta["category"]
        d["category_slug"] = meta["slug"]
        # Preserve thumbnail from category page if detail page didn't find one
        if not d.get("thumbnail") and meta.get("thumbnail"):
            d["thumbnail"] = meta["thumbnail"]
        product_details[pid] = d
        time.sleep(0.5)
    
    # Build output
    cat_products = {}
    for slug in [c["slug"] for c in categories]:
        cat_products[slug] = []
    
    for pid, d in product_details.items():
        slug = d.get("category_slug", "other")
        if slug not in cat_products:
            cat_products[slug] = []
        cat_products[slug].append(d)
    
    ordered_cats = []
    for cat in categories:
        slug = cat["slug"]
        prods = cat_products.get(slug, [])
        if prods:
            ordered_cats.append({
                "name": cat["name"],
                "slug": slug,
                "products": prods
            })
    
    # Any leftover
    seen_slugs = {c["slug"] for c in categories}
    for slug, prods in cat_products.items():
        if slug not in seen_slugs and prods:
            ordered_cats.append({"name": slug.replace("-", " ").title(), "slug": slug, "products": prods})
    
    output = {
        "company": {
            "name": "Chem Care Technologies",
            "location": "Kanuru, Vijayawada, Andhra Pradesh, India",
            "rating": "4.2",
            "rating_count": "38",
            "years": "13 yrs",
            "trust_seal": True,
            "gst": "37**********1Z6",
            "response_rate": "85%",
            "business_type": "Trader - Wholesaler / Distributor",
            "description": "Chem Care Technologies is a leading Trader, Wholesaler and Distributor of industrial chemicals from Vijayawada, Andhra Pradesh, India. We supply Boiler Chemicals, Cooling Tower Chemicals, Laboratory Chemicals, Water Treatment Chemicals and more.",
            "logo": "https://5.imimg.com/data5/SELLER/Logo/2025/5/509401904/ZB/OI/PC/6407096/logo02.jpg",
            "indiamart_url": "https://www.indiamart.com/chemcaretechnologies/",
        },
        "categories": ordered_cats,
        "meta": {
            "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "source_url": f"{BASE}/products-and-services.html",
            "total_categories": len(ordered_cats),
            "total_products": sum(len(c["products"]) for c in ordered_cats),
        }
    }
    
    with open("data_full.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    os.makedirs("frontend/public", exist_ok=True)
    shutil.copy("data_full.json", "frontend/public/data_full.json")
    
    print(f"\n=== DONE ===")
    print(f"  Total categories: {output['meta']['total_categories']}")
    print(f"  Total products:   {output['meta']['total_products']}")
    for c in ordered_cats:
        print(f"    {c['name']}: {len(c['products'])} products")


if __name__ == "__main__":
    main()
