# Netlify deployment

- Repository root: the project root containing `package.json`.
- Build command: `npm run build`.
- Publish directory: `dist`.
- Node version: `.nvmrc` (22).
- SPA fallback: `netlify.toml` and `public/_redirects`.

Netlify environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Redeploy after changing variables. Supabase Edge Functions are deployed to Supabase, not Netlify. Use the Supabase CLI commands in `SUPABASE_SETUP.md`.
