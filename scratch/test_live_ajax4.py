import requests; open('scratch/livehandler.txt', 'w', encoding='utf-8').write(requests.get('https://arsiv.mackolik.com/AjaxHandlers/LiveHandler.ashx', headers={'User-Agent': 'Mozilla/5.0'}).text)
