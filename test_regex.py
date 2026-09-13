import re
with open('artifacts/api-server/dist/index.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = re.sub(r'const outputDir = "C:.*?";', 'const outputDir = __dirname;', content)
print('outputDir = __dirname;' in new_content)
print('C:\\\\Users' in new_content)
