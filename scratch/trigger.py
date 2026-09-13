import requests; print(requests.post('http://localhost:8080/api/today-matches/refresh', timeout=15).text)
