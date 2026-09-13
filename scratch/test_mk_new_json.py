import re; html = open('scratch/mackolik_new.html', encoding='utf-8').read(); m = re.search(r'__PRELOADED_STATE__\s*=\s*({.*?});', html); print(m.group(1)[:500] if m else 'Not found')
