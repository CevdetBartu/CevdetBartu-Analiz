import os
import re

fpath = "artifacts/football-app/src/pages/Home.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Restore title gradient (slightly softened)
new_title_style = """style={{ 
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', 
              fontWeight: 900, 
              lineHeight: 1.15, 
              marginBottom: 20, 
              background: 'linear-gradient(135deg, #f8fafc 10%, #38bdf8 50%, #818cf8 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}"""
code = re.sub(r'style=\{\{\s*fontSize: 'clamp\(2.2rem, 5vw, 3.8rem\)'.*?\}\}', new_title_style, code, flags=re.DOTALL)

# Restore button color to a vibrant blue (indigo-500)
code = code.replace("backgroundColor: 'var(--primary)'", "backgroundColor: '#6366f1'")
# Except the header "Manuel" button which we can leave primary or make blue
code = code.replace("backgroundColor: '#6366f1', color: '#fff', padding: '6px 16px'", "backgroundColor: 'var(--primary)', color: '#fff', padding: '6px 16px'")

# Restore some warmth to the cards
code = code.replace("backgroundColor: 'var(--card)'", "backgroundColor: '#111827'") # Gray-900 instead of black
code = code.replace("backgroundColor: 'var(--background)'", "backgroundColor: 'transparent'")

# Stats colors back to vibrant
code = code.replace("color: 'var(--foreground)'}}>134.500+", "color: '#38bdf8'}}>134.500+")
code = code.replace("color: 'var(--foreground)'}}>1.095", "color: '#4ade80'}}>1.095")
code = code.replace("color: 'var(--foreground)'}}>%100", "color: '#facc15'}}>%100")
code = code.replace("color: 'var(--foreground)'}}>0", "color: '#c084fc'}}>0")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("Home colors restored to vibrant!")

