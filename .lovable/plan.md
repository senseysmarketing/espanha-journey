

## Módulo Academy Pass — Plano de Implementação

### Resumo
Criar uma área de membros premium com player de vídeo cinematográfico, curriculum roadmap e tracking de progresso, integrada ao Floating Dock e ao Supabase.

---

### 1. Backend — Tabelas Supabase (Migration)

Criar 4 tabelas:

```sql
-- Cursos
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  total_lessons int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Módulos dentro de um curso
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Aulas dentro de um módulo
CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  video_url text,
  duration_seconds int DEFAULT 0,
  sort_order int DEFAULT 0,
  chapters jsonb DEFAULT '[]', -- [{title, time_seconds}]
  materials jsonb DEFAULT '[]', -- [{name, url}]
  created_at timestamptz DEFAULT now()
);

-- Progresso do usuário
CREATE TABLE user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  current_time_seconds int DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
```

RLS: `courses`, `modules`, `lessons` — SELECT para authenticated. `user_progress` — full CRUD scoped por `auth.uid() = user_id`.

### 2. Navegação — FloatingDock + Index

**`FloatingDock.tsx`**: Adicionar item `{ icon: Library, label: "Academy", id: "academy" }` entre "Explorar" e "Mentor".

**`Index.tsx`**: Importar `AcademyPass` e registrar no `tabComponents` como `academy: AcademyPass`.

### 3. Componente Principal — `AcademyPass.tsx`

Estado: lista de cursos/módulos/aulas carregados do Supabase + progresso do usuário.

**Vista de listagem (padrão)**:
- Cards de curso em Liquid Glass (`.glass squircle`) com thumbnail, título, e Progress Ring (SVG circular no estilo Apple Fitness mostrando % completo).
- Ao clicar num curso, expande módulos em accordion.
- Ao clicar numa aula, abre a vista de aula com `layoutId` animando o card.

**Vista de aula (expandida)**:
- Player de vídeo premium + timeline lateral de aulas.

### 4. Player de Vídeo — `AcademyVideoPlayer.tsx`

- Player HTML5 customizado com overlay de controles translúcidos (`.glass`).
- Controles: play/pause, barra de progresso com markers de capítulos (lidos do campo `chapters` da lesson), volume, fullscreen.
- Auto-hide dos controles após 3s de inatividade (onMouseMove reset timer).
- A cada 10s de reprodução, faz upsert no `user_progress` com `current_time_seconds`.
- Quando vídeo atinge 90%+, marca como `completed = true` e dispara toast de incentivo do mentor.

### 5. Curriculum Roadmap — `AcademyTimeline.tsx`

- Timeline lateral (desktop) ou colapsável (mobile) com lista de aulas agrupadas por módulo.
- Aulas concluídas: ícone de check com brilho aurora (reutiliza `glow-aurora` apenas no ícone de conclusão).
- Botão "Baixar Materiais" em cada aula: abre `Popover` de vidro com links dos arquivos do campo `materials`.

### 6. Progress Ring — `ProgressRing.tsx`

- Componente SVG circular (estilo Apple Fitness) que recebe `percentage` e renderiza arco animado.
- Cores: fundo `secondary`, arco `primary` (ocre).

### 7. Estilo Cinema Glass

Adicionar ao `index.css`:
```css
.bg-academy {
  background: linear-gradient(160deg,
    hsl(220, 30%, 8%) 0%,
    hsl(215, 25%, 12%) 50%,
    hsl(32, 40%, 12%) 100%);
}
```

O componente `AcademyPass` usa `bg-academy` como wrapper em vez do `bg-mesh` global.

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar — 4 tabelas + RLS |
| `src/components/AcademyPass.tsx` | Criar — módulo principal |
| `src/components/AcademyVideoPlayer.tsx` | Criar — player premium |
| `src/components/AcademyTimeline.tsx` | Criar — curriculum roadmap |
| `src/components/ProgressRing.tsx` | Criar — ring SVG |
| `src/components/FloatingDock.tsx` | Modificar — adicionar aba Academy |
| `src/pages/Index.tsx` | Modificar — registrar academy |
| `src/index.css` | Modificar — adicionar `.bg-academy` |

