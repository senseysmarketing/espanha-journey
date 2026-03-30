
-- Add provincia and whatsapp_alerts to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS provincia text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_alerts boolean DEFAULT false;

-- Create cita_monitoring table
CREATE TABLE cita_monitoring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provincia text NOT NULL,
  tramite text NOT NULL,
  office_name text NOT NULL,
  office_lat numeric,
  office_lng numeric,
  status text NOT NULL DEFAULT 'monitoring',
  available_date date,
  booking_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cita_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view citas" ON cita_monitoring
  FOR SELECT TO authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE cita_monitoring;
