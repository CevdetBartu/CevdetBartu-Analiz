import urllib.request
import urllib.error

try:
    resp = urllib.request.urlopen('http://127.0.0.1:8080/api/dogrulama/predictions')
    print("Success:", resp.read().decode('utf-8')[:300])
except urllib.error.HTTPError as e:
    print("HTTP Error code:", e.code)
    print("HTTP Error body:", e.read().decode('utf-8'))
except Exception as ex:
    print("General exception:", ex)
