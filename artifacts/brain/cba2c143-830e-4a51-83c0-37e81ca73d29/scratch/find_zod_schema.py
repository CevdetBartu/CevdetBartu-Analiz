import os

workspace_dir = "c:\\Users\\Okyanus\\Downloads\\ReplitExport-saraccevdetbart\\Match-Data-Hub"
found = False

for root, dirs, files in os.walk(workspace_dir):
    if "node_modules" in root or ".git" in root or ".venv" in root:
        continue
    for file in files:
        path = os.path.join(root, file)
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                if "AnalyzeMatchesBody" in content and ("z.object" in content or "zod" in content.lower()):
                    print(f"Found in: {path}")
                    # Print first 50 lines or lines containing AnalyzeMatchesBody
                    lines = content.split("\n")
                    for idx, line in enumerate(lines):
                        if "AnalyzeMatchesBody" in line:
                            print(f"  Line {idx+1}: {line}")
                            for k in range(max(0, idx-5), min(len(lines), idx+15)):
                                print(f"    {k+1}: {lines[k]}")
                    found = True
        except:
            pass

if not found:
    print("Not found.")
