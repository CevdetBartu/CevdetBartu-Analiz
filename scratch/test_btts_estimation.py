import math

def solve_T(p_under):
    # Binary search to find T where e^-T (1 + T + T^2/2) = p_under
    low, high = 0.0, 10.0
    for _ in range(50):
        mid = (low + high) / 2
        p = math.exp(-mid) * (1 + mid + (mid**2) / 2)
        if p > p_under:
            low = mid
        else:
            high = mid
    return (low + high) / 2

def estimate_btts(o1, ox, o2, o_under, o_over):
    # Convert odds to probabilities (removing margin)
    sum_1x2 = 1/o1 + 1/ox + 1/o2
    p_home = (1/o1) / sum_1x2
    p_away = (1/o2) / sum_1x2
    
    sum_ou = 1/o_under + 1/o_over
    p_under = (1/o_under) / sum_ou
    
    # 1. Solve for T
    T = solve_T(p_under)
    
    # 2. Split T into lambda_1 and lambda_2 based on ratio of home/away probabilities
    # We use: lambda_1 / lambda_2 = sqrt(p_home / p_away)
    ratio = math.sqrt(p_home / p_away) if p_away > 0 else 1.0
    l2 = T / (ratio + 1)
    l1 = T - l2
    
    # 3. Calculate BTTS probability
    p_home_score = 1 - math.exp(-l1)
    p_away_score = 1 - math.exp(-l2)
    p_btts_yes = p_home_score * p_away_score
    p_btts_no = 1 - p_btts_yes
    
    # 4. Convert back to odds (applying same margin as 1X2 for realism)
    margin = 1.07 # typical margin
    btts_yes_odds = round(margin / p_btts_yes, 2)
    btts_no_odds = round(margin / p_btts_no, 2)
    
    return btts_yes_odds, btts_no_odds

# Let's test with the actual matches today:
# 1. Astana vs Dinamo City
# 1X2: 1.42, 3.90, 6.25 | OU: Under 1.83, Over 1.83 | Actual BTTS: Yes 2.00, No 1.73
print("1. Astana vs Dinamo City:")
print("  Estimated BTTS:", estimate_btts(1.42, 3.90, 6.25, 1.83, 1.83))
print("  Actual BTTS:   (2.00, 1.73)")

# 2. Inter Turku vs FK Sarajevo
# 1X2: 1.73, 3.60, 3.90 | OU: Under 1.91, Over 1.80 | Actual BTTS: Yes 1.83, No 1.83
print("2. Inter Turku vs FK Sarajevo:")
print("  Estimated BTTS:", estimate_btts(1.73, 3.60, 3.90, 1.91, 1.80))
print("  Actual BTTS:   (1.83, 1.83)")

# 3. Yelimay Semey vs FC Alashkert
# 1X2: 2.60, 3.40, 2.38 | OU: Under 1.90, Over 1.90 | Actual BTTS: Yes 1.73, No 2.00
print("3. Yelimay Semey vs FC Alashkert:")
print("  Estimated BTTS:", estimate_btts(2.60, 3.40, 2.38, 1.90, 1.90))
print("  Actual BTTS:   (1.73, 2.00)")
