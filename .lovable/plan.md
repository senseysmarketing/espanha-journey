

## Corrigir centralização do Sticky CTA Dock

### Problema
O `framer-motion` sobrescreve a propriedade `transform` do elemento ao animar `y`, removendo o `-translate-x-1/2` que centraliza o dock horizontalmente.

### Solução
Envolver o dock animado em um container fixo que cuida do posicionamento, separando a responsabilidade de centralização da animação.

### Alteração

**`src/components/landing/StickyCTADock.tsx`**:
- Adicionar um `div` wrapper fixo com `fixed bottom-6 left-0 w-full flex justify-center z-50`
- Mover o `motion.div` para dentro desse wrapper, removendo `fixed`, `left-1/2` e `-translate-x-1/2`
- O `motion.div` fica apenas com `w-[calc(100%-2rem)] max-w-lg` e a animação de `y`

