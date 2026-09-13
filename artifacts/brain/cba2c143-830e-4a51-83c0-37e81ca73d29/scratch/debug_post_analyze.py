import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# We first get a match from today-matches
url_today = "http://127.0.0.1:5173/api/today-matches"
try:
    with urllib.request.urlopen(url_today, context=ctx, timeout=5) as response:
        data = json.loads(response.read().decode("utf-8"))
        matches = data.get("matches", [])
        if not matches:
            print("No matches to analyze.")
            exit(0)
        
        match = matches[0]
        print(f"Testing with match: {match.get('ev_sahibi')} vs {match.get('deplasman')}")
        
        # Call find-similar
        url_sim = "http://127.0.0.1:5173/api/matches/find-similar"
        sim_payload = {
            "oddsHome": match.get("oran_1"),
            "oddsDraw": match.get("oran_x"),
            "oddsAway": match.get("oran_2"),
            "altOdds": match.get("alt_orani"),
            "ustOdds": match.get("ust_orani"),
            "varOdds": match.get("kg_var"),
            "yokOdds": match.get("kg_yok"),
            "league": match.get("lig")
        }
        
        req_sim = urllib.request.Request(
            url_sim,
            data=json.dumps(sim_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        
        with urllib.request.urlopen(req_sim, context=ctx, timeout=5) as sim_res:
            ref_matches_wrapped = json.loads(sim_res.read().decode("utf-8"))
            print(f"Found reference matches: {len(ref_matches_wrapped)}")
            
            # Extract ref matches and force id to string
            ref_matches = []
            for r in ref_matches_wrapped:
                m = r.get("match", {})
                if m.get("id") is not None:
                    m["id"] = str(m["id"])
                ref_matches.append(m)
            
            # Now let's try posting to analyze
            url_analyze = "http://127.0.0.1:5173/api/experimental/analyze"
            analyze_payload = {
                "targetMatch": {
                    "homeTeam": match.get("ev_sahibi"),
                    "awayTeam": match.get("deplasman"),
                    "oddsHome": match.get("oran_1"),
                    "oddsDraw": match.get("oran_x"),
                    "oddsAway": match.get("oran_2"),
                    "altOdds": match.get("alt_orani"),
                    "ustOdds": match.get("ust_orani"),
                    "varOdds": match.get("kg_var"),
                    "yokOdds": match.get("kg_yok"),
                    "league": match.get("lig")
                },
                "referenceMatches": ref_matches
            }
            
            req_analyze = urllib.request.Request(
                url_analyze,
                data=json.dumps(analyze_payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            
            try:
                with urllib.request.urlopen(req_analyze, context=ctx, timeout=5) as analyze_res:
                    print("Analyze success! Response:")
                    res_body = json.loads(analyze_res.read().decode("utf-8"))
                    print("  Guvenlik Skoru:", res_body.get("analiz_ozet", {}).get("guvenlik_skoru"))
                    print("  Lambda Home:", res_body.get("lambda_h"))
                    print("  Lambda Away:", res_body.get("lambda_a"))
                    print("  Score Matrix Cells Count:", len(res_body.get("score_matrix", [])))
                    print("  Kelly Recommendations Count:", len(res_body.get("kelly_recommendations", [])))
            except urllib.error.HTTPError as e:
                print(f"Analyze failed with HTTP {e.code}")
                print("Error body:", e.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)
