# Power Clash visual upgrade

This update replaces the two large poster panels in the Power Clash arena with transparent, individual fighter pose assets and a cleaner arena composition.

## Included
- 10 transparent fighter pose PNGs in `public/images/fighters/` (blue and red: idle, punch, kick, hurt, down).
- Character-facing composition: blue fighter faces right, red fighter is mirrored to face left.
- Different poses are shown for attacks, hit reactions and defeat.
- Power-specific animated projectile effects for fire, lightning, ice, shadow, solar, wind, shield, impact, plasma and speed.
- A brief arena impact shake and a central clash flash.
- Existing two-player hidden number-selection and shuffled power mechanics are retained.

## Notes
- The fighter poses are a small hand-authored sprite set, not a full motion-capture or skeletal animation rig. Additional frames can be added later for smoother walk cycles, combo chains, blocks, throws and recovery.
- Effects are rendered in CSS and remain readable over the arena; they are not pre-rendered full-screen posters.
- Run `npm install` and `npm run build` before deployment. The current environment could not complete dependency installation, so a full production build was not verified here. TSX syntax transpilation passed.
