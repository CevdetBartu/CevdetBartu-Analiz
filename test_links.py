import re
html = open('fs_m.html', 'r', encoding='utf-8').read()
links = re.findall(r'href=.(/[^.]+).', html)
print(links[:20])
