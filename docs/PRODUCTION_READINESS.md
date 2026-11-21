# Production readiness and remaining work

This ZIP is a substantially expanded full-stack project, but a production platform serving children needs external setup, content verification and real-world testing. The code intentionally does not fake third-party services.

## Must be completed by the project owner

### Supabase / credentials
- Create the Supabase project and apply migrations 0001–0005.
- Seed game catalogue and starter question bank.
- Configure Phone Auth and a real SMS provider (Twilio or supported provider).
- Set Netlify public environment variables and deploy Edge Functions.
- Set Edge Function secrets; keep service-role key server-side.
- Create the first owner account and add its Auth UUID to `admin_users`.
- Verify storage, Realtime, RLS, backups and Auth rate limits.

### Punjabi educational content
- The current bank has 75 draft questions, not the 50–100+ per category and vocabulary targets in the source brief.
- Matra examples, 50-word-per-matra banks, 100-word vocabulary topics, 100 reading words and 100+ challenges still need to be authored/reviewed and imported.
- Check Gurmukhi spelling, matra placement, tippi/bindi/addak classification, Roman Punjabi consistency, gender/number/respectful forms, meanings and distractors.
- Add approved images and reviewed Punjabi audio. Browser speech synthesis is not a substitute for recordings by fluent speakers.
- Keep question status as `draft` until a Punjabi teacher approves it.

### Feature hardening / QA
- Run full end-to-end tests with separate student, teacher, admin and owner accounts.
- Test phone sign-up, OTP, sign-in, passcode recovery, duplicate phone numbers, blocked accounts and rate limits.
- Test concurrent games, duplicate submissions, reconnects and multiplayer room expiry.
- Add automated test coverage and load testing for expected concurrent students.
- Verify accessible keyboard navigation, screen readers, contrast, motion preferences and mobile browser compatibility.
- Add parental consent and privacy/retention workflow appropriate to the jurisdictions where students live.
- Review data retention, incident response, backups, monitoring and operational ownership.
- Add dedicated admin editors for all tournament, challenge, report and media workflows where required.

## Known implementation boundaries
- Multiplayer uses server-created rooms, shared question order, per-player answer submissions and a host-controlled advance. It needs real two-device testing and Supabase Realtime enabled.
- Speaking records audio locally in the browser and offers browser speech-to-text if available. It does not upload recordings or certify pronunciation.
- Listening uses browser speech synthesis only when a Punjabi voice exists on the device. Add human-recorded Punjabi audio for reliable learning.
- Local demo mode stores demo progress in the current browser. Only authenticated Supabase sessions use server-verified scores.
- The question bank is deliberately draft; online sessions return only approved questions.
- OTP delivery depends on the SMS provider configuration and regional delivery rules.
- Netlify hosts the frontend. Supabase hosts PostgreSQL, Auth, Storage, Realtime and Edge Functions.

## Do not skip
Do not invite children until SMS verification, RLS, admin roles, content review, parental consent/privacy notices and live multiplayer have been tested in the deployed environment.
