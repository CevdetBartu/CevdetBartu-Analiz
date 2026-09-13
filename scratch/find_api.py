import requests, re
r = requests.get("https://www.mackolik.com/iddaa-programi", headers={"User-Agent": "Mozilla/5.0"})
print(re.findall(r"vd\.mackolik\.com/[a-zA-Z0-9_\-\/]+", r.text))
