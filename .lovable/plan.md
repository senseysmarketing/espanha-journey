

## Corrigir Deformação dos Cards do Product Stage

### Problema
A classe `.landing-glass-refract` aplica `filter: url(#liquid-glass-refraction)` que usa `feDisplacementMap` para criar refração. Em cards pequenos como os do Product Stage (NIE, 730 dias, Contrato), esse filtro distorce visivelmente o texto e os ícones.

### Solução
Remover o filtro SVG de refração dos cards do Product Stage no `HeroSection.tsx`, substituindo a classe `landing-glass-refract` por `landing-glass` (que mantém o blur e a estética de vidro sem a distorção). Isso preserva o efeito glass mas elimina a deformação visual.

### Alteração

**`src/components/landing/HeroSection.tsx`** (linha 102):
- Trocar `landing-glass-refract` por `landing-glass` nos 3 cards do grid do Product Stage.

Apenas uma linha muda — o resto do componente permanece intacto.

