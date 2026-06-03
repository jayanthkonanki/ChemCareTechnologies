import urllib.request, re, gzip, zlib, io

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    "Accept-Encoding": "gzip, deflate",
    "Accept": "text/html,*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
}

def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    r = urllib.request.urlopen(req, timeout=20)
    raw = r.read()
    enc = r.info().get("Content-Encoding", "")
    if enc == "gzip":
        raw = gzip.decompress(raw)
    elif enc == "deflate":
        raw = zlib.decompress(raw)
    for e in ["utf-8", "latin-1"]:
        try:
            return raw.decode(e)
        except:
            pass
    return raw.decode("utf-8", errors="replace")

text = fetch("https://www.indiamart.com/chemcaretechnologies/products-and-services.html")
print("Length:", len(text))
links = re.findall(r'href="(?:https://www\.indiamart\.com)?/chemcaretechnologies/([\w-]+)\.html', text)
print("Category links:", list(dict.fromkeys(links))[:30])
pids = re.findall(r"#(\d{8,})", text)
print("Product IDs:", list(dict.fromkeys(pids))[:20])
with open("debug_page.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Saved to debug_page.html")
print("First 500:", text[:500])
