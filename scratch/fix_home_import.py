import os

fpath = r"C:\Users\Okyanus\Downloads\ReplitExport-saraccevdetbart\Match-Data-Hub\artifacts\football-app\src\pages\Home.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Remove the import
code = code.replace("import { getMinuteVal } from './LiveMatchesPage';", "")

# Add the function definition inside or outside
helper_func = """
const getMinuteVal = (match: any) => {
  if (match.minute) return parseInt(match.minute, 10) || 0;
  if (match.status === 'Half Time' || match.status === 'HT') return 45;
  return 0;
};
"""

# Insert before BASE
code = code.replace("const BASE = 'http://localhost:8080';", helper_func + "\nconst BASE = 'http://localhost:8080';")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Import removed and function added inline!")

