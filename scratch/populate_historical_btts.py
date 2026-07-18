import sqlite3
import math

def solve_T(p_under):
    # Fast binary search
    low, high = 0.0, 10.0
    for _ in range(25):
        mid = (low + high) / 2
        p = math.exp(-mid) * (1 + mid + (mid**2) / 2)
        if p > p_under:
            low = mid
        else:
            high = mid
    return (low + high) / 2

def estimate_btts(o1, ox, o2, o_under, o_over):
    try:
        sum_1x2 = 1/o1 + 1/ox + 1/o2
        p_home = (1/o1) / sum_1x2
        p_away = (1/o2) / sum_1x2
        p_under = (1/o_under) / (1/o_under + 1/o_over)
        
        T = solve_T(p_under)
        ratio = math.sqrt(p_home / p_away) if p_away > 0 else 1.0
        l2 = T / (ratio + 1)
        l1 = T - l2
        
        p_btts_yes = (1 - math.exp(-l1)) * (1 - math.exp(-l2))
        p_btts_yes += 0.06
        p_btts_yes = max(0.15, min(0.85, p_btts_yes))
        p_btts_no = 1.0 - p_btts_yes
        
        margin = 1.03
        kg_var = round(margin / p_btts_yes, 2)
        kg_yok = round(margin / p_btts_no, 2)
        return kg_var, kg_yok
    except Exception:
        return None, None

def main():
    db_path = 'scripts/scraper/gecmis_maclar.db'
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get all matches where kg_var is NULL and other odds are present
    cur.execute("""
        SELECT id, oran_1, oran_x, oran_2, alt_orani, ust_orani 
        FROM gecmis_maclar 
        WHERE kg_var IS NULL AND oran_1 IS NOT NULL AND alt_orani IS NOT NULL AND ust_orani IS NOT NULL
    """)
    rows = cur.fetchall()
    print(f"Found {len(rows)} matches to update.")
    
    updates = []
    for r in rows:
        match_id, o1, ox, o2, alt, ust = r
        kg_var, kg_yok = estimate_btts(o1, ox, o2, alt, ust)
        if kg_var is not None and kg_yok is not None:
            updates.append((kg_var, kg_yok, match_id))
            
    print(f"Prepared {len(updates)} updates. Executing...")
    
    # Execute batch update in a single transaction
    cur.executemany("""
        UPDATE gecmis_maclar 
        SET kg_var = ?, kg_yok = ? 
        WHERE id = ?
    """, updates)
    conn.commit()
    print("Update completed successfully!")
    
    # Check a few updated matches
    cur.execute("""
        SELECT ev_sahibi, deplasman, oran_1, oran_x, oran_2, alt_orani, ust_orani, kg_var, kg_yok 
        FROM gecmis_maclar 
        WHERE kg_var IS NOT NULL AND kaynak = 'football-data.co.uk'
        LIMIT 5
    """)
    for row in cur.fetchall():
        print("Updated Row:", row)
        
    conn.close()

if __name__ == '__main__':
    main()
