-- Add PDF storage path columns (PDFs uploaded to Supabase Storage, LLM reads directly)
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS prompt_pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS rubric_pdf_path TEXT;

-- Allow empty text when PDF is used
ALTER TABLE assignments
  ALTER COLUMN prompt_text DROP NOT NULL,
  ALTER COLUMN rubric_text DROP NOT NULL;

-- Storage bucket for assignment PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assignment-pdfs',
  'assignment-pdfs',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: users can upload/read their own PDFs (path: user_id/assignment_id/filename)
CREATE POLICY "Users can upload own assignment PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment-pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own assignment PDFs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assignment-pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own assignment PDFs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assignment-pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
