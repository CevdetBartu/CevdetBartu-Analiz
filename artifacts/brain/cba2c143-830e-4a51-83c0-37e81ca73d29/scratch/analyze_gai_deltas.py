import json
import os

LOG_FILE = "c:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub\\scripts\\scraper\\live_goal_monitoring_log.json"

with open(LOG_FILE, "r", encoding="utf-8") as f:
    logs = json.load(f)

# Let's count how many goals occurred when the scoring team was having what exact absolute stats
# specifically inside the valid_logs (goals with statistics)
valid_logs = []
for entry in logs:
    pre_state = entry.get("pre_goal_state", {})
    stats = pre_state.get("stats", {})
    total_shots = stats.get("shots_total_h", 0) + stats.get("shots_total_a", 0)
    corners = stats.get("corners_h", 0) + stats.get("corners_a", 0)
    if total_shots > 0 or corners > 0:
        valid_logs.append(entry)

print(f"Total goals with valid statistics: {len(valid_logs)}")

# Let's check GAI at the moment of the goal
# GAI (act) was computed by delta_tgi / window_norm
# where delta_tgi is the delta in the last 10 minutes (or elapsed minutes)
# Let's analyze what the delta in stats was in the 10 minutes prior to the goal.

deltas_list = []

for entry in valid_logs:
    history = entry.get("pre_goal_history", [])
    scoring_team = entry.get("scoring_team")
    if not history or len(history) < 2:
        continue
    
    first = history[0]
    last = history[-1]
    
    elapsed_minutes = max(1, last["minute"] - first["minute"])
    window_norm = max(10, elapsed_minutes)
    
    # Calculate absolute delta in stats
    s_f = first.get("stats", {})
    s_l = last.get("stats", {})
    
    sh_f_t = s_f.get("shots_target_h" if scoring_team == "home" else "shots_target_a", 0)
    sh_l_t = s_l.get("shots_target_h" if scoring_team == "home" else "shots_target_a", 0)
    
    sh_f_o = s_f.get("shots_off_h" if scoring_team == "home" else "shots_off_a", 0)
    sh_l_o = s_l.get("shots_off_h" if scoring_team == "home" else "shots_off_a", 0)
    
    cr_f = s_f.get("corners_h" if scoring_team == "home" else "corners_a", 0)
    cr_l = s_l.get("corners_h" if scoring_team == "home" else "corners_a", 0)
    
    touches_box_f = s_f.get("touches_in_box_h" if scoring_team == "home" else "touches_in_box_a", 0)
    touches_box_l = s_l.get("touches_in_box_h" if scoring_team == "home" else "touches_in_box_a", 0)
    
    ft_f = s_f.get("final_third_h" if scoring_team == "home" else "final_third_a", 0)
    ft_l = s_l.get("final_third_h" if scoring_team == "home" else "final_third_a", 0)

    delta_target = max(0, sh_l_t - sh_f_t)
    delta_off = max(0, sh_l_o - sh_f_o)
    delta_corners = max(0, cr_l - cr_f)
    delta_touches = max(0, touches_box_l - touches_box_f)
    delta_ft = max(0, ft_l - ft_f)
    
    tgi = (delta_target * 15) + (delta_off * 6) + (delta_corners * 5) + (delta_touches * 3) + (delta_ft * 1.5)
    act = tgi / window_norm
    
    deltas_list.append({
        "match": f"{entry['homeTeam']} - {entry['awayTeam']}",
        "minute": entry["minute"],
        "scoring_team": scoring_team,
        "delta_target": delta_target,
        "delta_off": delta_off,
        "delta_corners": delta_corners,
        "delta_touches": delta_touches,
        "delta_ft": delta_ft,
        "tgi": tgi,
        "act": act,
        "pre_color": last.get("status_color", {}).get(scoring_team)
    })

print(f"\nAnalyzed delta trends for {len(deltas_list)} goals:")
# Print average deltas
avg_target = sum(d["delta_target"] for d in deltas_list) / len(deltas_list)
avg_off = sum(d["delta_off"] for d in deltas_list) / len(deltas_list)
avg_corners = sum(d["delta_corners"] for d in deltas_list) / len(deltas_list)
avg_touches = sum(d["delta_touches"] for d in deltas_list) / len(deltas_list)
avg_ft = sum(d["delta_ft"] for d in deltas_list) / len(deltas_list)
avg_act = sum(d["act"] for d in deltas_list) / len(deltas_list)

print(f"Average deltas in the 10 minutes prior to a goal (for the scoring team):")
print(f"  Shots on target delta: {avg_target:.2f}")
print(f"  Shots off target delta: {avg_off:.2f}")
print(f"  Corners delta: {avg_corners:.2f}")
print(f"  Touches in opposition box delta: {avg_touches:.2f}")
print(f"  Final third entries delta: {avg_ft:.2f}")
print(f"  Calculated GAI (Activity Index): {avg_act:.2f}")

# Distribution of GAI (act) values
gai_ranges = {
    "GAI >= 5.0 (Green)": 0,
    "GAI 3.0 to 5.0 (Blue)": 0,
    "GAI 1.0 to 3.0 (Yellow)": 0,
    "GAI < 1.0 (Grey)": 0
}

for d in deltas_list:
    act = d["act"]
    if act >= 5.0:
        gai_ranges["GAI >= 5.0 (Green)"] += 1
    elif act >= 3.0:
        gai_ranges["GAI 3.0 to 5.0 (Blue)"] += 1
    elif act >= 1.0:
        gai_ranges["GAI 1.0 to 3.0 (Yellow)"] += 1
    else:
        gai_ranges["GAI < 1.0 (Grey)"] += 1

print("\nGAI Value Ranges before Goal:")
for k, v in gai_ranges.items():
    print(f"  {k}: {v} matches ({v/len(deltas_list)*100:.1f}%)")
