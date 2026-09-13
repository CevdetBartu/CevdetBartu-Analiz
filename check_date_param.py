import requests

url = "https://arsiv.mackolik.com/Iddaa-Programi"
r = requests.get(url, params={"date": "13.09.2026"})
print("Length with date:", len(r.text))

r2 = requests.get(url)
print("Length without date:", len(r2.text))
