import requests; r = requests.get('https://arsiv.mackolik.com/AjaxHandlers/IddaaHandler.ashx?type=morebets&id=4543128', headers={'User-Agent': 'Mozilla/5.0'}); print('Kar' in r.text, 'Gol' in r.text)
