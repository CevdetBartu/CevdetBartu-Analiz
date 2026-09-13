import bs4, re
html = open('scratch/mackolik.html', encoding='utf-8').read()
soup = bs4.BeautifulSoup(html, 'html.parser')
current_league = ''
for r in soup.find_all('tr'):
  cls = r.get('class', [])
  if 'iddaa-oyna-title' in cls:
    current_league = r.text.strip()
  elif r.has_attr('id') and r['id'].startswith('Tr'):
    cols = r.find_all('td')
    if len(cols) > 20:
      time = cols[0].text.strip()
      teams = cols[7].text.strip()
      ms1 = cols[11].text.strip()
      msx = cols[12].text.strip()
      ms2 = cols[13].text.strip()
      alt = cols[15].text.strip()
      ust = cols[16].text.strip()
      print(f'{current_league} | {time} | {teams} | {ms1} {msx} {ms2} | Alt:{alt} st:{ust}')
