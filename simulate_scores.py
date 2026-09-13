import math

def get_true_probs(o1, ox, o2):
    margin = (1/o1) + (1/ox) + (1/o2)
    return (1/o1)/margin, (1/ox)/margin, (1/o2)/margin

def calc_raw_score(q1, qx, q2, m1, mx, m2):
    qp1, qpx, qp2 = get_true_probs(q1, qx, q2)
    mp1, mpx, mp2 = get_true_probs(m1, mx, m2)
    
    sq = 0
    sq += 0.50 * ((math.log(qp1) - math.log(mp1))**2)
    sq += 0.25 * ((math.log(qpx) - math.log(mpx))**2)
    sq += 0.25 * ((math.log(qp2) - math.log(mp2))**2)
    
    distance = math.sqrt(sq)
    return max(0.0, min(100.0, math.exp(-2.0 * distance) * 100.0))

print("Target: 1.16 - 5.10 - 6.47 (ABD)")
print("-" * 50)

matches = [
    ("Charlottesville (ABD, +5.0)", 1.12, 5.20, 8.70, 5.0),
    ("AFC Fylde (İngiltere, -4.0)", 1.13, 4.70, 7.05, -4.0),
    ("Kjelsas (Norveç, -4.0)", 1.13, 5.10, 6.28, -4.0),
    ("Marathon (Honduras, +1.5)", 1.14, 4.82, 8.85, 1.5)
]

for name, m1, mx, m2, bonus in matches:
    raw = calc_raw_score(1.16, 5.10, 6.47, m1, mx, m2)
    final = raw + bonus
    print(f"{name:30} | Raw: {raw:.1f} | Bonus: {bonus:+.1f} | Final: {final:.1f}")
