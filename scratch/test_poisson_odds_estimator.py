import math
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def estimate_market_odds(o1: float, ox: float, o2: float):
    if not o1 or not ox or not o2 or o1 <= 1 or ox <= 1 or o2 <= 1:
        return None
    
    # 1. Devig probabilities
    raw_sum = (1.0 / o1) + (1.0 / ox) + (1.0 / o2)
    p1 = (1.0 / o1) / raw_sum
    px = (1.0 / ox) / raw_sum
    p2 = (1.0 / o2) / raw_sum
    
    # 2. Estimate expected goals (lambda_h, lambda_a)
    # Total goals estimation based on match odds profile
    avg_fav_odds = min(o1, o2)
    total_lambda = 2.4 + max(0, (2.5 - avg_fav_odds) * 0.3)
    
    # Share of expected goals
    lambda_h = total_lambda * (p1 + 0.5 * px)
    lambda_a = total_lambda * (p2 + 0.5 * px)
    
    def poisson(k, lam):
        return (math.pow(lam, k) * math.exp(-lam)) / math.factorial(k)
    
    # Calculate score matrix probabilities up to 8 goals
    prob_under_25 = 0.0
    prob_under_35 = 0.0
    prob_btts_no = 0.0
    
    for h in range(8):
        for a in range(8):
            p_score = poisson(h, lambda_h) * poisson(a, lambda_a)
            if h + a < 2.5:
                prob_under_25 += p_score
            if h + a < 3.5:
                prob_under_35 += p_score
            if h == 0 or a == 0:
                prob_btts_no += p_score
                
    prob_over_25 = max(0.05, 1.0 - prob_under_25)
    prob_over_35 = max(0.05, 1.0 - prob_under_35)
    prob_btts_yes = max(0.05, 1.0 - prob_btts_no)
    
    margin = 1.05 # 5% bookmaker margin
    
    return {
        "alt_orani": round(margin / prob_under_25, 2),
        "ust_orani": round(margin / prob_over_25, 2),
        "alt_orani_35": round(margin / prob_under_35, 2),
        "ust_orani_35": round(margin / prob_over_35, 2),
        "kg_var": round(margin / prob_btts_yes, 2),
        "kg_yok": round(margin / prob_btts_no, 2),
    }

# Test for Atletico GO vs Flamengo (7.61 - 4.40 - 1.45)
odds = estimate_market_odds(7.61, 4.40, 1.45)
print("Estimated odds for Atletico GO (7.61) vs Flamengo (1.45):")
print("  2.5 Alt / Üst:", odds["alt_orani"], "/", odds["ust_orani"])
print("  3.5 Alt / Üst:", odds["alt_orani_35"], "/", odds["ust_orani_35"])
print("  KG Var / Yok :", odds["kg_var"], "/", odds["kg_yok"])
