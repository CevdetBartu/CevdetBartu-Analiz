from curl_cffi import requests
import datetime

today_dt = datetime.date.today()
print(f"System date today: {today_dt}")

dates_to_test = [
    today_dt.strftime("%Y-%m-%d"),
    "2024-07-24",
    "2024-07-23",
    "2026-07-24",
]

for dt_str in dates_to_test:
    url = f"https://api.sofascore.com/api/v1/sport/football/scheduled-events/{dt_str}"
    resp = requests.get(
        url,
        impersonate="chrome",
        headers={"Referer": "https://www.sofascore.com/"}
    )
    if resp.status_code == 200:
        events = resp.json().get("events", [])
        print(f"OK: {dt_str} -> {len(events)} events found!")
    else:
        print(f"FAIL: {dt_str} -> Status {resp.status_code}")
