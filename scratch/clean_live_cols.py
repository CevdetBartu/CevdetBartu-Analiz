import os
import re

fpath = "artifacts/football-app/src/pages/LiveMatchesPage.tsx"
with open(fpath, "r", encoding="utf-8") as f:
    code = f.read()

# Clean up headers
code = code.replace("⚽ ŞUT", "ŞUT")
code = code.replace("📉 xG / N.F.", "xG / T.A.")
code = code.replace("🚩 KORNER", "KORNER")
code = code.replace("⏳ T.OYNAMA", "TOP OYN.")
code = code.replace("🟨 🟥 KART / ⚠️ FAUL", "KART/FAUL")
code = code.replace("📈 GOL BASINCI / TEMPO", "BASKI/TEMPO")

# Less aggressive background colors
code = code.replace("backgroundColor: 'rgba(255,255,255,0.02)'", "backgroundColor: 'transparent'")
code = code.replace("border: '1px solid rgba(255,255,255,0.04)'", "border: 'none'")

# Soften the yellow and red cards to make them less bright
code = code.replace("backgroundColor: '#eab308'", "backgroundColor: '#ca8a04'") # darker yellow
code = code.replace("backgroundColor: '#ef4444'", "backgroundColor: '#b91c1c'") # darker red

# Clean AI button text
code = code.replace("<span>AI</span>", "<span style={{fontWeight: 700}}>Analiz Et</span>")
code = code.replace("title=\"Canlı 2D Saha & Yayın İzle\"", "")

with open(fpath, "w", encoding="utf-8") as f:
    f.write(code)
print("LiveMatchesPage columns cleaned!")

