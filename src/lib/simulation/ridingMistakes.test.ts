import { describe, expect, it } from 'vitest'
import { drivelineSpeed, initialPowertrain, stepPowertrain, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import { derivePowertrain } from './models/powertrain'
import { detectMistake, type MistakeId } from './ridingMistakes'

const inputs = (over: Partial<PowertrainInputs> = {}): PowertrainInputs => ({ clutch: 0, throttle: 0, brake: 0, front: 0, rear: 0, gear: 0, grade: 0, ...over })

/** Run with an input schedule, collecting every mistake spotted. */
function ride(start: PowertrainState, schedule: (t: number) => PowertrainInputs, seconds: number) {
  let s = start
  const seen = new Set<MistakeId>()
  for (let t = 0; t < seconds; t += 1 / 120) {
    const i = schedule(t)
    const next = stepPowertrain(s, i, 1 / 120)
    const m = detectMistake(s, next, i, derivePowertrain(next, i), 1 / 120)
    if (m) seen.add(m)
    s = next
  }
  return seen
}

describe('riding mistakes', () => {
  it('spots a stall from dropping the clutch in first with no throttle', () => {
    expect(ride(initialPowertrain(), () => inputs({ gear: 1 }), 2)).toContain('stall')
  })
  it('spots a jerky start from dumping the clutch with high revs', () => {
    const seen = ride(initialPowertrain(), (t) => inputs({ gear: 1, throttle: 0.9, clutch: t < 1 ? 1 : 0 }), 2)
    expect([...seen].some((m) => m === 'lurch' || m === 'slip-heat')).toBe(true)
  })
  it('spots revving hard with the clutch slipping', () => {
    expect(ride(initialPowertrain(), () => inputs({ gear: 1, throttle: 1, clutch: 0.28 }), 1.5)).toContain('slip-heat')
  })
  it('spots over-revving in first', () => {
    const v = 30 / 3.6
    expect(ride(initialPowertrain({ speed: v, engine: drivelineSpeed(v, 1), locked: true }), () => inputs({ gear: 1, throttle: 1 }), 3)).toContain('over-rev')
  })
  it('stays quiet for a smooth pull-away', () => {
    // A quarter throttle, the clutch let out over 3 s through the friction zone.
    const seen = ride(initialPowertrain(), (t) => inputs({ gear: 1, throttle: 0.25, clutch: t < 0.3 ? 1 : Math.max(0, 0.4 - (t - 0.3) * 0.12) }), 6)
    expect([...seen]).toEqual([])
  })
  it('spots a wheel locking when a brake is grabbed', () => {
    const v = 40 / 3.6
    expect(ride(initialPowertrain({ speed: v, engine: drivelineSpeed(v, 3), locked: true }), () => inputs({ gear: 3, clutch: 1, front: 1 }), 0.5)).toContain('front-lock')
    expect(ride(initialPowertrain({ speed: v, engine: drivelineSpeed(v, 3), locked: true }), () => inputs({ gear: 3, clutch: 1, rear: 1 }), 0.5)).toContain('rear-lock')
  })
})
