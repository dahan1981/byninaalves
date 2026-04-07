import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# REVERT HACKS
text = text.replace('html { scroll-behavior: smooth; background-color: var(--text); }', 'html { scroll-behavior: smooth; }')

# 1. Z-INDEXES
z_map = {
    '#hero': '10', '#dor': '20', '#transicao': '10',
    '#credibilidade': '10',
    '#base-material': '10', '#oferta': '10',
    '#garantia': '10', '#nina': '20', '#faq': '10', '#cta-final': '10'
}
for sec in z_map:
    text = re.sub(r'(' + sec + r'\s*\{[^}]+)(z-index:\s*\d+;)', r'\1', text)
    text = re.sub(r'(' + sec + r'\s*\{)', r'\1\n    z-index: ' + z_map[sec] + r';\n    position: relative;', text)

# For #bonus we ensure it gets higher z-index than oferta
text = re.sub(r'(#bonus\s*\{[^}]+)(z-index:\s*\d+;)', r'\1', text)
text = re.sub(r'(#bonus\s*\{)', r'\1\n    z-index: 20;\n    position: relative;', text)

# 2. BODY OVERFLOW AND HTML HEIGHT
text = re.sub(r'(body\s*\{)', r'\1\n    display: flex;\n    flex-direction: column;\n    min-height: 100vh;\n    overflow-x: hidden;', text)
text = re.sub(r'(footer\s*\{)', r'\1\n    margin-top: auto;', text)

# 3. CSS ANIMATIONS AND FIXES
old_css_regex = r'\.scale-up[\s\S]+?\.mockup-4[^}]+}'
new_css = '''  .scale-up {
    opacity: 0;
    transform: scale(0.9) translateY(40px) rotate(var(--rot, 0deg));
    transition: opacity 1.2s cubic-bezier(0.19, 1, 0.22, 1), transform 1.2s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .scale-up.visible {
    opacity: 1;
    transform: scale(1) translateY(0) rotate(var(--rot, 0deg));
  }

  .float-anim {
    animation: floating 4s ease-in-out infinite;
  }

  @keyframes floating {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }

  .mockup-divider {
    position: absolute;
    z-index: 10;
    pointer-events: none;
    filter: drop-shadow(0 28px 40px rgba(33, 23, 16, 0.18));
  }
  
  .mockup-divider img {
    width: 100%;
    height: auto;
    display: block;
  }

  .mockup-1 {
    --rot: 6deg;
    bottom: -150px;
    right: max(8vw, 20px);
    width: clamp(240px, 30vw, 360px);
    transform: rotate(var(--rot));
  }

  .mockup-3 {
    --rot: -10deg;
    bottom: -180px;
    left: max(5vw, 10px);
    width: clamp(200px, 25vw, 320px);
    transform: rotate(var(--rot));
  }

  .mockup-4 {
    --rot: 8deg;
    top: -120px;
    right: max(10vw, 40px);
    width: clamp(220px, 28vw, 340px);
    transform: rotate(var(--rot));
  }'''
text = re.sub(old_css_regex, new_css, text)

# Bonus mockups float
text = re.sub(
    r'(\.bonus-floating-mockup[^}]+transform:\s*rotate\(-8deg\)[^}]+})',
    r'\1\n  .bonus-floating-mockup img {\n    animation: floating 4s ease-in-out infinite;\n  }',
    text
)

# 4. SWAP HTML MOCKUPS cleanly

text = re.sub(r'<img[^>]+mockup-1[^>]+>', '', text)
text = re.sub(r'<img[^>]+mockup-3[^>]+>', '', text)
text = re.sub(r'<img[^>]+mockup-4[^>]+>', '', text)
text = re.sub(r'<div[^>]+mockup-1[^>]+>.*?</div>', '', text, flags=re.DOTALL)
text = re.sub(r'<div[^>]+mockup-3[^>]+>.*?</div>', '', text, flags=re.DOTALL)
text = re.sub(r'<div[^>]+mockup-4[^>]+>.*?</div>', '', text, flags=re.DOTALL)

m1 = '''
  <div class="mockup-divider mockup-1 scale-up">
    <img src="/fotos/1.png" alt="Mockup Guia" class="float-anim" loading="lazy">
  </div>
</section>'''
text = re.sub(r'\s*</section>\s*<!-- ============================================\s*TRANSIÇÃO', m1 + r'\n\n<!-- ============================================\n     TRANSIÇÃO', text)

m3 = '''
  <div class="mockup-divider mockup-3 scale-up">
    <img src="/fotos/3.png" alt="Detalhe do material" class="float-anim" loading="lazy">
  </div>
</section>'''
text = re.sub(r'\s*</section>\s*<!-- ============================================\s*OFERTA', m3 + r'\n\n<!-- ============================================\n     OFERTA', text)


m4 = '''<section id="nina">
  <div class="mockup-divider mockup-4 scale-up">
    <img src="/fotos/4.png" alt="Mockup aberto" class="float-anim" loading="lazy">
  </div>'''
text = re.sub(r'<section id="nina"[^>]*>', m4, text)

text = text.replace('<img src="/fotos/2.png" alt="Mockup do calendário sazonal incluso no material" loading="lazy">', '<img src="/fotos/2.png" alt="Mockup do calendário sazonal incluso no material" class="float-anim" loading="lazy">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("done")
