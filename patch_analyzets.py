import codecs

path = 'artifacts/api-server/src/routes/analyze.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = """referenceMatches.map((m, idx) => ({
      id:              m.id              ?? null,"""

replacement = """referenceMatches.map((m, idx) => ({
      id:              m.id              ?? null,
      league:          m.league          ?? null,
      matchDate:       m.matchDate       ?? null,"""

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Patched analyze.ts!")
else:
    print("Not found")
