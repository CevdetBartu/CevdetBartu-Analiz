import os
import re

fpath = "artifacts/football-app/src/pages/Home.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Replace hardcoded blues with Slate/Zinc variables and Primary Green

# Badge
code = code.replace("rgba(56, 189, 248, 0.1)", "rgba(16, 185, 129, 0.1)")  # Emerald bg
code = code.replace("rgba(56, 189, 248, 0.2)", "rgba(16, 185, 129, 0.2)")  # Emerald border
code = code.replace("color: '#38bdf8'", "color: 'var(--primary)'")        # Emerald text

# Title Gradient -> Solid or subtle
code = code.replace("background: 'linear-gradient(135deg, #ffffff 30%, #38bdf8 70%, #818cf8 100%)'", "color: 'var(--foreground)'")
code = code.replace("WebkitBackgroundClip: 'text',", "")
code = code.replace("WebkitTextFillColor: 'transparent',", "")

# Buttons
code = code.replace("backgroundColor: '#6366f1'", "backgroundColor: 'var(--primary)'")
code = code.replace("boxShadow: '0 4px 24px rgba(99, 102, 241, 0.35)'", "boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)'")

# Stats Grid 
code = code.replace("color: '#4ade80'", "color: 'var(--foreground)'")
code = code.replace("color: '#facc15'", "color: 'var(--foreground)'")
code = code.replace("color: '#c084fc'", "color: 'var(--foreground)'")

# Cards bg
code = code.replace("backgroundColor: '#0f172a'", "backgroundColor: 'var(--card)'")
code = code.replace("backgroundColor: '#0a0d18'", "backgroundColor: 'var(--background)'")
code = code.replace("rgba(255, 255, 255, 0.08)", "var(--border)")
code = code.replace("rgba(255,255,255,0.06)", "var(--border)")
code = code.replace("rgba(255, 255, 255, 0.05)", "var(--border)")
code = code.replace("rgba(255,255,255,0.05)", "var(--border)")

# Footer and minor text
code = code.replace("color: '#94a3b8'", "color: 'var(--muted-foreground)'")
code = code.replace("color: '#64748b'", "color: 'var(--muted-foreground)'")
code = code.replace("color: '#ffffff'", "color: 'var(--foreground)'")
code = code.replace("borderTop: '1px solid rgba(255,255,255,0.06)'", "borderTop: '1px solid var(--border)'")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)

print("Home UI Cleaned!")

