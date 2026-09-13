import json
import os
import sys

# Set path
log_path = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper\live_goal_monitoring_log.json"

if not os.path.exists(log_path):
    print("Log file does not exist at:", log_path)
    sys.exit(1)

try:
    with open(log_path, "r", encoding="utf-8") as f:
        logs = json.load(f)
except Exception as e:
    print("Error reading log file:", e)
    sys.exit(1)

print(f"Total logged goal events: {len(logs)}")
if len(logs) == 0:
    sys.exit(0)

# Analyze stats
colors_at_goal = {"green": 0, "blue": 0, "yellow": 0, "grey": 0}
pressures_at_goal = []
tempos_at_goal = []

for entry in logs:
    scoring_team = entry.get("scoring_team")
    pre_state = entry.get("pre_goal_state", {})
    status_color = pre_state.get("status_color", {})
    pressure = pre_state.get("pressure", {})
    
    if scoring_team == "home":
        color = status_color.get("home", "grey")
        press = pressure.get("home", 50)
    elif scoring_team == "away":
        color = status_color.get("away", "grey")
        press = pressure.get("away", 50)
    else:
        continue
        
    colors_at_goal[color] = colors_at_goal.get(color, 0) + 1
    pressures_at_goal.append(press)
    tempos_at_goal.append(pressure.get("tempo", 0))

print("\n--- Distribution of Team Status Colors AT THE MOMENT OF GOAL ---")
for col, cnt in colors_at_goal.items():
    pct = (cnt / len(pressures_at_goal)) * 100 if pressures_at_goal else 0
    print(f"{col.upper()}: {cnt} ({pct:.2f}%)")

print("\n--- Pressure Statistics for Scoring Team ---")
if pressures_at_goal:
    print(f"Min Pressure: {min(pressures_at_goal)}")
    print(f"Max Pressure: {max(pressures_at_goal)}")
    print(f"Average Pressure: {sum(pressures_at_goal)/len(pressures_at_goal):.2f}")
    
print("\n--- Match Tempo Statistics when Goals Occurred ---")
if tempos_at_goal:
    print(f"Min Tempo: {min(tempos_at_goal)}")
    print(f"Max Tempo: {max(tempos_at_goal)}")
    print(f"Average Tempo: {sum(tempos_at_goal)/len(tempos_at_goal):.2f}")
