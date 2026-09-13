import os

workspace_dir = "c:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub\\artifacts\\football-app"
found = False

for root, dirs, files in os.walk(workspace_dir):
    if "node_modules" in root or ".git" in root:
        continue
    for file in files:
        if file.endswith(".ts") or file.endswith(".tsx"):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if "/analyze" in content or "analyze" in content.lower():
                        print(f"Found in: {path}")
                        found = True
            except:
                pass

if not found:
    print("Not found.")
