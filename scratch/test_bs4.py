from bs4 import BeautifulSoup; soup = BeautifulSoup(open('scratch/mackolik.html', encoding='utf-8').read(), 'html.parser'); print(soup.find('tr', {'id': True, 'm': True}))
