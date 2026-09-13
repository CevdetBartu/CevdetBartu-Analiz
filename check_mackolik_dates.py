import requests
import bs4

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}
r = requests.get("https://arsiv.mackolik.com/Iddaa-Programi", headers=headers)
soup = bs4.BeautifulSoup(r.text, 'html.parser')
dates = set()
for r_tag in soup.find_all('tr'):
    cls = r_tag.get('class', [])
    if 'iddaa-oyna-title2' in cls:
        date_td = r_tag.find('td', {'rateSort': 'tarih_1'})
        if date_td:
            dates.add(date_td.text.strip())

print("Dates found:", dates)
