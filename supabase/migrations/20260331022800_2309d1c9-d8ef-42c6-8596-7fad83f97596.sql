CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  pokemon text NOT NULL,
  type text NOT NULL DEFAULT 'normal',
  tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.students FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.students FOR DELETE USING (true);