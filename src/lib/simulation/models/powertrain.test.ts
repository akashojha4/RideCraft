import { describe, expect, it } from 'vitest'
import { PRIMARY_RATIO } from '@/lib/mechanics/gearbox'
import { drivelineSpeed, initialPowertrain, radToRpm, stepPowertrain, type PowertrainInputs } from '@/lib/mechanics/powertrain'
import { STAGES, chainComponents } from '../model'
import { derivePowertrain, powertrainModel } from './powertrain'

const inputs = (over: Partial<PowertrainInputs> = {}): PowertrainInputs => ({ clutch: 0, throttle: 0, brake: 0, gear: 0, grade: 0, ...over })

/** Run the model for `seconds` in 1/60 s frames, as the runtime does. */
function run(i: PowertrainInputs, seconds: number, state = powertrainModel.initial()) {
  let s = state
  for (let t = 0; t < seconds; t += 1 / 60) s = powertrainModel.step(s, i, 1 / 60)
  return s
}

describe('powertrain model adapter', () => {
  it('steps exactly like the physics function it wraps', () => {
    const i = inputs({ gear: 1, clutch: 0.3, throttle: 0.4 })
    let a = initialPowertrain()
    let b = powertrainModel.initial()
    for (let n = 0; n < 120; n++) {
      a = stepPowertrain(a, i, 1 / 60)
      b = powertrainModel.step(b, i, 1 / 60)
    }
    expect(b).toEqual(a)
  })

  it('derives the readouts the simulators used to compute inline', () => {
    const i = inputs({ gear: 1, clutch: 0.3, throttle: 0.5 })
    const s = run(i, 1)
    const d = derivePowertrain(s, i)
    expect(d.engineRpm).toBeCloseTo(Math.max(0, radToRpm(s.engine)))
    expect(d.wheelSideRpm).toBeCloseTo(Math.max(0, radToRpm(drivelineSpeed(s.speed, 1))))
    expect(d.slipping).toBe(s.running && !s.locked)
    expect(d.slipHeat).toBeCloseTo(d.slipping ? Math.abs(s.clutchTorque * (s.engine - drivelineSpeed(s.speed, 1))) : 0)
  })

  it('turns the mainshaft with the clutch hub in neutral only when the clutch is engaged', () => {
    const s = run(inputs(), 0.5)
    const engaged = powertrainModel.rotations!(s, inputs(), derivePowertrain(s, inputs()))
    expect(engaged.mainshaft).toBeCloseTo(engaged.crank! / PRIMARY_RATIO)
    const pulled = inputs({ clutch: 1 })
    expect(powertrainModel.rotations!(s, pulled, derivePowertrain(s, pulled)).mainshaft).toBe(0)
  })

  it('stops a locked wheel turning while the motorcycle slides on', () => {
    const s = { ...initialPowertrain({ speed: 10 }), brakes: { front: { force: 0, grip: 0, locked: true, abs: false }, rear: { force: 0, grip: 0, locked: false, abs: false } } }
    const r = powertrainModel.rotations!(s, inputs(), derivePowertrain(s, inputs()))
    expect(r.frontWheel).toBe(0)
    expect(r.rearWheel).toBeGreaterThan(0)
  })

  it('explains every stage of cause and effect', () => {
    const i = inputs({ gear: 1, clutch: 0.3, throttle: 0.4 })
    const s = run(i, 0.5)
    const e = powertrainModel.explain(s, i, derivePowertrain(s, i))
    for (const stage of STAGES) expect(e.chain.some((l) => l.stage === stage)).toBe(true)
    expect(chainComponents(e.chain, 'mechanism')).toContain('clutch')
  })

  it('reports a stall', () => {
    // First gear, clutch dropped from standstill with no throttle: the engine is dragged down.
    const i = inputs({ gear: 1 })
    const s = run(i, 2)
    expect(s.running).toBe(false)
    expect(powertrainModel.explain(s, i, derivePowertrain(s, i)).tone).toBe('danger')
  })
})
