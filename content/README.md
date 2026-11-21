# Educational content pipeline

`question-bank-starter.json` contains 75 sample MCQs (5 per game category). They are drafts, not a full fulfilment of the original content targets.

## Import
Use Admin → Questions → Import JSON. Each record needs:
- `game_id`
- `prompt`
- `prompt_language` (`en` or `pa`)
- `answer`
- `options` (include the exact answer string)
- `difficulty`

The importer saves questions as draft and creates answer-option rows. A teacher/admin must review and approve before students can play them.

## Minimum content targets
See `CONTENT_REQUIREMENTS.json`. It preserves the original brief's requested quantities. Use the admin import flow to add batches. Do not bulk-publish unreviewed AI-generated Punjabi content.

## Validation
Run `node scripts/validate-content.mjs content/question-bank-starter.json`.
This validates structure and duplicates only. It does not certify linguistic accuracy.

## Vocabulary and matra import
Database tables:
- `vocabulary`: topic, english, gurmukhi, roman_punjabi, image_url, pronunciation_url, review_status
- `matra_words`: matra_code, gurmukhi, roman_punjabi, english_meaning, is_primary_example, review_status

Create CSV/JSON batches with the same fields. Keep new content in draft until checked by a Punjabi teacher.
