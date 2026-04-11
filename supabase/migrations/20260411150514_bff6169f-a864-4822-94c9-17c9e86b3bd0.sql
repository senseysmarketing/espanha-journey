
CREATE TABLE public.connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_account_id text NOT NULL UNIQUE,
  onboarding_complete boolean DEFAULT false,
  account_type text DEFAULT 'express',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connected account"
  ON public.connected_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected account"
  ON public.connected_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected account"
  ON public.connected_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE public.events ADD COLUMN organizer_user_id uuid;
