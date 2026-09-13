import os
import re

files = [
    "artifacts/football-app/src/pages/TodayMatchesPage.tsx",
    "artifacts/football-app/src/pages/LiveMatchesPage.tsx",
    "artifacts/football-app/src/pages/AdminPage.tsx",
    "artifacts/football-app/src/components/AnalysisTable.tsx"
]

def clean_file(fpath):
    with open(fpath, "r", encoding="utf-8") as f:
        code = f.read()
    
    # Replace hardcoded colors with CSS variables
    code = code.replace("#0f172a", "var(--background)")
    code = code.replace("#1e293b", "var(--border)")
    code = code.replace("#334155", "var(--border)")
    code = code.replace("#0e1520", "var(--card)")
    code = code.replace("#0c1218", "transparent")
    code = code.replace("#141e28", "var(--border)")
    code = code.replace("#2563eb", "var(--primary)")
    code = code.replace("#38bdf8", "var(--foreground)")
    code = code.replace("#e2e8f0", "var(--foreground)")
    code = code.replace("#f8fafc", "var(--foreground)")
    
    # Remove gradients in favor of primary solid colors
    code = re.sub(r'linear-gradient\([^)]+\)', "var(--primary)", code)
    
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(code)

for fpath in files:
    if os.path.exists(fpath):
        clean_file(fpath)

print("Pages cleaned!")

