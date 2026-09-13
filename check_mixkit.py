import urllib.request

urls = [
    "https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3",
    "https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3",
    "https://assets.mixkit.co/sfx/preview/mixkit-clear-announce-tones-2861.mp3",
    "https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3"
]

for u in urls:
    try:
        res = urllib.request.urlopen(u)
        print(f"OK: {u} ({len(res.read())} bytes)")
    except Exception as e:
        print(f"ERR: {u} {e}")
