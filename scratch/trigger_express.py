import requests; print(requests.post('http://localhost:8080/api/today-matches/refresh', json={'date': '2026-08-27'}, timeout=15).text)
