import requests, bs4, re
html = open('scratch/mackolik.html', encoding='utf-8').read()
soup = bs4.BeautifulSoup(html, 'html.parser')
rows = soup.find_all('tr')
for i in range(len(rows)):
  r = rows[i]
  if 'class' in r.attrs and 'iddaa-oyna-title' in r.attrs['class']:
    league = r.text.strip()
    print('League:', league)
    match_row = rows[i+2] if i+2 < len(rows) else None
    if match_row and match_row.has_attr('id'):
      cols = match_row.find_all('td')
      if len(cols) > 20:
        time = cols[0].text.strip()
        teams = cols[7].text.strip()
        print(f'Match: {time} - {teams}')
