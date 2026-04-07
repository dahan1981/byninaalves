with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()
import re
print("DOR:", re.search(r'#dor\s*\{[^}]+\}', text).group() if re.search(r'#dor\s*\{[^}]+\}', text) else "Not found")
print("TRANSICAO:", re.search(r'#transicao\s*\{[^}]+\}', text).group() if re.search(r'#transicao\s*\{[^}]+\}', text) else "Not found")
print("BONUS:", re.search(r'#bonus\s*\{[^}]+\}', text).group() if re.search(r'#bonus\s*\{[^}]+\}', text) else "Not found")
print("OFERTA:", re.search(r'#oferta\s*\{[^}]+\}', text).group() if re.search(r'#oferta\s*\{[^}]+\}', text) else "Not found")
print("NINA:", re.search(r'#nina\s*\{[^}]+\}', text).group() if re.search(r'#nina\s*\{[^}]+\}', text) else "Not found")
print("BODY:", re.search(r'body\s*\{[^}]+\}', text).group() if re.search(r'body\s*\{[^}]+\}', text) else "Not found")
print("FOOTER:", re.search(r'footer\s*\{[^}]+\}', text).group() if re.search(r'footer\s*\{[^}]+\}', text) else "Not found")
