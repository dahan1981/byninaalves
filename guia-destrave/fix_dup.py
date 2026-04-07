with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

dup = """  <section id="nina">
  <div class="mockup-divider mockup-4 scale-up">
    <img src="/fotos/4.png" alt="Mockup aberto" class="float-anim" loading="lazy">
  </div>"""

if dup in text:
    text = text.replace(dup, '')
    print("Duplicate mockup removed")

old_css = "transform: rotate(-8deg);"
new_css = "transform: translateY(120px) rotate(-8deg);"

if old_css in text:
    text = text.replace(old_css, new_css)
    print("CSS updated")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
