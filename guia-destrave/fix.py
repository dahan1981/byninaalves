import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(
    r'(#dor\s*\{[^}]+z-index:\s*)1(\s*;)',
    r'\g<1>3\g<2>',
    text,
    count=1
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("done")
