import { describe, expect, it } from 'vitest'
import { G } from '@/lib/mechanics/braking'
import { drivelineSpeed, initialPowertrain, stepPowertrain, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import { derivePowertrain } from './models/powertrain'
import { FORK_RATE, FORK_TRAVEL, SAG, situation, suspension } from './roadResponse'

const inputs = (over: Partial<PowertrainInputs> = {}): PowertrainInputs => ({ clutch: 0, throttle: 0, brake: 0, front: 0, rear: 0, gear: 0, grade: 0, ...over })
function run(i: PowertrainInputs, kmh: number, seconds: number) {
  const v = kmh / 3.6
  let s: PowertrainState = v > 0 ? initialPowertrain({ speed: v, engine: drivelineSpeed(v, i.gear || 2), locked: i.gear > 0 }) : initialPowertrain()
  for (let t = 0; t < seconds; t += 1 / 120) s = stepPowertrain(s, i, 1 / 120)
  return { s, d: derivePowertrain(s, i) }
}

describe('suspension from load transfer', () => {
  it('sits at its sag at rest', () => {
    const sus = suspension(initialPowertrain())
    expect(sus.dive).toBeCloseTo(0)
    expect(sus.front).toBeCloseTo(SAG)
  })
  it('dives the fork under braking by the extra front load ÷ the fork rate, and extends the rear', () => {
    const s = { ...initialPowertrain(), loadAccel: -0.5 * G }
    const sus = suspension(s)
    // 0.46 × 0.5 = 23 % of 2,207 N moves forward: 508 N ÷ 14 kN/m ≈ 36 mm.
    expect(sus.dive).toBeCloseTo((0.6 / 1.3) * 0.5 * 225 * G / FORK_RATE * 1000, 0)
    expect(sus.squat).toBeLessThan(0)
  })
  it('squats the rear under acceleration', () => {
    expect(suspension({ ...initialPowertrain(), loadAccel: 0.3 * G }).squat).toBeGreaterThan(0)
  })
  it('bottoms the fork out in an emergency stop, but never past its travel', () => {
    const sus = suspension({ ...initialPowertrain(), loadAccel: -1.2 * G })
    expect(sus.bottomed).toBe(true)
    expect(sus.dive).toBeCloseTo((1 - SAG) * FORK_TRAVEL * 1000)
  })
})

describe('riding situations (the brief’s scenarios A–E)', () => {
  it('A: front brake only — load forward, fork dives', () => {
    const i = inputs({ gear: 2, clutch: 1, front: 0.4 })
    const { s, d } = run(i, 40, 0.5)
    const r = situation(s, i, d)
    expect(r.id).toBe('front-brake')
    expect(r.text).toMatch(/fork has compressed \d+ mm/)
  })
  it('B: rear brake only — slows gently, rear unloads', () => {
    const i = inputs({ gear: 2, clutch: 1, rear: 0.3 })
    const { s, d } = run(i, 40, 0.5)
    expect(situation(s, i, d).id).toBe('rear-brake')
    expect(-s.acceleration / G).toBeLessThan(0.45)
  })
  it('C: clutch in while moving — rolling on momentum, engine at idle', () => {
    const i = inputs({ gear: 2, clutch: 1 })
    const { s, d } = run(i, 40, 2.5)
    expect(situation(s, i, d).id).toBe('momentum')
  })
  it('D: throttle in first — accelerating, rear squats', () => {
    const i = inputs({ gear: 1, throttle: 0.6 })
    const { s, d } = run(i, 10, 0.5)
    const r = situation(s, i, d)
    expect(r.id).toBe('pulling-in-first')
    expect(r.text).toMatch(/rear squats \d+ mm/)
  })
  it('E: just after a downshift with the throttle closed — engine braking', () => {
    const i = inputs({ gear: 2 })
    const { s, d } = run(i, 30, 0.5)
    expect(situation(s, i, d, 1).id).toBe('downshift')
    expect(situation(s, i, d).id).toBe('engine-braking')
  })
  it('standing still', () => {
    const { s, d } = run(inputs(), 0, 0.2)
    expect(situation(s, inputs(), d).id).toBe('stationary')
  })
})
