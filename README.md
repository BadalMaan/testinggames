# Global Punjabi Classes — Punjabi Game Arena

**Learn Punjabi. Play Punjabi. Master Punjabi.**

A Netlify-deployable React + TypeScript + Vite application with an adaptive dark/light interface, student phone/passcode authentication, Punjabi learning games, online score verification, XP progression, a protected admin workspace, multiplayer room APIs, daily-challenge APIs, Supabase PostgreSQL migrations, and seed content.

> Important: this repository contains the full application foundation and working code paths for the features listed below. It is not honest to claim every production dependency is activated before you configure Supabase/SMS, approve Punjabi content, and run deployment tests. See `docs/PRODUCTION_READINESS.md`.

## Features in this ZIP

### Student experience
- Adaptive light/dark mode, responsive desktop/tablet/mobile layouts.
- Phone + passcode registration and sign-in using Supabase Auth.
- SMS OTP verification at registration and SMS OTP passcode recovery.
- Student dashboard, profile, XP, levels, learning progress, achievements.
- 15 game categories: Varnmala, Laga Matra, Reading, Word Builder, English→Punjabi, Punjabi→English, Tenses, Vocabulary, Picture Matching, Sentence Master, Daily Conversation, Listening, Speaking, Grammar, Multiplayer.
- Multiple-choice games with instant feedback, progress and result screens.
- Gurmukhi letter-tile Word Builder with tap/drag interaction in demo mode.
- Listening browser speech playback where a Punjabi voice is installed.
- Speaking recording/playback and optional browser speech-to-text. This is not automated pronunciation scoring.
- XP and level progression; live leaderboard RPC when signed in and connected.
- Multiplayer private-room creation/join, readiness, shared questions, answer submission and score results.
- Local demo mode so the frontend can be explored before Supabase is connected.

### Admin workspace
- Admin-only Edge Function data access.
- Student list and block/unblock controls.
- Game catalogue and activate/deactivate controls; create games.
- Question authoring, JSON/CSV import, approve and delete controls.
- Vocabulary/matra import and review data.
- Season creation, score adjustment with audit trail, reports and audit-log views.
- Role separation: owner/admin/teacher.

### Backend and infrastructure
- Supabase PostgreSQL migrations with related tables, indexes and RLS.
- Supabase Auth phone + password (passcode) flow; passwords are never stored in application tables.
- Server-verified answer submissions and idempotent game completion.
- Server-side XP/score ledger and achievement unlocking.
- Private student profiles; students cannot update their XP or score tables.
- Supabase Edge Functions for game sessions, answer submission, finalization, admin operations, multiplayer and daily challenges, student privacy settings and public leaderboard opt-in.
- Supabase Realtime publication for multiplayer room updates.
- Storage buckets and access policies for game assets and student avatars.
- Netlify SPA fallback and build configuration.

## Run locally
Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs in demo mode if Supabase variables are blank.

## Deploy to Netlify
1. Push this project folder to GitHub.
2. In Netlify choose **Add new site → Import an existing project** and select the repository.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify environment variables after creating Supabase.
6. Deploy and set the deployed Netlify URL in Supabase Auth → URL Configuration.

`netlify.toml` already configures the SPA rewrite.

## Set up Supabase
Follow `docs/SUPABASE_SETUP.md` exactly. It explains:
- Running all five migrations in order.
- Seeding 15 games and 75 starter questions.
- Enabling a real SMS provider.
- Deploying every Edge Function.
- Setting secrets.
- Creating the first owner/admin role.
- Enabling Realtime and reviewing RLS.

## Content status
`content/question-bank-starter.json` and `supabase/seed/002_starter_questions.sql` contain 75 starter questions (five per category). They are intentionally saved as `draft`. Your original brief requires 50+ questions per major game, 50 words per matra, 100+ reading/translation/vocabulary challenges and 100 words for each vocabulary topic. These large Punjabi datasets still require a teacher-reviewed content pass. The application blocks draft questions from student game sessions. Use the admin importer and `scripts/validate-content.mjs` to expand the bank; do not publish unverified translations.

## Useful commands
```bash
npm run dev
npm run build
npm run preview
node scripts/validate-content.mjs content/question-bank-starter.json
```

## Security warning
Never place a Supabase `service_role` key in frontend code or any `VITE_` variable. Only the anon/publishable key belongs in the browser. Service-role keys belong in Supabase Edge Function secrets.


## Global Super Hero fighting game

Global Super Hero is a one-screen, number-first anime power-clash game. It preserves hidden five-slot power selection, supports two local players or an optional CPU opponent, and uses attack profiles, hitbox checks, multi-hit combos, illustrated fighter pose animation, authored elemental VFX artwork and synthesized combat audio. See `docs/FIGHTING_GAME_UPGRADE.md` for the engine architecture and verification status.


## Artwork-first fighting engine update

The live React arena uses the supplied full-body fighter pose artwork and individual transparent elemental power artwork during clashes. See [docs/ARTWORK_ENGINE_REBUILD.md](docs/ARTWORK_ENGINE_REBUILD.md) for the implementation scope, asset list, verification and deployment notes. The optional standalone arena is available at `/arena.html`; the Netlify homepage itself is rendered by the React `SuperheroClash` component.


## Dashboard poster → arena interface flow

The Dashboard's **GLOBAL SUPER HERO** poster remains the first entry point. Selecting it now opens the standalone `public/arena.html` battle interface inside the existing website shell. The arena's **EXIT ARENA** control sends the player back to the Dashboard without leaving the site. The arena HTML and its image assets are served from the existing `public/` directory; no separate deployment is required.



## Latest Global Super Hero V6 is now the website game

- The Dashboard's existing `global-super-hero-poster.png` remains the first screen.
- Clicking the Dashboard poster opens `/arena.html`, now replaced with the latest V6 game engine and visible elemental travelling-power effects.
- V6 opens directly on champion selection (the standalone game's extra poster screen is skipped).
- The V6 battle arena includes a Dashboard return control; the website iframe listens for `GPA_EXIT_ARENA` and returns the student to the Dashboard.
- The previous `SuperheroClash.tsx` React game component has been removed from the project.
