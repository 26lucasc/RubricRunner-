-- RubricRunner initial schema
-- Run this migration in your Supabase project (Dashboard > SQL Editor)
-- Uses gen_random_uuid() (built into PostgreSQL 13+) - no extension required

-- Assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  rubric_text TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rubric items (extracted from rubric text)
CREATE TABLE rubric_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  requirements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated outputs (plan, outline, checklist, risks)
CREATE TABLE outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  plan_md TEXT,
  outline_md TEXT,
  checklist_json JSONB DEFAULT '[]'::jsonb,
  risks_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id)
);

-- Drafts table (for Draft Pre-Grader feature)
CREATE TABLE drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  content_md TEXT NOT NULL,
  score_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_assignments_user_id ON assignments(user_id);
CREATE INDEX idx_assignments_created_at ON assignments(created_at DESC);
CREATE INDEX idx_rubric_items_assignment_id ON rubric_items(assignment_id);
CREATE INDEX idx_outputs_assignment_id ON outputs(assignment_id);
CREATE INDEX idx_drafts_assignment_id ON drafts(assignment_id);

-- Row Level Security (RLS)
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own data

-- Assignments
CREATE POLICY "Users can view own assignments"
  ON assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assignments"
  ON assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignments"
  ON assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assignments"
  ON assignments FOR DELETE
  USING (auth.uid() = user_id);

-- Rubric items (via assignment ownership)
CREATE POLICY "Users can view rubric items of own assignments"
  ON rubric_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = rubric_items.assignment_id
      AND assignments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rubric items for own assignments"
  ON rubric_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = rubric_items.assignment_id
      AND assignments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rubric items of own assignments"
  ON rubric_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = rubric_items.assignment_id
      AND assignments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rubric items of own assignments"
  ON rubric_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = rubric_items.assignment_id
      AND assignments.user_id = auth.uid()
    )
  );

-- Outputs
CREATE POLICY "Users can view outputs of own assignments"
  ON outputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = outputs.assignment_id
      AND assignments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert outputs for own assignments"
  ON outputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = outputs.assignment_id
      AND assignments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update outputs of own assignments"
  ON outputs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = outputs.assignment_id
      AND assignments.user_id = auth.uid()
    )
  );

-- Drafts
CREATE POLICY "Users can view drafts of own assignments"
  ON drafts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = drafts.assignment_id
      AND assignments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert drafts for own assignments"
  ON drafts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = drafts.assignment_id
      AND assignments.user_id = auth.uid()
    )
  );

