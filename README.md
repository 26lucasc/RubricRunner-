# RubricRunner

Transform assignment prompts and rubrics into structured execution plans aligned with grading criteria. RubricRunner acts as an execution coach, rubric interpreter, risk scanner, and draft pre-grader.

## Features

- **Rubric Extractor** – Converts rubric text into structured JSON categories
- **Battle Plan Generator** – Step-by-step execution plan with time estimates and daily breakdown
- **Outline Generator** – Mirrors rubric structure in output format
- **Risk Scanner** – Flags missing sections, word count risks, citation issues
- **Draft Pre-Grader** – Evaluates draft against rubric and predicts score
- **Markdown Export** – Export plan, outline, checklist, and risks as `.md`

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS
- **Backend:** Supabase (Auth + Postgres)
- **LLM:** OpenAI (GPT-4o-mini)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` – From [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Same location
- `OPENAI_API_KEY` – From [OpenAI](https://platform.openai.com/api-keys)

### 3. Create Supabase project and run migrations

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the contents of `supabase/migrations/001_initial.sql`
3. If you previously ran an older version of 001 that included usage tracking, run `002_remove_usage.sql` to remove it
4. Run `003_add_pdf_columns.sql` to add PDF support (storage bucket + columns)

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Run tests

```bash
npm run test
```

### 6. Production deployment

When deploying to production (e.g. Vercel):

1. **Supabase redirect URLs** – In Supabase Dashboard → Authentication → URL Configuration, add your production URLs to **Redirect URLs**:
   - `https://yourdomain.com`
   - `https://yourdomain.com/auth/callback` (required for password reset)
2. **Environment variables** – Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `OPENAI_API_KEY` in your hosting provider.
3. **Site URL** – Set **Site URL** in Supabase to your production domain (e.g. `https://yourdomain.com`).

## User Flow

1. **Sign up** – Create an account (email/password)
2. **Create assignment** – Enter title, prompt, rubric, due date
3. **Generate** – Get battle plan, outline, checklist, and risk scan
4. **Optional** – Paste a draft for rubric evaluation and predicted score
5. **Export** – Download as Markdown

## Project Structure

```
/app
  /(auth)/login, signup, forgot-password, reset-password
  /(dashboard)/dashboard
  /assignments/new, [id]
  /api/assignments/[id]/generate, grade, DELETE, PATCH
/components
  AssignmentForm, PlanDisplay, OutlineDisplay, RiskScanner, Checklist
  ExportButton, DraftGrader
/lib
  supabase/     # Client, server, proxy
  llm/          # Extractor, plan-generator, risk-scanner, draft-grader
  utils/export.ts
/supabase/migrations
  001_initial.sql, 002_remove_usage.sql
```

## License

MIT
