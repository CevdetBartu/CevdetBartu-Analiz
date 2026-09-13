import os

workspace_dir = "c:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub"
found = False

for root, dirs, files in os.walk(workspace_dir):
    if "node_modules" in root or ".git" in root or ".venv" in root:
        continue
    for file in files:
        if file.endswith(".ts") or file.endswith(".tsx"):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if "useRefreshTodayMatches" in content:
                        print(f"Found in: {path}")
                        found = True
            except:
                pass

if not found:
    print("Not found in any source files.")
