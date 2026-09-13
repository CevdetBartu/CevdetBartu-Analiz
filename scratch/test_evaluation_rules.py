import sqlite3

def evaluate_prediction(mac_skoru, devre_skoru, pred):
    if not mac_skoru or ":" not in mac_skoru or "?" in mac_skoru:
        return "BEKLENİYOR"
    
    try:
        h, a = map(int, mac_skoru.split(":"))
    except Exception:
        return "BEKLENİYOR"
    
    total_goals = h + a
    is_btts = h > 0 and a > 0
    
    ht_h, ht_a, ht_goals = 0, 0, 0
    has_ht = False
    if devre_skoru and ":" in devre_skoru and "?" not in devre_skoru:
        try:
            ht_h, ht_a = map(int, devre_skoru.split(":"))
            ht_goals = ht_h + ht_a
            has_ht = True
        except Exception:
            pass
            
    clean_pred = pred.strip().upper()
    
    if clean_pred == "KG VAR":
        return "TUTTU" if is_btts else "TUTMADI"
    if clean_pred == "2.5 ÜST" or clean_pred == "2.5 UST":
        return "TUTTU" if total_goals >= 3 else "TUTMADI"
    if "İY 1.5 ÜST" in clean_pred or "IY 1.5 UST" in clean_pred:
        if has_ht:
            return "TUTTU" if ht_goals >= 2 else "TUTMADI"
        return "TUTTU" if total_goals >= 2 else "TUTMADI"
    if "3.5 ÜST" in clean_pred or "3.5 UST" in clean_pred:
        return "TUTTU" if total_goals >= 4 else "TUTMADI"
    if "KG VAR & 2.5 ÜST" in clean_pred or "KG VAR & 2.5 UST" in clean_pred:
        return "TUTTU" if (is_btts and total_goals >= 3) else "TUTMADI"
    if "2/1" in clean_pred or "İY 2 / MS 1" in clean_pred:
        if has_ht:
            return "TUTTU" if (ht_a > ht_h and h > a) else "TUTMADI"
        if h <= a:
            return "TUTMADI" # Home didn't win FT -> 2/1 IMPOSSIBLE -> TUTMADI
        return "TUTMADI"
    if "1/2" in clean_pred or "İY 1 / MS 2" in clean_pred:
        if has_ht:
            return "TUTTU" if (ht_h > ht_a and a > h) else "TUTMADI"
        if a <= h:
            return "TUTMADI" # Away didn't win FT -> 1/2 IMPOSSIBLE -> TUTMADI
        return "TUTMADI"
        
    return "BEKLENİYOR"

# Test samples from user screenshot
test_cases = [
    ("4:2", "1:2", "İY 2 / MS 1"),
    ("4:2", None, "İY 2 / MS 1"),
    ("2:5", "1:2", "İY 2 / MS 1"),
    ("2:5", None, "İY 2 / MS 1"),
    ("0:1", "0:0", "İY 1 / MS 2"),
    ("0:1", None, "İY 1 / MS 2"),
    ("3:0", "1:0", "2.5 ÜST"),
    ("1:0", "0:0", "İY 1.5 ÜST"),
]

for score, ht, pred in test_cases:
    res = evaluate_prediction(score, ht, pred)
    print(f"Match Score: {score} (HT: {ht}) | Pred: {pred} => STATUS: {res}")
