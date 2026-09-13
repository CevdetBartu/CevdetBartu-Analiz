import codecs

path = 'lib/api-zod/src/generated/api.ts'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = """export type AnalyzeRefMatch = {
    id?: string | null;"""

replacement = """export type AnalyzeRefMatch = {
    id?: string | null;
    league?: string | null;
    matchDate?: string | null;"""

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print("Patched interface!")
else:
    print("Interface not found")
