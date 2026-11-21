# Globalgames — Final Power Clash visual update

This package contains the complete Globalgames project with the upgraded Power Clash battle scene.

## What changed
- A dedicated 3D fantasy arena background image is now used behind the fighters.
- The blue fighter faces right and the red fighter faces left; neither is trapped inside poster panels.
- Idle characters gently move; attack poses, hurt poses and defeated poses are switched at the appropriate battle phases.
- Each shuffled power gets a distinct coloured projectile treatment (fire, lightning, ice, shadow, solar, wind, shield, impact, plasma and speed).
- The stronger power visually pushes through and collapses the weaker projectile.
- The impact has a brief arena shake, central collision flash and a result banner.
- The original no-keyboard, two-player hidden number-pick flow is retained: Player 1 selects 1–5, Player 2 selects 1–5, then both powers are revealed and the clash plays. The five power slots shuffle for each player every round.

## Replace the local GitHub Desktop project
1. Close the running local dev server if one is open.
2. Extract this ZIP. Its root contains `src`, `public`, `supabase`, `package.json`, and the other project files directly.
3. In GitHub Desktop, use **Repository → Show in Explorer** to open the actual local `Globalgames` repository folder.
4. Copy **all contents** from the extracted ZIP folder into that repository folder. Allow Windows to **replace/overwrite** matching files and merge folders. Do not copy the ZIP itself and do not create a nested `Globalgames-main` folder.
5. Return to GitHub Desktop. The Changes tab should show changed files, including `src/components/SuperheroClash.tsx`, `src/style.css`, and `public/images/arena-background.png`.
6. Commit the changes, then click **Push origin**.
7. Netlify should build from the connected GitHub branch automatically.

## Build settings
- Build command: `npm run build`
- Publish directory: `dist`
- Node: `22`

## Important verification note
The updated TSX file passed TypeScript transpilation with zero syntax diagnostics, and the ZIP passed integrity verification. A full Vite production build was not verified in this environment because `npm install` timed out. Run `npm install` and `npm run build` locally before relying on a production deployment.

The fighter art is a set of separate pose images with CSS motion and animated effects, not a full skeletal/mocap animation system. Supabase schema and existing platform functionality are retained; this visual update does not require new Supabase migrations.
