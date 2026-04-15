import urllib.request
import urllib.error
import json

url = 'http://192.168.0.110:8000/auth/login'
data = json.dumps({'email': 'x', 'password': 'x'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req, timeout=5) as r:
        print('STATUS', r.status)
        print(r.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTPERROR', e.code, e.read().decode('utf-8'))
except Exception as e:
    print('EXCEPTION', repr(e))
