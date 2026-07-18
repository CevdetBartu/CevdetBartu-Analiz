from curl_cffi import requests

url = "https://www.sofascore.com/"
r = requests.get(url, impersonate="chrome")
text = r.text
print("HTML length:", len(text))
print("Nürnberg in HTML:", "Nürnberg" in text or "nurnberg" in text.lower())
print("Lustenau in HTML:", "Lustenau" in text or "lustenau" in text.lower())
print("Friendly in HTML:", "Friendly" in text or "friendly" in text.lower())
