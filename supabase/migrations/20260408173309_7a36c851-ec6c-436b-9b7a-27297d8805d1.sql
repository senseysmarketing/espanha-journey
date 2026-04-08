
-- Create events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  date timestamptz NOT NULL,
  location text,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'eur',
  max_capacity integer,
  stripe_price_id text,
  image_url text,
  recurrence text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create event_rsvps table
CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  stripe_payment_id text,
  ticket_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Events: anyone authenticated can view
CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
TO authenticated
USING (true);

-- Event RSVPs: users can view own
CREATE POLICY "Users can view own rsvps"
ON public.event_rsvps FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Event RSVPs: users can insert own
CREATE POLICY "Users can insert own rsvps"
ON public.event_rsvps FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Event RSVPs: users can update own
CREATE POLICY "Users can update own rsvps"
ON public.event_rsvps FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Event RSVPs: users can delete own
CREATE POLICY "Users can delete own rsvps"
ON public.event_rsvps FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Insert initial events
INSERT INTO public.events (title, description, category, date, location, price_cents, currency, max_capacity, recurrence) VALUES
  ('Resenha da Tropa', 'Encontro quinzenal da comunidade brasileira. Venha fazer networking, trocar experiências e conhecer pessoas incríveis. Evento gratuito e aberto a todos.', 'resenha', '2026-04-26T11:00:00+02:00', 'Parque do Retiro, Madrid', 0, 'eur', NULL, 'biweekly_sunday'),
  ('Formação Profissional — João Sericato', 'Treinamento intensivo para criadores de conteúdo com João Sericato. Aprenda estratégias de monetização, crescimento orgânico e produção de conteúdo profissional.', 'formacao', '2026-05-10T10:00:00+02:00', 'A confirmar, Madrid', 20000, 'eur', NULL, NULL),
  ('Jantar de Integração', 'Networking VIP para empresários e profissionais brasileiros na Espanha. Jantar exclusivo com vagas limitadas no restaurante Sabor Brasil.', 'jantar', '2026-05-17T20:00:00+02:00', 'Sabor Brasil, Madrid', 6000, 'eur', 30, NULL);
