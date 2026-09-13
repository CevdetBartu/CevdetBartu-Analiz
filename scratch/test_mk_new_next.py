import re; html = open('scratch/mackolik_new.html', encoding='utf-8').read(); m = re.search(r'__NEXT_DATA__.*?({.*?})</script>', html, re.DOTALL); print(m.group(1)[:500] if m else 'Not found')
