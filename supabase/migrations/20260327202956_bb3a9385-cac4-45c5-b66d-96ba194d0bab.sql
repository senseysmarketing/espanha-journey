
-- Table: contracts_audit
CREATE TABLE public.contracts_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text,
  status text DEFAULT 'pending',
  findings_json jsonb,
  created_at timestamptz DEFAULT now()
);

-- RLS for contracts_audit
ALTER TABLE public.contracts_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audits" ON public.contracts_audit
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audits" ON public.contracts_audit
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audits" ON public.contracts_audit
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own audits" ON public.contracts_audit
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Table: verified_providers
CREATE TABLE public.verified_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  category text,
  description text,
  selo_status text DEFAULT 'verified',
  link_afiliado text,
  video_url text,
  avatar_url text,
  rating numeric,
  created_at timestamptz DEFAULT now()
);

-- RLS for verified_providers (public read)
ALTER TABLE public.verified_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view providers" ON public.verified_providers
  FOR SELECT TO authenticated USING (true);

-- Seed sample providers
INSERT INTO public.verified_providers (name, category, description, selo_status, rating, link_afiliado) VALUES
  ('García & Asociados', 'Advogado de Imigração', 'Escritório especializado em NIE, TIE e recursos de extranjería. 15 anos de experiência com brasileiros.', 'verified', 4.9, 'https://example.com/garcia'),
  ('Gestoría Barcelona Express', 'Gestoría', 'Tramitação completa de empadronamiento, número de seguridad social e alta autónomos.', 'verified', 4.7, 'https://example.com/bcnexpress'),
  ('Assessoria Fiscal Ibérica', 'Assessoria Fiscal', 'Declaração de renda (IRPF), modelo 720 e planejamento tributário para brasileiros na Espanha.', 'verified', 4.8, 'https://example.com/iberica'),
  ('InmoLegal Madrid', 'Advogado Imobiliário', 'Revisão de contratos de aluguel, defesa de inquilinos e assessoria LAU. Fala português.', 'verified', 4.6, 'https://example.com/inmolegal'),
  ('Mentor Espanha - Lucas Oliveira', 'Mentor / Curso', 'Curso completo de imigração para a Espanha. Mais de 2.000 alunos formados. Conteúdo atualizado 2025.', 'verified', 5.0, 'https://example.com/mentor');
