path = "c:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub\\artifacts\\football-app\\src\\index.css"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split("\n")
for idx, line in enumerate(lines):
    if "sport-tab" in line.lower() or "matches-table" in line.lower() or "league-card" in line.lower():
        print(f"Line {idx+1}: {line}")
