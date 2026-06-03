#!/usr/bin/env python3
"""Merge product names from data.json into data_full.json + copy to frontend public/"""
import json, shutil, os

with open("data.json", encoding="utf-8") as f:
    basic = json.load(f)

with open("data_full.json", encoding="utf-8") as f:
    full = json.load(f)

# Build name map from basic data: id -> prodname
name_map = {str(p.get("proddispid", "")): p.get("prodname", "") for p in basic.get("products", [])}

# Also extract names from image URLs in full data
def name_from_img(img):
    """Guess product name from image URL slug"""
    import re
    if not img:
        return ""
    # e.g. cooling-tower-oxidizing-biocide-chemical-250x250.jpg
    base = img.rsplit("/", 1)[-1]
    base = re.sub(r'-\d+x\d+\.(jpg|jpeg|png|webp)$', '', base, flags=re.IGNORECASE)
    base = re.sub(r'\.(jpg|jpeg|png|webp)$', '', base, flags=re.IGNORECASE)
    # Convert slug to title
    return " ".join(w.capitalize() for w in base.replace("-", " ").split())

# Patch product names in categories
for cat in full.get("categories", []):
    for prod in cat.get("products", []):
        pid = str(prod.get("proddispid", ""))
        if pid in name_map and name_map[pid]:
            prod["prodname"] = name_map[pid]
        elif prod["prodname"].startswith("Product "):
            # Try from thumbnail slug
            n = name_from_img(prod.get("thumbnail", ""))
            if n and not n.startswith("Product"):
                prod["prodname"] = n

# Patch all_products too
for prod in full.get("all_products", []):
    pid = str(prod.get("proddispid", ""))
    if pid in name_map and name_map[pid]:
        prod["prodname"] = name_map[pid]
    elif prod.get("prodname", "").startswith("Product "):
        n = name_from_img(prod.get("thumbnail", ""))
        if n and not n.startswith("Product"):
            prod["prodname"] = n

# Also fix category assignment - products are all lumped in CT Chemicals
# Rebuild categories from data.json names
cat_map = {}
for p in basic.get("products", []):
    pid = str(p.get("proddispid", ""))
    # We'll rely on the scraper's category_slug for assignment but fix names
    pass

# Fix: some products scraped from cooling-tower page but actually belong to other cats
# Re-assign based on prodname keywords
cat_keywords = {
    "Boiler Chemicals": ["boiler", "antiscalant", "ph booster", "benzalkonium"],
    "Cooling Tower Chemicals": ["cooling tower", "biocide", "dispersant", "metal dispersant"],
    "Hypochlorite Chemicals": ["hypochlorite", "bleaching powder", "calcium hypochlorite"],
    "Laboratory Chemicals": ["edta", "citric acid", "phosphoric", "sulphuric", "sodium bicarbonate", "sodium meta", "sodium bi", "caustic", "acid slurry", "glacial acetic", "potassium permanganate", "magnesium chloride", "soda ash"],
    "Liquid Products": ["liquid soap", "glacial acetic", "soda ash"],
}

def infer_category(prodname):
    pn = prodname.lower()
    if "boiler" in pn:
        return ("Boiler Chemicals", "boiler-chemicals")
    if "cooling tower" in pn:
        return ("Cooling Tower Chemicals", "cooling-tower-chemicals")
    if "hypochlorite" in pn or "bleaching" in pn:
        return ("Hypochlorite Chemicals", "hypochlorite-chemical")
    if "edta" in pn or "labsa" in pn or "sodium bicarbonate" in pn or "sodium meta" in pn:
        return ("Laboratory Chemicals", "laboratory-chemicals")
    if "soap" in pn or "glacial acetic" in pn:
        return ("Liquid Products", "liquid-products")
    return None

# Rebuild categories from scratch using name_map
all_cats = {}
for p in basic.get("products", []):
    pid = str(p.get("proddispid", ""))
    pname = p.get("prodname", "")
    # Find full detail
    detail = None
    for ap in full.get("all_products", []):
        if str(ap.get("proddispid", "")) == pid:
            detail = ap
            break
    
    cat_info = infer_category(pname)
    if not cat_info:
        cat_info = ("Other Products", "other-products")
    cat_name, cat_slug = cat_info
    
    prod_entry = {
        "proddispid": pid,
        "prodname": pname,
        "thumbnail": (detail or {}).get("thumbnail") or p.get("image", ""),
        "category": cat_name,
        "category_slug": cat_slug,
        "product_url": (detail or {}).get("product_url", ""),
        "description": (detail or {}).get("description", ""),
        "price": (detail or {}).get("price", ""),
        "images": (detail or {}).get("images", []),
        "specifications": (detail or {}).get("specifications", {}),
    }
    
    if cat_name not in all_cats:
        all_cats[cat_name] = {"name": cat_name, "slug": cat_slug, "products": []}
    all_cats[cat_name]["products"].append(prod_entry)

full["categories"] = list(all_cats.values())

with open("data_full.json", "w", encoding="utf-8") as f:
    json.dump(full, f, indent=2, ensure_ascii=False)

# Copy to frontend public/
os.makedirs("frontend/public", exist_ok=True)
shutil.copy("data_full.json", "frontend/public/data_full.json")
shutil.copy("data.json", "frontend/public/data.json")

print(f"Done. {len(all_cats)} categories, total products: {sum(len(c['products']) for c in all_cats.values())}")
for cat_name, cat in all_cats.items():
    print(f"  {cat_name}: {len(cat['products'])} products")
