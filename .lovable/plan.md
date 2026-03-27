

## Módulo de Proteção e Segurança — Espanha Pass

### Resumo

Adicionar uma nova seção "Segurança" ao app com três funcionalidades: Scanner de Contratos IA, Dashboard de Auditoria, e Marketplace de Parceiros Verificados. Inclui novo tab no Floating Dock, duas tabelas Supabase, uma Edge Function para análise IA, e um botão flutuante "Dica do Mentor" com PiP.

---

### 1. Supabase Migration

Criar duas tabelas:

- **contracts_audit**: `id (uuid PK)`, `user_id (uuid NOT NULL)`, `file_name (text)`, `status (text default 'pending')`, `findings_json (jsonb)`, `created_at (timestamptz default now())`
  - RLS: authenticated users CRUD own rows via `auth.uid() = user_id`

- **verified_providers**: `id (uuid PK)`, `name (text)`, `category (text)`, `description (text)`, `selo_status (text default 'verified')`, `link_afiliado (text)`, `video_url (text)`, `avatar_url (text)`, `rating (numeric)`, `created_at (timestamptz default now())`
  - RLS: SELECT for all authenticated users (public catalog), no INSERT/UPDATE/DELETE for regular users

Seed `verified_providers` with 4-5 sample providers (advogados de imigração, gestorías, assessorias fiscais).

---

### 2. Edge Function: `analyze-contract`

- Receives `{ text: string }` from client
- Uses Lovable AI Gateway (google/gemini-3-flash-preview) with a system prompt specialized in Spanish rental law (LAU)
- Returns structured JSON via tool calling: `{ safe_clauses: [], attention_points: [], illegal_alerts: [] }`
- Each item has `title`, `description`, `law_reference`
- Handles 429/402 errors properly

---

### 3. New Components

**A. `SecuritySection.tsx`** — Main container with 3 internal sub-views (Scanner, Auditoria, Parceiros) navigated via glass pill tabs at the top.

**B. `ContractScanner.tsx`** — Drag-and-drop upload zone
- Glass + squircle (32px) styling with dashed border
- On file drop: animated scan-line gradient sweeps across the card (CSS keyframe)
- Extracts text from PDF client-side via basic FileReader (text mode)
- Calls `analyze-contract` edge function
- Loading state: fluid morphism animation (pulsing glass card)

**C. `AuditDashboard.tsx`** — 3-column translucent card layout
- Columns: "Seguro" (green/olive), "Atenção" (amber), "Ilegal" (coral `hsl(12, 76%, 61%)`)
- Each finding = glass card with Lucide icon + dynamic glow
- On coral alerts: backdrop-blur-xl on background, card elevated to z-50, toast notification, `navigator.vibrate([50, 100, 50])`
- Responsive: stacks vertically on mobile

**D. `VerifiedProviders.tsx`** — Bento Grid marketplace
- Fetches from `verified_providers` table
- CSS Grid with varying spans (2-column bento)
- Each card: avatar, name, category, pulsing verification badge (`animate-pulse-glow`), mini video placeholder area
- Glass + squircle styling

**E. `MentorTipButton.tsx`** — Floating "Dica do Mentor" button
- Small floating button (bottom-right, above dock) visible only in SecuritySection
- Opens a video player overlay in Picture-in-Picture mode via `video.requestPictureInPicture()`
- Placeholder video URL; pulsing glow effect

---

### 4. Navigation Update

**FloatingDock.tsx**: Add `Shield` icon tab (id: `security`, label: "Segurança") between "Cita Hunter" and "IA Concierge".

**Index.tsx**: Add `security: SecuritySection` to `tabComponents` map, import SecuritySection.

---

### 5. Styling Additions

**index.css**:
- New CSS custom property: `--coral: 12 76% 61%`
- `.glass-coral` variant: coral-tinted glass with coral glow for illegal alert cards
- `@keyframes scan-line`: linear gradient sweep animation for the scanner

**tailwind.config.ts**:
- Add `coral` color token mapped to `hsl(var(--coral))`
- Add `scan-line` animation keyframe

---

### 6. Files Summary

| File | Action |
|------|--------|
| `supabase/migrations/..._security_tables.sql` | Create |
| `supabase/functions/analyze-contract/index.ts` | Create |
| `supabase/config.toml` | Modify (add function config) |
| `src/components/SecuritySection.tsx` | Create |
| `src/components/ContractScanner.tsx` | Create |
| `src/components/AuditDashboard.tsx` | Create |
| `src/components/VerifiedProviders.tsx` | Create |
| `src/components/MentorTipButton.tsx` | Create |
| `src/components/FloatingDock.tsx` | Modify (add Shield tab) |
| `src/pages/Index.tsx` | Modify (add security route) |
| `src/index.css` | Modify (add coral + scan-line styles) |
| `tailwind.config.ts` | Modify (add coral color + scan animation) |

**Note**: Authentication is not yet implemented. The scanner will work in demo mode. RLS policies will only take full effect once auth is added — the user will be informed of this.

