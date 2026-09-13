import re
html = open("scratch/ht_test.html", "r", encoding="utf-8").read()
m = re.search(r"<p class=\"p-set odds-detail[^\"]*\">.*?<a[^>]*>([\d\.]+)</a>\s*\|\s*<a[^>]*>([\d\.]+)</a>\s*\|\s*<a[^>]*>([\d\.]+)</a>", html)
print(m.groups() if m else "No match")

