import json
import os

LOG_FILE = "c:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub\\scripts\\scraper\\live_goal_monitoring_log.json"

with open(LOG_FILE, "r", encoding="utf-8") as f:
    logs = json.load(f)

# Let's inspect pre_goal_history trends for a few matches where stats are NOT empty
valid_logs = []
for entry in logs:
    pre_state = entry.get("pre_goal_state", {})
    stats = pre_state.get("stats", {})
    total_shots = stats.get("shots_total_h", 0) + stats.get("shots_total_a", 0)
    corners = stats.get("corners_h", 0) + stats.get("corners_a", 0)
    if total_shots > 0 or corners > 0:
        valid_logs.append(entry)

print(f"Total goals with valid statistics: {len(valid_logs)}")

# Let's analyze the delta progression in pre_goal_history of these matches
# How does GAI (tgi / norm) behave as we get closer to the goal?
# The history represents the last 10 minutes (up to 20 snapshots)

for idx, entry in enumerate(valid_logs[:5]):
    print(f"\n--- Case {idx+1}: {entry['homeTeam']} vs {entry['awayTeam']} ({entry['new_score']}) ---")
    history = entry.get("pre_goal_history", [])
    print(f"History length: {len(history)}")
    
    # We want to see how the GAI (activity) of the SCORING team progresses in the last 10 minutes
    # Since live_history was storing absolute values, let's look at what was computed
    scoring_team = entry.get("scoring_team")
    other_team = "away" if scoring_team == "home" else "home"
    
    print(f"Scoring team: {scoring_team}")
    
    # Let's print the snapshots
    for snap_idx, snap in enumerate(history[-10:]): # Look at last 10 snapshots (last 5 minutes)
        # Calculate elapsed minutes from first snapshot
        first_snap = history[0]
        elapsed_min = max(1, snap["minute"] - first_snap["minute"])
        
        # Stats at this snapshot
        s = snap.get("stats", {})
        col = snap.get("status_color", {})
        
        # Let's reconstruct GAI
        # tgi_h = delta_shots_target_h * 15 + delta_shots_off_h * 6 + delta_corners_h * 5
        # Since we don't have the oldest snapshot from live_matches.py rolling cache here, let's look at absolute stats
        s_h_total = s.get("shots_total_h", 0)
        s_h_target = s.get("shots_target_h", 0)
        corners_h = s.get("corners_h", 0)
        
        s_a_total = s.get("shots_total_a", 0)
        s_a_target = s.get("shots_target_a", 0)
        corners_a = s.get("corners_a", 0)
        
        print(f"  Minute {snap['minute']} | Color: {col.get(scoring_team)} (Opp: {col.get(other_team)}) | Stats: H {s_h_total}>{s_h_target} S, {corners_h} C | A {s_a_total}>{s_a_target} S, {corners_a} C")
