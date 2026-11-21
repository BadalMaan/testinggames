# Supabase setup: step by step

1. Create a Supabase project and save its Project URL and anon/publishable key.
2. Open SQL Editor. Run migrations in numeric order:
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_complete_platform.sql`
   - `supabase/migrations/0003_triggers_rpc_seed.sql`
   - `supabase/migrations/0004_game_answer_integrity.sql`
   - `supabase/migrations/0005_platform_features.sql`
3. Run seed files:
   - `supabase/seed/001_games.sql`
   - `supabase/seed/002_starter_questions.sql`
4. Seeded questions are deliberately `draft`. Review Punjabi spelling, gender agreement, Roman Punjabi and matra classification, then set approved questions:
   `update public.questions set content_status='approved' where id='...';`
   Students only receive approved questions.
5. In Supabase Dashboard → Authentication → Providers → Phone, enable Phone provider and configure a real SMS provider (Twilio or another provider supported by Supabase). Configure rate limits and message templates. The site uses phone + passcode accounts; OTP is used to verify registration and recover a passcode.
6. In Authentication → URL Configuration, set Site URL to your deployed Netlify URL and add localhost as a development redirect.
7. In Project Settings → API, copy URL and anon key into Netlify environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
8. Install Supabase CLI, login and link the project:
   `supabase login`
   `supabase link --project-ref YOUR_PROJECT_REF`
9. Deploy each Edge Function:
   `supabase functions deploy start-game`
   `supabase functions deploy submit-answer`
   `supabase functions deploy finish-game`
   `supabase functions deploy admin-manage`
   `supabase functions deploy multiplayer`
   `supabase functions deploy multiplayer-answer`
   `supabase functions deploy daily-challenge`
   `supabase functions deploy student-settings`
10. Set Edge Function secrets (the CLI injects URL/key in hosted projects; verify the defaults):
   `supabase secrets set SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=...`
   The service-role key is server-side only. Never put it in a `VITE_` variable or browser bundle.
11. Register your own owner account on the site, then copy its Auth user UUID from Authentication → Users. Replace the placeholder in `supabase/bootstrap-admin.sql` and run it once.
12. In Database → Replication, verify the multiplayer tables are enabled for Realtime. Migration 0003 attempts to add them to `supabase_realtime` automatically.
13. Review RLS policies and run tests using two student accounts plus one admin account before inviting children.

## Authentication design
The platform uses Supabase Auth phone + password (passcode) authentication. The app does not store passcodes in `students` or `student_profiles`; Supabase Auth handles password hashing and SMS verification. Forgot-passcode uses an SMS OTP session followed by `auth.updateUser({password})`.

## Question approval
Imported questions are draft by default. A teacher/admin must check:
- Gurmukhi spelling and matra placement
- Roman Punjabi transliteration consistency
- Natural English meaning
- Gender, number and respectful forms
- Correct answer and plausible distractors
Only then should content be approved for student play.

## Admin roles
`owner`, `admin`, and `teacher` are stored in `admin_users`. Add roles only through trusted SQL/admin workflows. Do not expose a service-role key in the website.
