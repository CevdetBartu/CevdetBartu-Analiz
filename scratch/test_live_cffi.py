from curl_cffi import requests; r = requests.get('https://arsiv.mackolik.com/AjaxHandlers/LiveHandler.ashx', impersonate='chrome110'); print(len(r.text)); print(r.text[:50])
