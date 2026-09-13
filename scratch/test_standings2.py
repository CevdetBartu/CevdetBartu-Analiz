import requests; print(len(requests.get('https://arsiv.mackolik.com/Standings/Standings.aspx?id=1', headers={'User-Agent': 'Mozilla/5.0'}).text))
