from curl_cffi import requests

url = "https://www.sofascore.com/_next/static/chunks/pages/_app-b05c230fee7bb6f7.js"
r = requests.get(url, impersonate="chrome")
text = r.text

idx = text.find("aG=")
if idx != -1:
    print("aG definition context:")
    print(text[idx:idx+250])
