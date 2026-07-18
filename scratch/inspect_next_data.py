from curl_cffi import requests
from bs4 import BeautifulSoup
import json

url = "https://www.sofascore.com/"
r = requests.get(url, impersonate="chrome")
soup = BeautifulSoup(r.text, 'html.parser')
tag = soup.find('script', id='__NEXT_DATA__')
if tag:
    data = json.loads(tag.string)
    # Print keys of props and pageProps
    print("Props Keys:", list(data.get("props", {}).keys()))
    pageProps = data.get("props", {}).get("pageProps", {})
    print("pageProps Keys:", list(pageProps.keys()))
    # Print details of pageProps
    for k, v in pageProps.items():
        if isinstance(v, dict):
            print(f"Key '{k}' subkeys:", list(v.keys()))
        else:
            print(f"Key '{k}':", str(v)[:200])
else:
    print("No NEXT_DATA found")
