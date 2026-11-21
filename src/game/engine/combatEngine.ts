/** Deterministic combat data for the one-screen, number-first arena. */
export type CombatSide = 'blue' | 'red'
export type CombatPower = { name: string; type: string; strength: number; color: string }
export type Rect = { x: number; y: number; width: number; height: number }
export type AttackProfile = {
  startupMs: number
  activeMs: number
  recoveryMs: number
  damage: number
  hitCount: number
  range: number
  hitbox: Rect
  projectile: boolean
  soundCue: string
  reaction: 'launch' | 'stun' | 'freeze' | 'guard-break' | 'knockback' | 'heal'
}
export type ExchangeResult = {
  winner: CombatSide
  victim: CombatSide
  damage: number
  blueDamage: number
  redDamage: number
  blueHealth: number
  redHealth: number
  blueHeal: number
  redHeal: number
  hitCount: number
  comboLabel: string
  profile: AttackProfile
  hitboxConnected: boolean
}

const profiles: Record<string, Partial<AttackProfile>> = {
  LIGHTNING: { startupMs: 380, activeMs: 210, recoveryMs: 520, hitCount: 2, range: 620, projectile: true, soundCue: 'electric-crack', reaction: 'stun' },
  FIRE: { startupMs: 520, activeMs: 380, recoveryMs: 650, hitCount: 3, range: 600, projectile: true, soundCue: 'flame-roar', reaction: 'launch' },
  ICE: { startupMs: 470, activeMs: 300, recoveryMs: 620, hitCount: 2, range: 570, projectile: true, soundCue: 'ice-shatter', reaction: 'freeze' },
  SHADOW: { startupMs: 600, activeMs: 260, recoveryMs: 760, hitCount: 1, range: 560, projectile: true, soundCue: 'void-pulse', reaction: 'guard-break' },
  SOLAR: { startupMs: 560, activeMs: 320, recoveryMs: 700, hitCount: 3, range: 620, projectile: true, soundCue: 'solar-burst', reaction: 'launch' },
  WIND: { startupMs: 260, activeMs: 240, recoveryMs: 430, hitCount: 2, range: 640, projectile: true, soundCue: 'wind-slice', reaction: 'knockback' },
  SHIELD: { startupMs: 180, activeMs: 900, recoveryMs: 260, hitCount: 1, range: 130, projectile: false, soundCue: 'aegis-ring', reaction: 'heal' },
  IMPACT: { startupMs: 220, activeMs: 180, recoveryMs: 580, hitCount: 1, range: 150, projectile: false, soundCue: 'meteor-impact', reaction: 'launch' },
  PLASMA: { startupMs: 420, activeMs: 260, recoveryMs: 560, hitCount: 2, range: 610, projectile: true, soundCue: 'plasma-charge', reaction: 'stun' },
  SPEED: { startupMs: 140, activeMs: 160, recoveryMs: 390, hitCount: 3, range: 190, projectile: false, soundCue: 'phantom-dash', reaction: 'knockback' },
  WATER: { startupMs: 440, activeMs: 420, recoveryMs: 600, hitCount: 3, range: 640, projectile: true, soundCue: 'tidal-surge', reaction: 'launch' },
  HEAL: { startupMs: 240, activeMs: 500, recoveryMs: 300, hitCount: 1, range: 120, projectile: false, soundCue: 'healing-chime', reaction: 'heal' },
}

export function getAttackProfile(power: CombatPower): AttackProfile {
  const base = profiles[power.type] ?? {}
  const damage = Math.round(10 + power.strength * 0.16)
  return {
    startupMs: base.startupMs ?? 400,
    activeMs: base.activeMs ?? 240,
    recoveryMs: base.recoveryMs ?? 560,
    damage,
    hitCount: base.hitCount ?? 1,
    range: base.range ?? 540,
    hitbox: { x: 0, y: -74, width: base.projectile === false ? 138 : 190, height: 148 },
    projectile: base.projectile ?? true,
    soundCue: base.soundCue ?? 'energy-release',
    reaction: base.reaction ?? 'knockback',
  }
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

/** Resolve the power-strength contest, then apply a directional world-space hitbox test. */
export function resolveExchange(
  blue: CombatPower,
  red: CombatPower,
  blueHealth: number,
  redHealth: number,
): ExchangeResult {
  const blueProfile = getAttackProfile(blue)
  const redProfile = getAttackProfile(red)
  const winner: CombatSide = blue.strength === red.strength
    ? (Math.random() < 0.5 ? 'blue' : 'red')
    : blue.strength > red.strength ? 'blue' : 'red'
  const winningPower = winner === 'blue' ? blue : red
  const profile = winner === 'blue' ? blueProfile : redProfile
  // Two mirrored fighter lanes use a world-space AABB contact test. Ranged
  // moves travel from the attacker's front edge; melee moves first lunge into
  // their authored reach, then test the actual local hitbox against the target.
  const attacker = winner === 'blue'
    ? { x: 0, y: 0, width: 120, height: 180 }
    : { x: 520, y: 0, width: 120, height: 180 }
  const target = winner === 'blue'
    ? { x: 520, y: 0, width: 120, height: 180 }
    : { x: 0, y: 0, width: 120, height: 180 }
  const laneGap = winner === 'blue'
    ? target.x - (attacker.x + attacker.width)
    : attacker.x - (target.x + target.width)
  const meleeReach = profile.range + profile.hitbox.width
  const lunge = profile.projectile ? 0 : Math.max(0, laneGap - meleeReach + 3)
  const hitboxWidth = profile.projectile ? profile.range : meleeReach
  const attackBox = winner === 'blue'
    ? {
        x: attacker.x + attacker.width + lunge + profile.hitbox.x,
        y: attacker.y + 74 + profile.hitbox.y,
        width: hitboxWidth,
        height: profile.hitbox.height,
      }
    : {
        x: attacker.x - lunge - hitboxWidth - profile.hitbox.x,
        y: attacker.y + 74 + profile.hitbox.y,
        width: hitboxWidth,
        height: profile.hitbox.height,
      }
  const targetBox = { x: target.x, y: target.y + 0, width: target.width, height: target.height }
  const hitboxConnected = overlaps(attackBox, targetBox)
  const victim: CombatSide = winner === 'blue' ? 'red' : 'blue'
  const rawDamage = hitboxConnected ? profile.damage + Math.max(0, profile.hitCount - 1) * Math.round(profile.damage * 0.12) : 0
  const shieldPower = victim === 'blue' ? blue : red
  const shielded = shieldPower.type === 'SHIELD'
  const damage = rawDamage ? (shielded ? Math.max(2, Math.round(rawDamage * 0.28)) : rawDamage) : 0
  const blueHeal = blue.type === 'HEAL' && winner === 'blue' ? 12 : 0
  const redHeal = red.type === 'HEAL' && winner === 'red' ? 12 : 0
  const blueDamage = victim === 'blue' ? damage : 0
  const redDamage = victim === 'red' ? damage : 0
  const hitCount = hitboxConnected ? profile.hitCount : 0
  return {
    winner, victim, damage, blueDamage, redDamage,
    blueHealth: Math.min(100, Math.max(0, blueHealth - blueDamage + blueHeal)),
    redHealth: Math.min(100, Math.max(0, redHealth - redDamage + redHeal)),
    blueHeal, redHeal, hitCount,
    comboLabel: hitCount > 1 ? `${hitCount}-HIT COMBO` : 'DIRECT HIT',
    profile, hitboxConnected,
  }
}
