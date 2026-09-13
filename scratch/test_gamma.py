import math

def get_true_probs(o1, ox, o2):
    margin = (1/o1) + (1/ox) + (1/o2)
    return {"p1": (1/o1)/margin, "px": (1/ox)/margin, "p2": (1/o2)/margin}

def calc_score(q1, qx, q2, m1, mx, m2, gamma=4.0):
    q_probs = get_true_probs(q1, qx, q2)
    m_probs = get_true_probs(m1, mx, m2)
    
    sq = 0
    sq += math.pow(math.log(q_probs["p1"]) - math.log(m_probs["p1"]), 2)
    sq += math.pow(math.log(q_probs["px"]) - math.log(m_probs["px"]), 2)
    sq += math.pow(math.log(q_probs["p2"]) - math.log(m_probs["p2"]), 2)
    
    active_dims = 3.0
    distance = math.sqrt(sq / active_dims)
    score = math.exp(-gamma * distance) * 100.0
    return score

print("Identical:", calc_score(2.0, 3.0, 3.0, 2.0, 3.0, 3.0))
print("Slight difference (2.0 vs 2.1):", calc_score(2.0, 3.0, 3.0, 2.1, 3.1, 2.9))
print("Slight difference (2.0 vs 2.2):", calc_score(2.0, 3.0, 3.0, 2.2, 3.2, 2.8))
print("Slight difference (1.8 vs 1.9):", calc_score(1.8, 3.2, 3.5, 1.9, 3.1, 3.4))

