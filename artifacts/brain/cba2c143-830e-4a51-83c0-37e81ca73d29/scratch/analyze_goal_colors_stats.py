import json
import os
import math

LOG_FILE = "c:\\Users\\Okyanus\\Downloads\ReplitExport-saraccevdetbart\\Match-Data-Hub\\scripts\\scraper\\live_goal_monitoring_log.json"

if not os.path.exists(LOG_FILE):
    print("Log file not found.")
    exit(1)

with open(LOG_FILE, "r", encoding="utf-8") as f:
    logs = json.load(f)

print(f"Total goal logs analyzed: {len(logs)}")

# Let's inspect the distribution of status_color BEFORE a goal is scored
# scoring_team is either "home" or "away"
# we check the color of that scoring team in "pre_goal_state" -> "status_color" -> "home"/"away"

scoring_team_colors = []
non_scoring_team_colors = []

empty_stats_count = 0
total_count = 0

for entry in logs:
    pre_state = entry.get("pre_goal_state", {})
    scoring_team = entry.get("scoring_team")
    
    if not pre_state or not scoring_team:
        continue
        
    total_count += 1
    
    # Check if stats are completely empty (indicating no live statistics fallback/no stats at all)
    stats = pre_state.get("stats", {})
    total_shots = stats.get("shots_total_h", 0) + stats.get("shots_total_a", 0)
    corners = stats.get("corners_h", 0) + stats.get("corners_a", 0)
    if total_shots == 0 and corners == 0:
        empty_stats_count += 1
        
    status_color = pre_state.get("status_color", {})
    scoring_color = status_color.get(scoring_team, "grey")
    non_scoring_team = "away" if scoring_team == "home" else "home"
    non_scoring_color = status_color.get(non_scoring_team, "grey")
    
    scoring_team_colors.append(scoring_color)
    non_scoring_team_colors.append(non_scoring_color)

print(f"\nAnalyzed {total_count} goals:")
print(f"  Matches with NO stats (empty shots/corners): {empty_stats_count} ({empty_stats_count/total_count*100:.1f}%)")

# Helper to print distribution
def print_dist(lst, label):
    counts = {}
    for x in lst:
        counts[x] = counts.get(x, 0) + 1
    print(f"\n{label} color distribution:")
    for col in ["green", "blue", "yellow", "grey"]:
        cnt = counts.get(col, 0)
        print(f"  {col}: {cnt} ({cnt/len(lst)*100:.1f}%)")

print_dist(scoring_team_colors, "Scoring Team")
print_dist(non_scoring_team_colors, "Conceding (Non-Scoring) Team")
