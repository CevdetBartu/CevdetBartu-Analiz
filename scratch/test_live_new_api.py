import requests, re; html = requests.get('https://www.mackolik.com/canli-sonuclar', headers={'User-Agent': 'Mozilla/5.0'}).text; print(set(re.findall(r'https://[a-zA-Z0-9-]+\.mackolik\.com', html)))
