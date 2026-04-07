import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. HTML bg
text = text.replace('html { scroll-behavior: smooth; }', 'html { scroll-behavior: smooth; background-color: var(--text); }')

# 2. Fix animations and mockup rotations
old_css = r'''  \.fade-up \{
    opacity: 0;
    transform: translateY\(40px\);
    transition: opacity 0\.9s cubic-bezier\(0\.16, 1, 0\.3, 1\), transform 0\.9s cubic-bezier\(0\.16, 1, 0\.3, 1\);
  \}

  \.fade-up\.visible \{
    opacity: 1;
    transform: translateY\(0\);
  \}

  \.scale-up \{
    opacity: 0;
    transform: scale\(0\.9\) translateY\(30px\);
    transition: opacity 1s cubic-bezier\(0\.16, 1, 0\.3, 1\), transform 1s cubic-bezier\(0\.16, 1, 0\.3, 1\);
  \}

  \.scale-up\.visible \{
    opacity: 1;
    transform: scale\(1\) translateY\(0\);
  \}

  /\* Classes auxiliares para os mockups divisores \*/
  \.mockup-divider \{
    position: absolute;
    z-index: 10;
    pointer-events: none;
    filter: drop-shadow\(0 28px 40px rgba\(33, 23, 16, 0\.18\)\);
  \}

  \.mockup-1 \{
    bottom: -150px;
    right: max\(8vw, 20px\);
    width: clamp\(240px, 30vw, 360px\);
    transform: rotate\(6deg\);
  \}

  \.mockup-3 \{
    top: -120px;
    left: max\(5vw, 10px\);
    width: clamp\(200px, 25vw, 320px\);
    transform: rotate\(-10deg\);
  \}

  \.mockup-4 \{
    top: -100px;
    right: max\(10vw, 40px\);
    width: clamp\(220px, 28vw, 340px\);
    transform: rotate\(8deg\);
  \}'''

new_css = '''  .fade-up {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 1.2s cubic-bezier(0.19, 1, 0.22, 1), transform 1.2s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .scale-up {
    opacity: 0;
    transform: scale(0.9) translateY(40px) rotate(var(--rot, 0deg));
    transition: opacity 1.2s cubic-bezier(0.19, 1, 0.22, 1), transform 1.2s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .scale-up.visible {
    opacity: 1;
    transform: scale(1) translateY(0) rotate(var(--rot, 0deg));
  }

  /* Classes auxiliares para os mockups divisores */
  .mockup-divider {
    position: absolute;
    z-index: 10;
    pointer-events: none;
    filter: drop-shadow(0 28px 40px rgba(33, 23, 16, 0.18));
  }

  .mockup-1 {
    --rot: 6deg;
    top: -150px;
    right: max(8vw, 20px);
    width: clamp(240px, 30vw, 360px);
  }

  .mockup-3 {
    --rot: -10deg;
    top: -120px;
    left: max(5vw, 10px);
    width: clamp(200px, 25vw, 320px);
  }

  .mockup-4 {
    --rot: 8deg;
    top: -100px;
    right: max(10vw, 40px);
    width: clamp(220px, 28vw, 340px);
  }'''

text = re.sub(old_css, new_css, text)

# 3. Move mockup 1 from #dor to #transicao
# Remove it from dor
text = re.sub(
    r'<img src="/fotos/1\.png"[^>]+>',
    '',
    text,
    count=1
)

# Insert it at start of transicao
text = re.sub(
    r'(<section id="transicao">\s*<div class="container text-center">)',
    r'<section id="transicao">\n  <img src="/fotos/1.png" alt="Mockup Guia" class="mockup-divider mockup-1 scale-up" loading="lazy">\n  <div class="container text-center">',
    text
)

# 4. Remove extra empty lines caused by deletion
text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("done")
