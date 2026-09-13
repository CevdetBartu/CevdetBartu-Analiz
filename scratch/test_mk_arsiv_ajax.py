import requests; r = requests.get('https://arsiv.mackolik.com/AjaxHandlers/IddaaHandler.ashx?type=morebets&id=4543128', headers={'User-Agent': 'Mozilla/5.0'}); print(r.status_code, r.text[:200])
