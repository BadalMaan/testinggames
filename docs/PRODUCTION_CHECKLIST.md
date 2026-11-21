# Production readiness checklist

This repository is a deployable MVP foundation, not yet the entire 32-section production system in the specification.

## Required before inviting students
- [ ] Implement server-controlled account creation and passcode hashing (prefer Supabase Auth phone OTP; never store plaintext passcodes).
- [ ] Configure a real SMS provider and rate-limited OTP reset flow.
- [ ] Add server-side game-session creation, answer validation, idempotent score finalization and point ledger transactions. Never trust XP sent by the browser.
- [ ] Add admin roles with server-side authorization and audit logs.
- [ ] Review all Punjabi spellings, matra classifications, gender/number agreement and Roman Punjabi consistency with a qualified teacher.
- [ ] Add a child-safety/privacy notice and obtain appropriate parental consent for data collection.
- [ ] Configure Supabase backups, monitoring, rate limits and abuse protection.
- [ ] Add automated tests, accessibility testing and load testing.
- [ ] Implement realtime multiplayer with server-authoritative rooms and disconnect handling.
- [ ] Add speech/audio services only after validating Punjabi support and consent requirements.

## Supabase setup
Run `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL Editor. The SQL enables RLS and prevents students from updating score/XP tables directly. Service-role operations must happen only in trusted server functions.

## Netlify
Set build command to `npm run build` and publish directory to `dist`. Add the two public Supabase environment variables if using Supabase. Never expose service-role secrets in frontend variables.
