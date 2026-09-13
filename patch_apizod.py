import codecs

path = 'lib/api-zod/src/generated/api.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = """referenceMatches": zod.array(zod.object({
  "id": zod.string().nullish(),"""

replacement = """referenceMatches": zod.array(zod.object({
  "id": zod.string().nullish(),
  "league": zod.string().nullish(),
  "matchDate": zod.string().nullish(),"""

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Patched!")
else:
    print("Not found")
