# Global Punjabi Arena — Artwork-First Fighting Engine Update

## Scope
This update targets the deployed React arena (`src/components/SuperheroClash.tsx`), not only the optional standalone `public/arena.html` demo. It preserves the one-screen, two-player, number-first power-clash flow and the existing power-strength winner rule.

## What changed

### Character presentation
- Replaced the live battle canvas's geometric stick-figure painter with the supplied transparent full-body blue/red fighter artwork.
- Uses distinct supplied idle, punch, kick, hurt and down poses.
- Added six cropped cast-action frames from the supplied `power-action-spritesheet.png` for blue lightning/water/shield and red fire/solar/shield actions.
- Adds subtle charge aura, lunge, recoil and ground contact shadow without drawing fake body geometry.

### Power presentation
- The canvas now loads and renders the supplied transparent power artwork from `public/images/power-effects/` as the primary projectile/effect.
- Individual mappings exist for lightning, fire, ice, shadow, solar, wind, shield, impact, plasma, speed, water dragon, water vortex, phoenix, frost nova, guardian aegis and healing.
- Keeps motion trails, authored water-dragon wake, charge glow, centre clash, impact texture and particles as supporting animation layers.
- Removed the previous large generic vector projectile painter from the live React battle renderer.

### Combat
- Retains the existing power-strength clash rule and round flow.
- Improved the directional AABB hitbox test: projectile moves test their lane range; close-range attacks lunge to authored reach and then test the local hitbox against the target.
- Damage remains applied at the scheduled impact beat, not at the beginning of the animation.
- Existing attack startup/active/recovery profiles, hit counts, shield mitigation, healing and reaction metadata remain in place.

### Number-first selection
- Added final CSS overrides so 1–5 remain visible even on disabled/locked choices.
- Power name, symbol and attack-form panel remain hidden until both players lock their choices, preserving simultaneous hidden selection.

### Performance
- Reduced live canvas device-pixel-ratio cap from 2 to 1.5.
- Reduced particle-pool cap from 520 to 260.
- Reuses decoded image objects; no per-frame `Image` allocation.
- Enables high-quality image smoothing and keeps the existing requestAnimationFrame loop.
- This is a high-refresh target, not a certified 120 FPS benchmark. Actual frame rate depends on display refresh, browser and GPU.

## Verification
- `SuperheroClash.tsx` TypeScript/JSX syntax transpilation: passed (zero syntax diagnostics).
- `combatEngine.ts` strict standalone type-check: passed.
- Combat exchange checks: 24 directional power exchanges across all 12 power families; no expected hitbox misses.
- All 16 fighter artwork files and 16 power artwork files referenced by the live renderer exist.
- Full Vite production build: not verified because this environment has no installed dependencies and npm offline installation cannot retrieve packages. Run `npm install` and `npm run build` before deploying.

## Deploy
Upload the contents of this project to the existing GitHub repository or replace the repository contents with this updated project, then let Netlify rebuild from the configured project root. Do not deploy only `public/arena.html`; the live homepage uses the React `SuperheroClash` component.
