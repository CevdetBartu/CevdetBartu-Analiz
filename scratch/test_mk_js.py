import requests; open('scratch/iddaa.js', 'w', encoding='utf-8').write(requests.get('https://www.mackolik.com/js/pages/iddaa-index.7c3003d69f.js', headers={'User-Agent': 'Mozilla/5.0'}).text)
