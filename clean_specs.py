import json

NOISE_KEYS = [
    "description",
    "gst registration date",
    "legal status of firm",
    "nature of business",
    "number of employees",
    "annual turnover",
    "indiamart member since",
    "company ceo",
    "registered address",
    "banker",
    "total number of employees"
]

with open("data_full.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for cat in data.get("categories", []):
    for prod in cat.get("products", []):
        specs = prod.get("specifications", {})
        # Create a new dict without the noise keys
        clean_specs = {}
        for k, v in specs.items():
            if k.lower().strip() not in NOISE_KEYS:
                clean_specs[k] = v
        prod["specifications"] = clean_specs

with open("data_full.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

import shutil
shutil.copy("data_full.json", "frontend/public/data_full.json")
print("Cleaned up specifications noise.")
