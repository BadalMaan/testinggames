const frequencies: Record<string, number> = {
  LIGHTNING: 720, FIRE: 180, ICE: 520, SHADOW: 92, SOLAR: 440,
  WIND: 330, SHIELD: 260, IMPACT: 110, PLASMA: 610, SPEED: 840,
  WATER: 240, HEAL: 660,
}

/** Small synthesized SFX so the arena works without external audio downloads. */
export function playPowerSound(type: string, strength = 75) {
  try {
    const AudioContextClass = window.AudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const now = context.currentTime
    const master = context.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.14, now + 0.025)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.62)
    master.connect(context.destination)
    const oscillator = context.createOscillator()
    const tone = context.createGain()
    oscillator.type = type === 'LIGHTNING' || type === 'PLASMA' ? 'sawtooth' : type === 'WATER' || type === 'WIND' ? 'triangle' : 'sine'
    const base = frequencies[type] ?? 300
    oscillator.frequency.setValueAtTime(base * (0.82 + strength / 450), now)
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(42, base * 0.42), now + 0.48)
    tone.gain.value = 0.7
    oscillator.connect(tone); tone.connect(master)
    oscillator.start(now); oscillator.stop(now + 0.64)
    if (type === 'IMPACT' || type === 'FIRE' || type === 'SOLAR') {
      const sub = context.createOscillator(); const subGain = context.createGain()
      sub.type = 'sine'; sub.frequency.setValueAtTime(72, now); sub.frequency.exponentialRampToValueAtTime(34, now + 0.24)
      subGain.gain.setValueAtTime(0.22, now); subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
      sub.connect(subGain); subGain.connect(context.destination); sub.start(now); sub.stop(now + 0.3)
    }
    window.setTimeout(() => { void context.close().catch(() => undefined) }, 900)
  } catch { /* Audio is an enhancement; combat must always work without it. */ }
}
