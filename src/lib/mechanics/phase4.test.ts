import { describe, expect, it } from 'vitest'
import { G, SLIDING, WHEELBASE } from './braking'
import { LOCK_RADIUS, ROAD_LOCK, STEERING_LOCK, leanFor, roadSteer, turnRadius } from './cornering'
import { MASS, WHEEL_INERTIA, WHEEL_RADIUS, drivelineSpeed, initialPowertrain, stepPowertrain, type PowertrainInputs } from './powertrain'
import { mu } from './tyre'

const inputs = (over: Partial<PowertrainInputs> = {}): PowertrainInputs => ({ clutch: 0, throttle: 0, brake: 0, gear: 0, grade: 0, ...over })

describe('turning radius (handling/u-turns; Phase 1 H6)', () => {
  it('turns the wheel less at the road than at the bars, because of the rake', () => {
    expect(ROAD_LOCK).toBeLessThan(STEERING_LOCK)
    expect(ROAD_LOCK).toBeCloseTo(35.1, 1)
    expect(roadSteer(0)).toBe(0)
  })
  it('gives a full-lock radius inside the 1.9–2.9 m that owner’s manuals list for 125 cc motorcycles', () => {
    expect(LOCK_RADIUS).toBeGreaterThan(1.9)
    expect(LOCK_RADIUS).toBeLessThan(2.9)
    expect(LOCK_RADIUS).toBeCloseTo(2.26, 2)
  })
  it('measures at the front wheel, which runs outside the rear', () => {
    expect(turnRadius(STEERING_LOCK)).toBeGreaterThan(WHEELBASE / Math.tan((ROAD_LOCK * Math.PI) / 180))
  })
  it('needs about 13° of lean at 8 km/h round the full-lock circle, and passes the 40° footpeg limit above 15 km/h', () => {
    expect(leanFor(8 / 3.6, LOCK_RADIUS)).toBeCloseTo(12.5, 0)
    expect(leanFor(15 / 3.6, LOCK_RADIUS)).toBeLessThan(40)
    expect(leanFor(16 / 3.6, LOCK_RADIUS)).toBeGreaterThan(40)
  })
})

describe('sliding tyre grip (Phase 1 M4)', () => {
  it('is the same in the braking model and the tyre slip curve', () => {
    expect(SLIDING).toBeCloseTo(mu(1, 1), 1)
  })
})

describe('wheel inertia (Phase 1 M3)', () => {
  it('slows a coasting motorcycle by resistance ÷ (mass + wheel inertia / r²)', () => {
    const v = 20
    const s = stepPowertrain(initialPowertrain({ speed: v }), inputs(), 0.01)
    const resistance = 0.015 * MASS * G + 0.5 * 1.2 * 0.6 * v * v
    expect(-s.acceleration).toBeCloseTo(resistance / (MASS + WHEEL_INERTIA / WHEEL_RADIUS ** 2), 2)
  })
})

describe('locked rear wheel with the clutch engaged (Phase 1 M5)', () => {
  it('drags the engine down to a stall within a fraction of a second, not instantly', () => {
    const v = 30 / 3.6
    let s = initialPowertrain({ speed: v, engine: drivelineSpeed(v, 2), locked: true })
    const i = inputs({ gear: 2, rear: 1 })
    let t = 0
    while (s.running && t < 2) {
      s = stepPowertrain(s, i, 1 / 120)
      t += 1 / 120
    }
    expect(s.running).toBe(false)
    expect(s.stallCause).toBe('wheel')
    expect(t).toBeGreaterThan(0.03)
    expect(t).toBeLessThan(0.8)
  })
})
