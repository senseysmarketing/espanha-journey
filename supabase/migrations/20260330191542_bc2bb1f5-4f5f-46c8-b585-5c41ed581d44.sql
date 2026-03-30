
-- Create vault storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('vault', 'vault', false);

-- RLS policies for vault bucket
CREATE POLICY "Users can upload own vault files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own vault files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own vault files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);
