from curl_cffi import requests; r = requests.get('https://arsiv.mackolik.com/Standings/Standings.aspx?id=1', impersonate='chrome110'); print(len(r.text)); print(r.text[:100])
