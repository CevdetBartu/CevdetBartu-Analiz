import codecs
import re

path = 'artifacts/api-server/src/routes/analyze.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

new_content = re.sub(
    r'(referenceMatches\.map\(\(m, idx\) => \(\{\s*id:.*?,\s*)',
    r'\1league: m.league ?? null,\n      matchDate: m.matchDate ?? null,\n      ',
    content
)

if new_content != content:
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(new_content)
    print("Patched analyze.ts with regex!")
else:
    print("Not found")
