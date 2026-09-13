import urllib.request, re, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
html = urllib.request.urlopen('https://kargatahmin.com', context=ctx).read().decode('utf-8')
print("HTML length:", len(html))
m = re.search(r'href=[\'"](/assets/[^\'"]+\.css)[\'"]', html)
if m:
    css_url = m.group(1)
    print('CSS URL:', css_url)
    try:
        css = urllib.request.urlopen('https://kargatahmin.com' + css_url, context=ctx).read()
        print('CSS Size:', len(css))
        print('CSS starts with:', css[:100].decode('utf-8'))
    except Exception as e:
        print('Error loading CSS:', e)
else:
    print('No CSS link found!')
