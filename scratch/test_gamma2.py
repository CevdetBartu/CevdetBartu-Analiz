import math

def calc_score(q1, qx, q2, m1, mx, m2, qa, qu, ma, mu, gamma=4.0):
    def get_true_probs(o1, ox, o2):
        margin = (1/o1) + (1/ox) + (1/o2)
        return {"p1": (1/o1)/margin, "px": (1/ox)/margin, "p2": (1/o2)/margin}
    
    def get_true_probs_2(o1, o2):
        margin = (1/o1) + (1/o2)
        return {"p1": (1/o1)/margin, "p2": (1/o2)/margin}

    q_probs = get_true_probs(q1, qx, q2)
    m_probs = get_true_probs(m1, mx, m2)
    
    sq = 0
    sq += math.pow(math.log(q_probs["p1"]) - math.log(m_probs["p1"]), 2)
    sq += math.pow(math.log(q_probs["px"]) - math.log(m_probs["px"]), 2)
    sq += math.pow(math.log(q_probs["p2"]) - math.log(m_probs["p2"]), 2)
    
    q_au = get_true_probs_2(qa, qu)
    m_au = get_true_probs_2(ma, mu)
    
    sq += math.pow(math.log(q_au["p1"]) - math.log(m_au["p1"]), 2)
    sq += math.pow(math.log(q_au["p2"]) - math.log(m_au["p2"]), 2)
    
    active_dims = 5.0
    distance = math.sqrt(sq / active_dims)
    score = math.exp(-gamma * distance) * 100.0
    return score

print("Identical:", calc_score(2.0, 3.0, 3.0, 2.0, 3.0, 3.0, 1.8, 1.8, 1.8, 1.8))
print("Only 1X2 tiny diff:", calc_score(2.0, 3.0, 3.0, 2.1, 3.1, 2.9, 1.8, 1.8, 1.8, 1.8))
print("Both 1X2 and AU tiny diff:", calc_score(2.0, 3.0, 3.0, 2.1, 3.1, 2.9, 1.8, 1.8, 1.7, 1.9))

