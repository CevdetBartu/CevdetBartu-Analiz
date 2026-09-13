import bs4; soup = bs4.BeautifulSoup(open('scratch/mackolik.html', encoding='utf-8').read(), 'html.parser'); print([t.text for t in soup.find_all('td') if ':' in t.text or '-' in t.text][:10])
