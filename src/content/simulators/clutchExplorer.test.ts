import { describe, expect, it } from 'vitest'
import { drivelineSpeed, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import { checkGuided, goToGuided, guidedComplete, startGuided } from '@/lib/simulation/guided'
import { STAGES } from '@/lib/simulation/model'
import { START, bitingPoint, clutchExplorerModel as model, deriveExplorer, guidedSteps } from './clutchExplorer'

const DT = 1 / 60

function run(i: PowertrainInputs, seconds: number, s: PowertrainState) {
  for (let t = 0; t < seconds; t += DT) s = model.step(s, i, DT)
  return s
}

describe('clutch explorer model', () => {
  it('says the engine drives the wheel when the clutch is locked and the throttle open', () => {
    const v = 30 / 3.6
    const i = { ...START, gear: 2, throttle: 0.5 }
    const s = run(i, 1, model.initial({ speed: v, engine: drivelineSpeed(v, 2), locked: true }))
    expect(deriveExplorer(s, i).source).toBe('engine')
  })

  it('says the wheel drives the engine with the throttle closed in gear (engine braking)', () => {
    const v = 30 / 3.6
    const i = { ...START, gear: 2 }
    const s = run(i, 0.5, model.initial({ speed: v, engine: drivelineSpeed(v, 2), locked: true }))
    expect(deriveExplorer(s, i).source).toBe('engine-braking')
  })

  it('says the motorcycle rolls on momentum with the clutch pulled in', () => {
    const v = 30 / 3.6
    const i = { ...START, gear: 2, clutch: 1 }
    const s = run(i, 2.5, model.initial({ speed: v, engine: drivelineSpeed(v, 2), locked: true }))
    const d = deriveExplorer(s, i)
    expect(d.source).toBe('momentum')
    // The engine has dropped back towards idle while the wheel keeps turning.
    expect(d.engineRpm).toBeLessThan(2000)
    expect(d.wheelSideRpm).toBeGreaterThan(d.engineRpm)
  })

  it('never passes more torque through the plates than they can carry', () => {
    let s = model.initial()
    for (let p = 1; p >= 0; p -= 0.002) {
      const i = { ...START, gear: 1, clutch: p, throttle: 0.3 }
      s = model.step(s, i, DT)
      const d = deriveExplorer(s, i)
      expect(Math.abs(d.passingNm)).toBeLessThanOrEqual(d.capacityNm + 0.05)
    }
  })

  it('explains every stage of cause and effect', () => {
    const s = model.initial()
    const e = model.explain(s, START, deriveExplorer(s, START))
    for (const stage of STAGES) expect(e.chain.some((l) => l.stage === stage)).toBe(true)
  })

  it('puts the biting point later in the lever travel on a cable clutch (more freeplay)', () => {
    expect(bitingPoint('cable')).toBeGreaterThan(bitingPoint('hydraulic'))
  })
})

describe('clutch explorer guided steps', () => {
  it('can be completed by riding them in order', () => {
    let p = startGuided(guidedSteps.length)
    let s = model.initial()
    let i: PowertrainInputs = { ...START }
    const advance = (fn: (t: number) => Partial<PowertrainInputs>, seconds: number) => {
      for (let t = 0; t < seconds; t += DT) {
        i = { ...i, ...fn(t) }
        s = model.step(s, i, DT)
        p = checkGuided(guidedSteps, p, s, i, deriveExplorer(s, i))
      }
      expect(p.done[p.index]).toBe(true)
      p = goToGuided(p, p.index + 1)
    }
    // 1. Pull the clutch in.
    advance((t) => ({ clutch: Math.min(1, t) }), 1.5)
    // 2. Select first gear.
    advance(() => ({ gear: 1 }), 0.3)
    // 3. Ease the lever out slowly from the disengaged side until it creeps.
    advance((t) => ({ clutch: Math.max(0.3, 0.4 - t * 0.04) }), 3)
    // 4. A little throttle, keep releasing until locked.
    advance((t) => ({ throttle: 0.2, clutch: Math.max(0, 0.3 - t * 0.12) }), 4)
    // 5. Accelerate past 15 km/h, then clutch in.
    advance(() => (s.speed < 16 / 3.6 && i.clutch < 0.5 ? { throttle: 0.6 } : { throttle: 0, clutch: 1 }), 8)
    // 6. Brake to a stop, clutch held in.
    advance(() => ({ brake: 0.5 }), 6)
    expect(guidedComplete(p)).toBe(true)
    expect(s.running).toBe(true)
  })
})
