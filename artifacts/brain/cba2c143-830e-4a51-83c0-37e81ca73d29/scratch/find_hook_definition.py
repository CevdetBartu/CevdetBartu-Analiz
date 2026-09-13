path = "c:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub\\lib\\api-client-react\\src\\generated\\api.ts"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split("\n")
for idx, line in enumerate(lines):
    if "useRefreshTodayMatches" in line:
        print(f"Line {idx+1}: {line}")
        # Print surrounding lines
        for i in range(max(0, idx-5), min(len(lines), idx+15)):
            print(f"  {i+1}: {lines[i]}")
