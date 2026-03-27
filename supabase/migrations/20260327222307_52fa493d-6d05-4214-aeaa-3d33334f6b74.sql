
CREATE TABLE public.city_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  custo_vida_medio numeric,
  clima text,
  seguranca_index numeric,
  latitude numeric,
  longitude numeric,
  foto_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.poi_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  categoria text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  descricao text,
  cidade text,
  created_at timestamptz DEFAULT now()
);

CREATE POLICY "Anyone can view cities" ON public.city_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can view POIs" ON public.poi_locations FOR SELECT TO authenticated USING (true);
