# Remaining work against the original 1,351-line specification

The ZIP contains a real application foundation and working core flows, but these items are not complete and are not represented as completed:

## Educational content quantity and review
- Current starter bank: 75 draft questions total, five per each of 15 game IDs.
- Required: at least 50 playable questions per major game.
- Required: 50 verified words per each of the 10 matras, plus 50 examples each for Tippi, Bindi and Addak.
- Required: 100 reading words, 100 word-building challenges, 100 English→Punjabi, 100 Punjabi→English, 100 tense questions (35 present / 35 past / 30 future), 100 picture-matching questions, 100 sentence questions, 100 conversation scenarios and 100 grammar questions.
- Required: 100 vocabulary words in each of the 20 specified topics.
- All new content remains draft until a fluent Punjabi teacher reviews it. The seed data is intentionally not auto-approved.

## Game-specific learning UX still to expand
- Varnmala needs the full alphabet teaching screen, pronunciation audio and all requested game modes.
- Laga Matra needs a separate learning module and dedicated word bank for each matra, plus mixed-matra revision.
- Reading needs the full seven-level progression and paragraph practice.
- Word Builder needs robust matra placement controls for all Gurmukhi combining signs and the full challenge bank.
- Picture Matching needs real illustration assets and image-first rounds; the current starter questions are text-choice based.
- Sentence Master, Tenses and Grammar need the complete requested question-type variety, not only MCQs.
- Listening needs human-recorded, teacher-reviewed Punjabi audio; browser TTS is only a fallback.
- Speaking has local recording/playback and optional browser speech-to-text, but no reliable automated pronunciation examiner or teacher-review queue UI.
- Sound effects, mute controls, confetti, advanced animations and full game-mode screens still need expansion.

## Admin / institute operations still to expand
- The admin area has student blocking, game creation/activation, question authoring/import/approval/deletion, content imports/approval, score adjustments, season/tournament creation and reports.
- Full edit forms for every table, detailed student account reset workflows, tournament operations/brackets, seasonal leaderboard resets, achievement authoring, detailed audit search and media-to-question assignment still need dedicated UI.
- Parent/guardian consent capture and data-retention workflows need to be implemented for the countries where the institute serves children.

## External services and verification
- Supabase project, migrations, Auth phone provider, SMS provider, Edge Function deployment, Storage and Realtime must be configured by the owner.
- Netlify environment variables and deployed site URL must be configured.
- The project has not been run against a live Supabase instance or tested on two real devices.
- Dependency installation did not complete in the generation environment, so a production Vite build has not been verified here.
