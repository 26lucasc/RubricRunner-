-- Cram Mode: last-minute high-intensity study plans

ALTER TABLE exams
  ADD COLUMN IF NOT EXISTS study_mode TEXT DEFAULT 'balanced' CHECK (study_mode IN ('balanced', 'cram')),
  ADD COLUMN IF NOT EXISTS cram_settings_json JSONB DEFAULT '{}'::jsonb;

ALTER TABLE exam_study_plans
  ADD COLUMN IF NOT EXISTS study_mode TEXT DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS cram_sheet_json JSONB DEFAULT '{}'::jsonb;
