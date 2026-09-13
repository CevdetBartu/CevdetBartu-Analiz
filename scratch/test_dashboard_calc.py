import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

url = "http://localhost:8080/api/matches/find-similar"

def get_dashboard_summary(home, away, h, d, a):
    payload = json.dumps({
        "oddsHome": h,
        "oddsDraw": d,
        "oddsAway": a,
        "homeTeam": home,
        "awayTeam": away,
        "oddsType": "CLOSING"
    }).encode('utf-8')

    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        
        ft_freq = {}
        for r in res:
            ft = r.get('match', {}).get('ftScore')
            if ft:
                ft_freq[ft] = ft_freq.get(ft, 0) + 1
                
        print(f"\n=======================================================")
        print(f"📊 MATCH: {home} v {away} (Odds: {h} / {d} / {a})")
        print(f"=======================================================")
        print(f"Top Scores Frequency:")
        for score, cnt in sorted(ft_freq.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"  Skor {score}: {cnt} Kere ({round((cnt/len(res))*100)}%)")

get_dashboard_summary("Grau", "Comerciantes Unidos", 2.10, 3.20, 3.10)
get_dashboard_summary("Atlanta United 2", "New York Red Bulls II", 2.15, 3.40, 3.00)
get_dashboard_summary("Real Madrid", "Barcelona", 1.85, 3.90, 4.20)
get_dashboard_summary("Bayern Munich", "Dortmund", 1.35, 5.50, 7.50)
