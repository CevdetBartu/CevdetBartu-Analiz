import requests; print(requests.get('https://www.fotmob.com/api/matches?date=20260826', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}).status_code)
