

## Módulo de Mentoria Digital — Plano Revisado

As alterações propostas fazem sentido e estão alinhadas com a arquitetura existente. Abaixo o plano consolidado.

---

### 1. Navegação — FloatingDock

- Renomear "IA" → "Mentor", trocar ícone `Bot` → `GraduationCap`
- ID mantido como `"ai"` para não quebrar roteamento existente

### 2. Edge Function `mentor-chat`

Nova edge function separada da `city-concierge`, com:
- System prompt de consultor sênior acolhedor, PT-BR, markdown (tabelas de taxas, links oficiais)
- Recebe `{ messages, currentMilestone? }` — se milestone informado, contextualiza a conversa (ex: "O usuário está no passo NIE/TIE")
- Streaming SSE via Lovable AI Gateway (`google/gemini-3-flash-preview`)
- Tratamento de erros 429/402
- `supabase/config.toml`: adicionar `[functions.mentor-chat] verify_jwt = false`

### 3. `MentorChat.tsx` — Substitui `AIConsierge.tsx`

- Chat real com streaming SSE (substitui resposta simulada atual)
- **Mensagens do usuário**: `glass` neutro, `rounded-2xl rounded-br-md`
- **Mensagens do mentor**: classe `glass-aurora` (gradiente ciano→violeta→rosa), `rounded-2xl rounded-bl-md`
- Quick-actions contextuais no topo (botões de milestone: "NIE", "Empadronamiento", etc.)
- Indicador de "pensando" com pulso Aurora
- `react-markdown` para renderizar tabelas e links
- Animação de expansão fluida ao abrir (spring, sem `layoutId`)
- Squircle 32px

### 4. `MilestoneVideoPlayer.tsx` — Player contextual

- Integrado dentro do card expandido de cada milestone no `JourneyMap` (substitui placeholder "Vídeo do Mentor")
- Player Liquid Glass minimalista com controles translúcidos
- **Mini-Player**: botão que fixa o vídeo em `fixed bottom-24 right-6 z-50` com glass, permitindo interação com checklist
- URLs de vídeo mock/placeholder por milestone

### 5. `SuccessParticles.tsx` — Gamificação

- Partículas SVG/Canvas com gradientes Aurora (ciano, violeta, rosa)
- Disparado ao marcar checkbox no checklist do `JourneyMap`
- Duração ~1.5s, auto-remove
- Haptic: `navigator.vibrate([10, 30, 10])` + truque iOS (input switch invisível com `change` event para tentar vibração em Safari)

### 6. `JourneyMap.tsx` — Modificações

- Adicionar `videoUrl` (mock) em cada milestone
- Substituir placeholder "Vídeo do Mentor" por `MilestoneVideoPlayer`
- Checkboxes com estado local funcional (`checkedItems` state)
- Ao marcar item: disparar `SuccessParticles` + haptic

### 7. `index.css` — Classes Aurora

```css
.glass-aurora {
  background: linear-gradient(135deg, 
    hsla(180, 80%, 55%, 0.08), 
    hsla(270, 70%, 55%, 0.08), 
    hsla(330, 80%, 55%, 0.08));
  backdrop-filter: blur(20px) saturate(1.5);
  border: 1px solid hsla(270, 70%, 55%, 0.15);
  box-shadow: 0 0 40px hsla(270, 70%, 55%, 0.1);
}

.glow-aurora {
  box-shadow: 0 0 40px hsla(180, 80%, 55%, 0.15), 
              0 0 80px hsla(270, 70%, 55%, 0.1),
              0 0 120px hsla(330, 80%, 55%, 0.05);
}
```

### 8. Cleanup

- Remover `MentorTipButton.tsx` (funcionalidade absorvida pelo mini-player e chat)

---

### Arquivos

| Arquivo | Ação |
|---------|------|
| `supabase/functions/mentor-chat/index.ts` | Criar |
| `supabase/config.toml` | Adicionar `[functions.mentor-chat]` |
| `src/components/MentorChat.tsx` | Criar (substitui AIConsierge) |
| `src/components/MilestoneVideoPlayer.tsx` | Criar |
| `src/components/SuccessParticles.tsx` | Criar |
| `src/components/JourneyMap.tsx` | Modificar — video player + checklist funcional + partículas |
| `src/components/FloatingDock.tsx` | Modificar — "IA" → "Mentor" + GraduationCap |
| `src/pages/Index.tsx` | Modificar — trocar AIConsierge por MentorChat |
| `src/index.css` | Modificar — adicionar classes Aurora |
| `src/components/MentorTipButton.tsx` | Remover |

