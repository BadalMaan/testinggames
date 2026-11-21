import type { CombatPower } from './combatEngine'

const counters: Record<string, string[]> = {
  LIGHTNING: ['WATER', 'SHIELD'], WATER: ['FIRE', 'IMPACT'], FIRE: ['ICE', 'WIND'],
  ICE: ['WIND', 'WATER'], SHADOW: ['SOLAR', 'HEAL'], SOLAR: ['SHADOW', 'ICE'],
  WIND: ['LIGHTNING', 'FIRE'], PLASMA: ['SHIELD', 'WIND'], IMPACT: ['PLASMA', 'ICE'],
  SPEED: ['SHADOW', 'LIGHTNING'], SHIELD: ['IMPACT', 'SPEED'], HEAL: ['SHADOW', 'FIRE'],
}

/** CPU chooses from its five hidden slots; it never changes the player's selection. */
export function chooseCpuPowerIndex(powers: CombatPower[], opponent: CombatPower, difficulty: 'balanced' | 'challenging' = 'challenging'): number {
  if (!powers.length) return 0
  const ranked = powers.map((power, index) => {
    const counterBonus = counters[opponent.type]?.includes(power.type) ? 18 : 0
    const strengthWeight = difficulty === 'challenging' ? 0.72 : 0.48
    const variance = Math.random() * (difficulty === 'challenging' ? 9 : 22)
    return { index, score: power.strength * strengthWeight + counterBonus + variance }
  }).sort((a, b) => b.score - a.score)
  // Challenging AI mostly chooses a good answer but retains a little unpredictability.
  return ranked[Math.random() < 0.82 ? 0 : Math.min(ranked.length - 1, 1 + Math.floor(Math.random() * Math.min(2, ranked.length - 1)))].index
}
