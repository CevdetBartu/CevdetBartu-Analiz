import json
import os

LOG_FILE = "c:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub\\scripts\\scraper\\live_goal_monitoring_log.json"

with open(LOG_FILE, "r", encoding="utf-8") as f:
    logs = json.load(f)

# Let's count how many goals occurred when the scoring team was having what exact absolute stats
valid_logs = []
for entry in logs:
    pre_state = entry.get("pre_goal_state", {})
    stats = pre_state.get("stats", {})
    total_shots = stats.get("shots_total_h", 0) + stats.get("shots_total_a", 0)
    corners = stats.get("corners_h", 0) + stats.get("corners_a", 0)
    if total_shots > 0 or corners > 0:
        valid_logs.append(entry)

print("Total goals with valid stats:", len(valid_logs))

# Let's list cases where pre_goal_history is very short
short_history_cases = 0
for entry in valid_logs:
    history = entry.get("pre_goal_history", [])
    if len(history) < 15:
        short_history_cases += 1
        
print("Short history cases (< 15 snapshots / 7.5 minutes):", short_history_cases)
