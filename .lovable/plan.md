

## Refinamento Visual Landing Page — Apple 2025 Immersive

### Resumo
Elevar a landing page com mesh gradient animado, liquid glass avançado com refração SVG, cursor glow aurora, botão CTA com pulso metálico e header mobile compacto.

---

### 1. Mesh Gradient Animado — `LandingPage.tsx`

Substituir `bg-[#FAFAF8]` por um fundo com 3 blobs animados (ocre, azul mar, terracota) usando `@keyframes` CSS. Blobs com `blur(120px)`, posição absoluta, animação `move` de 20s infinite alternate.

Adicionar ao `index.css`:
```css
@keyframes mesh-float-1 { 0%{transform:translate(0,0)} 100%{transform:translate(60px,-40px)} }
@keyframes mesh-float-2 { 0%{transform:translate(0,0)} 100%{transform:translate(-50px,30px)} }
@keyframes mesh-float-3 { 0%{transform:translate(0,0)} 100%{transform:translate(30px,50px)} }
```

Três `div` absolute com cores: `hsla(32,70%,55%,0.12)`, `hsla(210,60%,50%,0.08)`, `hsla(15,50%,50%,0.06)`.

### 2. Liquid Glass Avançado — Cards

Criar um componente utilitário `GlassCard` ou aplicar diretamente nos cards existentes:
- `backdrop-filter: blur(16px) saturate(1.4)`
- Borda interna: `box-shadow: inset 0 0 0 1px hsla(0,0%,100%,0.25)`
- Aplicar o filtro SVG `#liquid-glass-refraction` (já existe em `SVGFilters.tsx`) como `filter: url(#liquid-glass-refraction)` nos cards.
- Garantir que `SVGFilters` é renderizado no `LandingPage.tsx`.

Arquivos: `HeroSection.tsx`, `ExpertSection.tsx`, `BentoEcosystem.tsx`, `SavingsCalculator.tsx`, `FAQSection.tsx`.

### 3. Cursor Glow Aurora — `LandingPage.tsx`

Adicionar um `div` absolute (pointer-events-none) com gradiente radial que segue `onMouseMove` via state `{x, y}`. No mobile, usar `onTouchMove`. Tamanho ~300px, blur(80px), cores aurora (ocre + azul), opacidade 0.15.

### 4. Botão CTA Pulso Metálico — `HeroSection.tsx`

No botão "Começar agora":
- Adicionar `animate` com framer-motion: `boxShadow` oscilando entre intensidades (pulso sutil a cada 2s).
- Gradiente metálico com `background-size: 200%` e animação `shimmer` que desliza horizontalmente.

### 5. Mobile: Header Compacto + Sticky Dock

O `StickyCTADock` já existe e aparece após scroll. Aprimorar:
- No `HeroSection.tsx`: adicionar lógica para reduzir o badge "Seu anjo da guarda" ao scrollar (via `useScroll` do framer-motion ou IntersectionObserver), transformando-o num mini-header fixo no topo.
- No mobile, o `StickyCTADock` já cobre o CTA de polegar. Basta garantir que aparece a partir de 400px (em vez de 600px) no mobile.

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/pages/LandingPage.tsx` | Modificar — mesh gradient bg + cursor glow + importar SVGFilters |
| `src/index.css` | Modificar — adicionar keyframes mesh-float |
| `src/components/landing/HeroSection.tsx` | Modificar — liquid glass nos cards, CTA pulso, header compacto mobile |
| `src/components/landing/ExpertSection.tsx` | Modificar — liquid glass + refração |
| `src/components/landing/BentoEcosystem.tsx` | Modificar — liquid glass + refração nos cards |
| `src/components/landing/SavingsCalculator.tsx` | Modificar — liquid glass |
| `src/components/landing/FAQSection.tsx` | Modificar — liquid glass |
| `src/components/landing/StickyCTADock.tsx` | Modificar — threshold mobile 400px |

