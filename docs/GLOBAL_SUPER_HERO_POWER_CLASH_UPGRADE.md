# Global Super Hero — Power Clash Upgrade

Updated `public/arena.html` while preserving the existing dashboard-to-arena flow.

## Included
- Cinematic glass HUD and blurred, saturated arena backdrop.
- Five fixed powers per side:
  - Player 1: Fire, Shield, Megapower, Thunder, Phoenix.
  - Player 2: Water, Shield, Megapower, Frost, Wind.
- Both power inventories displayed in the arena.
- Numbered slots reveal their selected power with a full-panel colour treatment.
- Slot positions rotate by one place after each round and animate as they enter.
- Both attacks travel to the exact centre; no strength-based or elemental-counter automatic winner.
- Simultaneous damage resolution:
  - Either player selecting Shield means neither player takes damage that round.
  - Megapower vs Megapower means zero damage to both.
  - A single Megapower deals 45 health points to the opponent; the opposing ordinary power deals 20 points back.
  - Other non-shield, non-megapower clashes deal 20 points to each player.

## Verification
- Inline JavaScript passed `node --check`.
- Full Vite build could not be completed in this environment because dependencies are not installed (`react`, `lucide-react`, and related type packages are missing). Run `npm install` followed by `npm run build` in the project directory before deployment.

## Character-art note
The existing canvas-drawn character renderer and pose animation remain in place. The arena backdrop and presentation were upgraded in this pass; true rigged 3D character models would require new model assets and a 3D rendering pipeline, and are not claimed by this update.
