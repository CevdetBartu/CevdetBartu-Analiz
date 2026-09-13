import requests; r = requests.get('https://arsiv.mackolik.com/Iddaa-Programi', headers={'User-Agent': 'Mozilla/5.0'}); open('scratch/mackolik.html', 'w', encoding='utf-8').write(r.text)
