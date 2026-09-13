import re
html = open('fs_m.html', 'r', encoding='utf-8').read()
lives = re.findall(r'href=./match/([a-zA-Z0-9]+)/..class=.live.', html)
print(lives)
