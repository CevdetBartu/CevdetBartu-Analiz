import json
import os
import sys

log_path = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper\live_goal_monitoring_log.json"

if not os.path.exists(log_path):
    print("Log file does not exist.")
    sys.exit(1)

with open(log_path, "r", encoding="utf-8") as f:
    logs = json.load(f)

print(f"Analyzing {len(logs)} goal events...")

# We will collect the actual rolling stats of the scoring team in the 10 minutes leading up to the goal.
# Specifically, we look at the difference between the state right before the goal and the oldest state in the history (up to 10 mins).
scoring_team_deltas = []

for entry in logs:
    scoring_team = entry.get("scoring_team")
    history = entry.get("pre_goal_history", [])
    if len(history) < 2:
        continue
    
    # Sort history by timestamp
    history = sorted(history, key=lambda x: x.get("timestamp", 0))
    
    oldest = history[0]
    newest = history[-1]
    
    # Calculate elapsed minutes in history
    dt = (newest.get("timestamp", 0) - oldest.get("timestamp", 0)) / 60.0
    if dt < 1.0:
        continue
        
    old_stats = oldest.get("stats", {})
    new_stats = newest.get("stats", {})
    
    if scoring_team == "home":
        delta_shots_target = max(0, new_stats.get("shots_target_h", 0) - old_stats.get("shots_target_h", 0))
        delta_shots_off = max(0, new_stats.get("shots_off_h", 0) - old_stats.get("shots_off_h", 0))
        delta_corners = max(0, new_stats.get("corners_h", 0) - old_stats.get("corners_h", 0))
        delta_touches_in_box = max(0, new_stats.get("touches_in_box_h", 0) - old_stats.get("touches_in_box_h", 0))
        delta_final_third = max(0, new_stats.get("final_third_h", 0) - old_stats.get("final_third_h", 0))
    else:
        delta_shots_target = max(0, new_stats.get("shots_target_a", 0) - old_stats.get("shots_target_a", 0))
        delta_shots_off = max(0, new_stats.get("shots_off_a", 0) - old_stats.get("shots_off_a", 0))
        delta_corners = max(0, new_stats.get("corners_a", 0) - old_stats.get("corners_a", 0))
        delta_touches_in_box = max(0, new_stats.get("touches_in_box_a", 0) - old_stats.get("touches_in_box_a", 0))
        delta_final_third = max(0, new_stats.get("final_third_a", 0) - old_stats.get("final_third_a", 0))
        
    scoring_team_deltas.append({
        "dt": dt,
        "shots_target": delta_shots_target,
        "shots_off": delta_shots_off,
        "corners": delta_corners,
        "touches_in_box": delta_touches_in_box,
        "final_third": delta_final_third
    })

print(f"Valid events with history: {len(scoring_team_deltas)}")

# Calculate averages
avg_dt = sum(x["dt"] for x in scoring_team_deltas) / len(scoring_team_deltas)
avg_shots_target = sum(x["shots_target"] for x in scoring_team_deltas) / len(scoring_team_deltas)
avg_shots_off = sum(x["shots_off"] for x in scoring_team_deltas) / len(scoring_team_deltas)
avg_corners = sum(x["corners"] for x in scoring_team_deltas) / len(scoring_team_deltas)
avg_touches_in_box = sum(x["touches_in_box"] for x in scoring_team_deltas) / len(scoring_team_deltas)
avg_final_third = sum(x["final_third"] for x in scoring_team_deltas) / len(scoring_team_deltas)

print(f"\n--- Average Rolling Deltas in the preceding {avg_dt:.1f} minutes of a GOAL ---")
print(f"Shots on Target: {avg_shots_target:.2f}")
print(f"Shots off Target: {avg_shots_off:.2f}")
print(f"Corners: {avg_corners:.2f}")
print(f"Touches in Opposition Box: {avg_touches_in_box:.2f}")
print(f"Final Third Entries: {avg_final_third:.2f}")

# Calculate actual Team Game Index (TGI) before goals
# Formül: TGI = (shots_target * 15) + (shots_off * 6) + (corners * 5) + (touches_in_box * 3) + (final_third * 1.5)
tgi_values = []
for d in scoring_team_deltas:
    tgi = (d["shots_target"] * 15) + (d["shots_off"] * 6) + (d["corners"] * 5) + (d["touches_in_box"] * 3) + (d["final_third"] * 1.5)
    tgi_values.append(tgi / d["dt"]) # act value (per minute)

print(f"\n--- Attacking Activity Index (GAI) statistics for the scoring team ---")
print(f"Min GAI: {min(tgi_values):.2f}")
print(f"Max GAI: {max(tgi_values):.2f}")
print(f"Average GAI: {sum(tgi_values)/len(tgi_values):.2f}")

# Let's count how many scored goals had GAI >= various thresholds
thresholds = [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0]
print("\n--- Percentage of Goals Preceded by GAI >= Thresholds ---")
for t in thresholds:
    count = sum(1 for x in tgi_values if x >= t)
    pct = (count / len(tgi_values)) * 100
    print(f"GAI >= {t}: {count} ({pct:.2f}%)")
