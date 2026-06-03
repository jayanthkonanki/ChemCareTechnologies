import json

def assign_unit(prodname, desc):
    text = (prodname + " " + desc).lower()
    if any(k in text for k in ["liquid", "oil", "acid", "hypochlorite"]):
        if "powder" not in text and "flakes" not in text:
            return "Liter"
    if any(k in text for k in ["powder", "flakes", "ash", "chemical", "crystal"]):
        return "Kg"
    return "Kg" # default

with open("data_full.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for cat in data.get("categories", []):
    for prod in cat.get("products", []):
        unit = assign_unit(prod.get("prodname", ""), prod.get("description", ""))
        prod["unit"] = unit

with open("data_full.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

import shutil
shutil.copy("data_full.json", "frontend/public/data_full.json")
print("Units updated.")
