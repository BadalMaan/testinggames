# Arena visual refinement — 18 November 2026

This update builds on the existing Global Super Hero / Power Clash game.

## What changed
- Replaced the dark blue arena artwork with a bright, uncluttered ivory-marble coliseum background.
- Kept the existing full-screen two-player arena and number-based hidden selection flow.
- Added Tidal Dragon and Ocean Spiral water powers, Phoenix Roar fire power, Frost Nova and Guardian Aegis, plus Mend Aura healing.
- Added distinct power emblems and power-specific CSS projectile treatments for fire, water, lightning, ice, shadow, solar, wind, shield and healing.
- Added more varied non-lethal reactions: hurt, stumble, shield/guard, and occasional knockdown. A defeated fighter still uses the down pose.
- Added a defensive shield damage reduction and a small heal effect when Mend Aura is selected.
- Extended the clash animation window so the projectile and impact sequence has more time to read.

## Existing art limitation
The fighter artwork remains a compact set of transparent pose illustrations (idle, punch, kick, hurt and down). The new variation comes from selecting different poses and animating them with CSS; this is not a skeletal 3D rig or frame-by-frame motion-capture animation. New dedicated poses can be added later without changing the turn-selection system.

## Verify before deployment
Run `npm install`, then `npm run build`. The dependency installation attempt in the creation environment timed out, so a full Vite production build was not verified. The modified SuperheroClash TSX passed TypeScript transpilation with zero syntax diagnostics.
