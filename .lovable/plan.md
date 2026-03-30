

## Landing Page + Reestruturação de Rotas

### Resumo
Criar a landing page oficial do Espanha Pass em `/` com estética Apple 2025 Light Mediterranean, e mover o dashboard atual para `/dashboard`.

---

### 1. Reestruturação de Rotas

**`src/App.tsx`**: Adicionar rota `/dashboard` apontando para o `Index` atual. A rota `/` passa a renderizar a nova `LandingPage`.

**`src/pages/Index.tsx`** → renomear para **`src/pages/Dashboard.tsx`** (mesma lógica, sem alterações internas).

**`src/pages/LandingPage.tsx`** → novo arquivo, página principal.

### 2. Landing Page — `src/pages/LandingPage.tsx`

Paleta Light Mediterranean (fundo branco gelo `#FAFAF8`, beges, ocre, azul mar profundo). Todas as seções usam `framer-motion` com reveal-on-scroll (viewport `once: true`, animação de emergir do desfoque).

**Seções:**

1. **Hero Cine** — Headline grande ("Seu anjo da guarda na Espanha"), subtítulo, CTA principal. Abaixo, um "Product Stage" (container glass 3D com `perspective` CSS) simulando o dashboard com animação de mola (`type: "spring"`).

2. **Expert Section** — Card glass full-width apresentando o mentor com tipografia elegante e badges de confiança ("Certificado por Gestores Oficiais", "+2.000 brasileiros assessorados").

3. **Bento Ecosystem** — Grid Bento (2×2 + 1 wide) com cards glass demonstrando Scanner de Contratos IA, Cita Hunter e Nationality Clock. Cada card com ícone animado e descrição.

4. **Calculadora de Economia** — Widget interativo: checkboxes para serviços (NIE €300, Visto €800, Contrato €400). Soma em tempo real mostrando economia vs. 9,90€/mês. Animação do valor com `motion.span`.

5. **Interactive FAQ** — Accordion Radix estilizado com glass layers, cantos squircle, transições suaves.

6. **Sticky CTA Dock** — Dock fixo no bottom que aparece após scroll do hero. Glass bar com "9,90€/mês" e botão "Garantir minha vaga" com glow refraction no hover.

### 3. Componentes Auxiliares

- **`src/components/landing/HeroSection.tsx`**
- **`src/components/landing/ExpertSection.tsx`**
- **`src/components/landing/BentoEcosystem.tsx`**
- **`src/components/landing/SavingsCalculator.tsx`**
- **`src/components/landing/FAQSection.tsx`**
- **`src/components/landing/StickyCTADock.tsx`**

### 4. Navegação

O CTA "Garantir minha vaga" e o botão do hero usam `useNavigate` para redirecionar a `/dashboard` (onde o onboarding flow já existe).

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/pages/LandingPage.tsx` | Criar |
| `src/pages/Dashboard.tsx` | Renomear de Index.tsx |
| `src/components/landing/*.tsx` | Criar (6 componentes) |
| `src/App.tsx` | Modificar — novas rotas |

