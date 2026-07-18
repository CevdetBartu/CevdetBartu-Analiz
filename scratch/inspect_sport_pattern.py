from curl_cffi import requests

url = "https://www.sofascore.com/_next/static/chunks/pages/_app-b05c230fee7bb6f7.js"
r = requests.get(url, impersonate="chrome")
text = r.text

idx = text.find("/sport/${e}/scheduled-events/")
if idx != -1:
    print(text[idx-50:idx+250])
