CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.bikes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  model TEXT,
  plate_number TEXT,
  year INTEGER,
  vin TEXT,
  purchase_date DATE,
  purchase_price NUMERIC(12,2),
  current_odometer NUMERIC(12,1) NOT NULL DEFAULT 0,
  photo_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bikes TO authenticated;
GRANT ALL ON public.bikes TO service_role;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bikes" ON public.bikes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER bikes_updated BEFORE UPDATE ON public.bikes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.maintenance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  bike_id UUID NOT NULL REFERENCES public.bikes ON DELETE CASCADE,
  service_date DATE NOT NULL DEFAULT current_date,
  odometer NUMERIC(12,1) NOT NULL DEFAULT 0,
  categories TEXT[] NOT NULL DEFAULT '{}',
  workshop TEXT,
  notes TEXT,
  parts_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  labor_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance_records TO authenticated;
GRANT ALL ON public.maintenance_records TO service_role;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own maintenance" ON public.maintenance_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER maintenance_updated BEFORE UPDATE ON public.maintenance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.service_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  bike_id UUID NOT NULL REFERENCES public.bikes ON DELETE CASCADE,
  item TEXT NOT NULL,
  last_service_odometer NUMERIC(12,1) NOT NULL DEFAULT 0,
  last_service_date DATE,
  interval_km NUMERIC(12,1),
  interval_months INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_schedules TO authenticated;
GRANT ALL ON public.service_schedules TO service_role;
ALTER TABLE public.service_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own schedules" ON public.service_schedules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER schedules_updated BEFORE UPDATE ON public.service_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.fuel_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  bike_id UUID NOT NULL REFERENCES public.bikes ON DELETE CASCADE,
  fill_date DATE NOT NULL DEFAULT current_date,
  odometer NUMERIC(12,1) NOT NULL DEFAULT 0,
  liters NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  fuel_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fuel_logs TO authenticated;
GRANT ALL ON public.fuel_logs TO service_role;
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fuel" ON public.fuel_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  bike_id UUID NOT NULL REFERENCES public.bikes ON DELETE CASCADE,
  expense_date DATE NOT NULL DEFAULT current_date,
  category TEXT NOT NULL DEFAULT 'other',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own expenses" ON public.expenses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  bike_id UUID NOT NULL REFERENCES public.bikes ON DELETE CASCADE,
  title TEXT NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'other',
  due_odometer NUMERIC(12,1),
  due_date DATE,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO authenticated;
GRANT ALL ON public.reminders TO service_role;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reminders" ON public.reminders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  bike_id UUID NOT NULL REFERENCES public.bikes ON DELETE CASCADE,
  maintenance_id UUID REFERENCES public.maintenance_records ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attachments TO authenticated;
GRANT ALL ON public.attachments TO service_role;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attachments" ON public.attachments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own files read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'vehicle-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vehicle-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own files delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vehicle-files' AND auth.uid()::text = (storage.foldername(name))[1]);