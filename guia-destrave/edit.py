import re

with open('c:/Users/dahan/Downloads/guia-destrave/guia-destrave/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# CSS update
css_old = r'''  /\* ============================================
     ANIMAÇÕES DE ENTRADA
  ============================================ \*/
  \.fade-up \{
    opacity: 0;
    transform: translateY\(28px\);
    transition: opacity 0\.8s cubic-bezier\(0\.22, 1, 0\.36, 1\), transform 0\.8s cubic-bezier\(0\.22, 1, 0\.36, 1\);
  \}

  \.fade-up\.visible \{
    opacity: 1;
    transform: translateY\(0\);
  \}'''

css_new = '''  /* ============================================
     ANIMAÇÕES DE ENTRADA E TRANSIÇÕES
  ============================================ */
  .fade-up {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .scale-up {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
    transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .scale-up.visible {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  /* Classes auxiliares para os mockups divisores */
  .mockup-divider {
    position: absolute;
    z-index: 10;
    pointer-events: none;
    filter: drop-shadow(0 28px 40px rgba(33, 23, 16, 0.18));
  }

  .mockup-1 {
    bottom: -150px;
    right: max(8vw, 20px);
    width: clamp(240px, 30vw, 360px);
    transform: rotate(6deg);
  }

  .mockup-3 {
    top: -120px;
    left: max(5vw, 10px);
    width: clamp(200px, 25vw, 320px);
    transform: rotate(-10deg);
  }

  .mockup-4 {
    top: -100px;
    right: max(10vw, 40px);
    width: clamp(220px, 28vw, 340px);
    transform: rotate(8deg);
  }

  @media (max-width: 860px) {
    .mockup-divider {
      position: relative !important;
      bottom: auto !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      margin: 40px auto 0 !important;
      transform: none !important;
      display: block;
    }
  }'''
text = re.sub(css_old, css_new, text)

# dor
text = re.sub(
    r'(<section id="dor">\s*)(<div class="container text-center">)',
    r'\1<img src="/fotos/1.png" alt="Mockup Guia" class="mockup-divider mockup-1 scale-up" loading="lazy">\n  \2',
    text
)

# oferta
text = re.sub(
    r'(<section id="oferta">\s*)(<div class="container">)',
    r'\1<img src="/fotos/3.png" alt="Detalhe do material" class="mockup-divider mockup-3 scale-up" style="transition-delay:0.2s;" loading="lazy">\n  \2',
    text
)

# nina
text = re.sub(
    r'(<section id="nina">)(\s*<div class="container-wide">)',
    r'<section id="nina" style="position: relative;">\n  <img src="/fotos/4.png" alt="Mockup aberto" class="mockup-divider mockup-4 scale-up" loading="lazy">\1',
    text
)
# nina fix tag capture
text = re.sub(
    r'<section id="nina" style="position: relative;">\\n  <img([^>]+)><section id="nina">',
    r'<section id="nina" style="position: relative;">\n  <img\1>',
    text
)

# js
text = text.replace("document.querySelectorAll('.fade-up').forEach", "document.querySelectorAll('.fade-up, .scale-up').forEach")

with open('c:/Users/dahan/Downloads/guia-destrave/guia-destrave/index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
