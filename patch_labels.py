import codecs

path = 'artifacts/api-server/src/lib/analyzeEngine.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

content = content.replace("label: 'Ev Sahibi (MS1)'", "label: `Ev Sahibi (MS1) %${finalHomePct}`")
content = content.replace("label: 'Beraberlik (MS0)'", "label: `Beraberlik (MS0) %${finalDrawPct}`")
content = content.replace("label: 'Deplasman (MS2)'", "label: `Deplasman (MS2) %${finalAwayPct}`")
content = content.replace("label: 'Karşılıklı Gol Var'", "label: `Karşılıklı Gol Var %${finalBttsPct}`")
content = content.replace("label: '2.5 Üst'", "label: `2.5 Üst %${finalOver25Pct}`")

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)

print("Labels patched.")
