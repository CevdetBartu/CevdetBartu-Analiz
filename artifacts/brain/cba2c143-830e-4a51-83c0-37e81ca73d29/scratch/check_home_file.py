path = "c:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub\\artifacts\\football-app\\src\\pages\\Home.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split("\n")
for idx, line in enumerate(lines):
    if "useMutation" in line or "fetch" in line or "analyze" in line.lower() or "submit" in line.lower():
        print(f"Line {idx+1}: {line}")
