
CREATE TABLE public.lead_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  funnel text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clicks"
ON public.lead_clicks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clicks"
ON public.lead_clicks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
