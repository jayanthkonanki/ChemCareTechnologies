#!/usr/bin/env python3
"""
Chem Care Technologies - Full IndiaMart scraper
Extracts: company profile + all products with full details (category, description, specs, images)
"""

import json
import re
import time
import urllib.request
import urllib.parse
from urllib.error import URLError

BASE = "https://www.indiamart.com/chemcaretechnologies"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "identity",
    "Connection": "keep-alive",
}

CATEGORY_PAGES = [
    ("boiler-chemicals", "Boiler Chemicals"),
    ("cooling-tower-chemicals", "Cooling Tower Chemicals"),
    ("hypochlorite-chemical", "Hypochlorite Chemicals"),
    ("laboratory-chemicals", "Laboratory Chemicals"),
    ("laboratory-chemical", "Laboratory Chemical"),
    ("liquid-products", "Liquid Products"),
    ("bleaching-powder", "Bleaching Powder"),
]


def fetch(url, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            resp = urllib.request.urlopen(req, timeout=15)
            raw = resp.read()
            # Try to decode
            for enc in ["utf-8", "latin-1", "cp1252"]:
                try:
                    return raw.decode(enc)
                except Exception:
                    continue
        except URLError as e:
            if i == retries - 1:
                print(f"  ERROR fetching {url}: {e}")
                return ""
            time.sleep(2)
    return ""


def extract_text(html, pattern, group=1, default=""):
    m = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
    if m:
        try:
            return re.sub(r"<[^>]+>", "", m.group(group)).strip()
        except:
            return default
    return default


def parse_company_profile(html):
    company = {
        "name": "Chem Care Technologies",
        "location": "Kanuru, Vijayawada, Andhra Pradesh, India",
        "rating": "4.2",
        "rating_count": "38",
        "years": "13 yrs",
        "trust_seal": True,
        "gst": "37**********1Z6",
        "response_rate": "85%",
        "business_type": "Trader - Wholesaler / Distributor",
        "description": "Chem Care Technologies is a leading Trader, Wholesaler and Distributor of Boiler Chemicals, Laboratory Chemicals & Cooling Tower Chemicals from Vijayawada, Andhra Pradesh, India.",
        "logo": "https://5.imimg.com/data5/SELLER/Logo/2025/5/509401904/ZB/OI/PC/6407096/logo02.jpg",
        "indiamart_url": "https://www.indiamart.com/chemcaretechnologies/",
    }

    # Override with scraped data where possible
    rating_m = re.search(r'"OVERALL_RATING"\s*:\s*"([^"]+)"', html)
    if rating_m:
        company["rating"] = rating_m.group(1)

    count_m = re.search(r'"TOTAL_RATINGS_COUNT"\s*:\s*"([^"]+)"', html)
    if count_m:
        company["rating_count"] = count_m.group(1)

    return company


def parse_products_from_homepage(html):
    """Extract products list from the embedded top_prd JSON in homepage"""
    m = re.search(r"top_prd\s*=\s*'(\[.*?\])';", html, re.DOTALL)
    if not m:
        print("  WARNING: top_prd not found in homepage")
        return []
    try:
        return json.loads(m.group(1))
    except Exception as e:
        print(f"  ERROR parsing top_prd: {e}")
        return []


def parse_category_page(html, category_name, category_slug):
    """Extract products from a category listing page"""
    products = []
    # Extract product blocks - look for product display ID anchors
    prod_blocks = re.findall(
        r'id="(\d+)"[^>]*>.*?<h2[^>]*>(.*?)</h2>.*?(?:src|data-src)="(https://[^"]+imimg\.com[^"]+)"',
        html, re.DOTALL
    )
    
    seen = set()
    for pid, pname, pimg in prod_blocks:
        pid = pid.strip()
        pname = re.sub(r"<[^>]+>", "", pname).strip()
        if pid in seen or not pname:
            continue
        seen.add(pid)
        products.append({
            "proddispid": pid,
            "prodname": pname,
            "image": pimg.split("?")[0],
            "category": category_name,
            "category_slug": category_slug,
        })
    return products


def scrape_product_detail(prod_id, prod_name, category, category_slug):
    """Scrape individual product page for full details"""
    # IndiaMart product URLs use the display ID
    url = f"https://www.indiamart.com/proddetail/{prod_id}.html"
    html = fetch(url)
    if not html:
        return {}

    detail = {
        "proddispid": prod_id,
        "prodname": prod_name,
        "category": category,
        "category_slug": category_slug,
        "product_url": url,
    }

    # Description
    desc = extract_text(html, r'<div[^>]*class="[^"]*prd-desc[^"]*"[^>]*>(.*?)</div>')
    if not desc:
        desc = extract_text(html, r'Product Description[^<]*</[^>]+>\s*<[^>]+>(.*?)</[^>]+>')
    detail["description"] = desc

    # Price
    price_m = re.search(r'(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d+)?)', html)
    detail["price"] = price_m.group(0).strip() if price_m else ""

    # All images
    imgs = re.findall(r'"(https://[^"]+imimg\.com[^"]+(?:jpg|jpeg|png|webp))"', html)
    imgs = list(dict.fromkeys([i.split("?")[0] for i in imgs if "250x250" not in i and "120x120" not in i]))[:5]
    detail["images"] = imgs

    # Main image (250x250 thumbnail)
    thumb = re.search(r'(https://[^"]+imimg\.com[^"]+250x250[^"]*(?:jpg|jpeg|png|webp))"', html)
    detail["thumbnail"] = thumb.group(1) if thumb else (imgs[0] if imgs else "")

    # Specifications table
    specs = {}
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL)
    for row in rows:
        cells = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.DOTALL)
        cells = [re.sub(r"<[^>]+>", "", c).strip() for c in cells]
        cells = [c for c in cells if c]
        if len(cells) == 2:
            specs[cells[0]] = cells[1]
    detail["specifications"] = specs

    return detail


def main():
    print("=== Chem Care Technologies - IndiaMart Full Scraper ===\n")

    # 1. Fetch homepage
    print("Fetching homepage...")
    homepage = fetch(BASE + "/")
    company = parse_company_profile(homepage)
    base_products = parse_products_from_homepage(homepage)
    print(f"  Found {len(base_products)} products in homepage JSON")

    # 2. Build category map from homepage products
    # Map proddispid -> basic info from homepage
    id_map = {str(p.get("proddispid", "")): p for p in base_products}

    # 3. Scrape each category page for structured product list
    print("\nScraping category pages...")
    all_products_by_category = {}
    category_products_meta = []  # list of (id, name, category, slug)

    for slug, name in CATEGORY_PAGES:
        url = f"{BASE}/{slug}.html"
        print(f"  -> {name} ({slug})")
        html = fetch(url)
        time.sleep(0.5)

        # Find product display IDs from anchor tags
        cat_ids = re.findall(r'href="[^"]*#(\d{11,})"', html)
        cat_ids = list(dict.fromkeys(cat_ids))

        cat_prods = []
        for pid in cat_ids:
            base = id_map.get(pid, {})
            cat_prods.append({
                "proddispid": pid,
                "prodname": base.get("prodname", f"Product {pid}"),
                "thumbnail": base.get("image", ""),
                "category": name,
                "category_slug": slug,
            })
            category_products_meta.append((pid, base.get("prodname", f"Product {pid}"), name, slug))

        if not cat_prods:
            # Fallback: use homepage products matching this category
            for p in base_products:
                hp_slug = slug.replace("-", " ").lower()
                pn = p.get("prodname", "").lower()
                if any(word in pn for word in hp_slug.split()):
                    cat_prods.append({
                        "proddispid": str(p.get("proddispid", "")),
                        "prodname": p.get("prodname", ""),
                        "thumbnail": p.get("image", ""),
                        "category": name,
                        "category_slug": slug,
                    })
                    category_products_meta.append((str(p.get("proddispid", "")), p.get("prodname", ""), name, slug))

        all_products_by_category[name] = cat_prods
        print(f"     {len(cat_prods)} products")

    # 4. Scrape individual product detail pages
    print(f"\nScraping {len(category_products_meta)} product detail pages...")
    detailed_products = {}

    seen_ids = set()
    for pid, pname, cat, slug in category_products_meta:
        if pid in seen_ids:
            continue
        seen_ids.add(pid)
        print(f"  -> {pname[:50]}...")
        detail = scrape_product_detail(pid, pname, cat, slug)
        if detail:
            # Merge thumbnail from base if detail doesn't have one
            base = id_map.get(pid, {})
            if not detail.get("thumbnail") and base.get("image"):
                detail["thumbnail"] = base["image"]
            detailed_products[pid] = detail
        time.sleep(0.5)

    # 5. Build final structured output
    # Enrich category products with full details
    for cat_name, prods in all_products_by_category.items():
        for prod in prods:
            pid = prod["proddispid"]
            if pid in detailed_products:
                prod.update(detailed_products[pid])

    # Also include products from homepage not caught by category pages
    all_captured_ids = {p["proddispid"] for prods in all_products_by_category.values() for p in prods}
    uncategorized = []
    for p in base_products:
        pid = str(p.get("proddispid", ""))
        if pid not in all_captured_ids:
            detail = detailed_products.get(pid, {})
            uncategorized.append({
                "proddispid": pid,
                "prodname": p.get("prodname", ""),
                "thumbnail": detail.get("thumbnail") or p.get("image", ""),
                "category": "Other Products",
                "category_slug": "other-products",
                **detail,
            })
    if uncategorized:
        all_products_by_category["Other Products"] = uncategorized

    output = {
        "company": company,
        "categories": [
            {
                "name": cat,
                "slug": CATEGORY_PAGES[i][0] if i < len(CATEGORY_PAGES) else "other-products",
                "products": prods,
            }
            for i, (cat, prods) in enumerate(all_products_by_category.items())
        ],
        "all_products": list(detailed_products.values()),
        "meta": {
            "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "source_url": BASE + "/",
            "total_categories": len(all_products_by_category),
            "total_products": len(detailed_products),
        }
    }

    with open("data_full.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n=== Done ===")
    print(f"  Categories: {output['meta']['total_categories']}")
    print(f"  Products with full detail: {output['meta']['total_products']}")
    print(f"  Output: data_full.json")


if __name__ == "__main__":
    main()
