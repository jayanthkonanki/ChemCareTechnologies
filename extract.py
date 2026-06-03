import json
import re
import urllib.request

url = 'https://www.indiamart.com/chemcaretechnologies/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
except Exception as e:
    print(f"Error fetching: {e}")
    exit(1)

# Extract top_prd JSON
match = re.search(r"top_prd\s*=\s*'(\[.*?\])';", html)
products = []
if match:
    try:
        products = json.loads(match.group(1))
    except Exception as e:
        print(f"JSON decode error: {e}")

data = {
    "company": {
        "name": "Chem Care Technologies",
        "location": "Kanuru, Vijayawada",
        "rating": "4.2",
        "years": "13 yrs",
        "trust_seal": True,
        "description": "Trader - Wholesaler / Distributor of Boiler Chemicals, Laboratory Chemicals & Cooling Tower Chemicals from Vijayawada, Andhra Pradesh, India"
    },
    "products": products
}

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Data extracted successfully to data.json")
