import json
import os
import sys

log_path = r"c:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\scripts\scraper\live_goal_monitoring_log.json"

if not os.path.exists(log_path):
    print("Log file does not exist.")
    sys.exit(1)

with open(log_path, "r", encoding="utf-8") as f:
    logs = json.load(f)

all_gai_values = []

for entry in logs:
    history = entry.get("pre_goal_history", [])
    if len(history) < 2:
        continue
    
    # Let's calculate the GAI at every step of the history for BOTH teams!
    # This gives us a massive dataset of normal match moments.
    history = sorted(history, key=lambda x: x.get("timestamp", 0))
    
    for i in range(1, len(history)):
        oldest = history[0]
        current = history[i]
        
        dt = (current.get("timestamp", 0) - oldest.get("timestamp", 0)) / 60.0
        if dt < 1.0:
            continue
            
        old_stats = oldest.get("stats", {})
        cur_stats = current.get("stats", {})
        
        # Home team GAI
        h_shots_target = max(0, cur_stats.get("shots_target_h", 0) - old_stats.get("shots_target_h", 0))
        h_shots_off = max(0, cur_stats.get("shots_off_h", 0) - old_stats.get("shots_off_h", 0))
        h_corners = max(0, cur_stats.get("corners_h", 0) - old_stats.get("corners_h", 0))
        h_touches = max(0, cur_stats.get("touches_in_box_h", 0) - old_stats.get("touches_in_box_h", 0))
        h_final = max(0, cur_stats.get("final_third_h", 0) - old_stats.get("final_third_h", 0))
        h_tgi = (h_shots_target * 15) + (h_shots_off * 6) + (h_corners * 5) + (h_touches * 3) + (h_final * 1.5)
        all_gai_values.append(h_tgi / dt)
        
        # Away team GAI
        a_shots_target = max(0, cur_stats.get("shots_target_a", 0) - old_stats.get("shots_target_a", 0))
        a_shots_off = max(0, cur_stats.get("shots_off_a", 0) - old_stats.get("shots_off_a", 0))
        a_corners = max(0, cur_stats.get("corners_a", 0) - old_stats.get("corners_a", 0))
        a_touches = max(0, cur_stats.get("touches_in_box_a", 0) - old_stats.get("touches_in_box_a", 0))
        a_final = max(0, cur_stats.get("final_third_a", 0) - old_stats.get("final_third_a", 0))
        a_tgi = (a_shots_target * 15) + (a_shots_off * 6) + (a_corners * 5) + (a_touches * 3) + (a_final * 1.5)
        all_gai_values.append(a_tgi / dt)

print(f"Total baseline team snapshots: {len(all_gai_values)}")
print(f"Average Baseline GAI: {sum(all_gai_values)/len(all_gai_values):.4f}")
print(f"Median Baseline GAI: {sorted(all_gai_values)[len(all_gai_values)//2]:.4f}")
print(f"90th Percentile Baseline GAI: {sorted(all_gai_values)[int(len(all_gai_values)*0.9)]:.4f}")
print(f"95th Percentile Baseline GAI: {sorted(all_gai_values)[int(len(all_gai_values)*0.95)]:.4f}")
print(f"98th Percentile Baseline GAI: {sorted(all_gai_values)[int(len(all_gai_values)*0.98)]:.4f}")
print(f"99th Percentile Baseline GAI: {sorted(all_gai_values)[int(len(all_gai_values)*0.99)]:.4f}")
