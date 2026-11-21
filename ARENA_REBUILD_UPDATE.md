# Arena rebuild update

This update keeps the existing Global Super Hero battle rules and rebuilds the presentation around a single immersive browser battle screen.

## Included
- Full-screen arena mode hides the surrounding learning portal navigation while the fight is active.
- Player names remain editable on the pre-fight setup screen.
- After a match is completed, `NEXT FIGHT · EDIT PLAYERS` returns to setup so both player names can be changed before the next match.
- Power selection buttons now show the power's icon, full name, and elemental/type label rather than anonymous numbered buttons.
- The battle timeline has been shortened to make each clash more responsive while retaining charge, release, collision, breakthrough, impact, and recovery beats.
- A new cool, light-blue anime arena background replaces the previous background.
- Canvas rendering uses a capped 1.5 device-pixel ratio to reduce fill cost on high-resolution displays.
- The animation loop uses `requestAnimationFrame`, which follows the browser/display refresh cadence. 120 FPS is a target on compatible 120 Hz hardware; browser, device, and workload determine the actual frame rate.

## Existing rules retained
- Two players choose powers in sequence.
- Player 2 does not see Player 1's locked choice before revealing.
- Each player receives five shuffled powers per round.
- The stronger power wins the clash, with a random tie-break for equal strength.
- Existing damage, shield mitigation, healing, health, round, and victory logic remain in place.

## Validation
- TypeScript/TSX syntax transpilation passed for `src/App.tsx` and `src/components/SuperheroClash.tsx`.
- Full production build could not be run because npm dependency installation could not reach the npm registry in this environment (DNS `EAI_AGAIN`).
