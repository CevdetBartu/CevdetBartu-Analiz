import urllib.request
import json
import ssl
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json"
}

def safe_fetch(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=4) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

# Let's search for an event ID on SofaScore or fetch today's events
today_data = safe_fetch("https://api.sofascore.com/api/v1/sport/football/events/scheduled/2026-08-12")
if not today_data or not today_data.get("events"):
    print("Could not fetch scheduled events from SofaScore API directly (likely 403 Cloudflare block)")
else:
    events = today_data.get("events", [])
    print(f"Total scheduled events fetched: {len(events)}")
    for ev in events[:5]:
        eid = ev.get("id")
        h_name = ev.get("homeTeam", {}).get("name")
        a_name = ev.get("awayTeam", {}).get("name")
        print(f"\n--- Event {eid}: {h_name} vs {a_name} ---")
        
        # Test Provider 1 (Bet365)
        p1 = safe_fetch(f"https://api.sofascore.com/api/v1/event/{eid}/odds/1/all")
        m1 = p1.get("markets", []) if p1 else []
        print(f"  Provider 1 (Bet365) markets count: {len(m1)}")
        
        # Test Featured Odds
        p_feat = safe_fetch(f"https://api.sofascore.com/api/v1/event/{eid}/odds/featured")
        m_feat = p_feat.get("featured", {}) if p_feat else {}
        print(f"  Featured Odds keys: {list(m_feat.keys()) if isinstance(m_feat, dict) else len(m_feat)}")
