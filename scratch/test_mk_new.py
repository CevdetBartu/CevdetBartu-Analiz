import requests; r = requests.get('https://www.mackolik.com/iddaa', headers={'User-Agent': 'Mozilla/5.0'}); open('scratch/mackolik_new.html', 'w', encoding='utf-8').write(r.text)
