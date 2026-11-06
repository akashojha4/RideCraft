import { describe, expect, it } from 'vitest'
import { FINAL_RATIO, PRIMARY_RATIO, gearRatio } from '@/lib/mechanics/gearbox'
import { EFFICIENCY, drivelineSpeed, initialPowertrain, stepPowertrain, type PowertrainInputs } from '@/lib/mechanics/powertrain'
import { derivePowertrain } from './models/powertrain'
import { powerFlow } from './powerFlow'

const inputs = (over: Partial<PowertrainInputs> = {}): PowertrainInputs => ({ clutch: 0, throttle: 0, brake: 0, front: 0, rear: 0, gear: 0, grade: 0, ...over })
function riding(i: PowertrainInputs, kmh: number, seconds = 0.5) {
  const v = kmh / 3.6
  // Moving: engine tied to the wheel; standing still: idling.
  let s = v > 0 ? initialPowertrain({ speed: v, engine: drivelineSpeed(v, i.gear || 1), locked: i.gear > 0 }) : initialPowertrain()
  for (let t = 0; t < seconds; t += 1 / 120) s = stepPowertrain(s, i, 1 / 120)
  return { s, f: powerFlow(s, i, derivePowertrain(s, i)) }
}
const byId = (f: ReturnType<typeof powerFlow>, id: string) => f.stages.find((s) => s.id === id)!

describe('power flow', () => {
  it('drives every link when the clutch is locked in gear with the throttle open', () => {
    const { f } = riding(inputs({ gear: 2, throttle: 0.5 }), 30)
    expect(f.links.every((l) => l.state === 'driving')).toBe(true)
  })
  it('divides speed and multiplies torque at each reduction, keeping the power (less drivetrain losses)', () => {
    const { f } = riding(inputs({ gear: 2, throttle: 0.5 }), 30)
    const clutch = byId(f, 'clutch')
    const box = byId(f, 'gearbox')
    const wheel = byId(f, 'wheel')
    expect(box.torque / clutch.torque).toBeCloseTo(gearRatio(2), 3)
    expect(clutch.rpm! / box.rpm!).toBeCloseTo(gearRatio(2), 2)
    expect(byId(f, 'engine').rpm! / clutch.rpm!).toBeCloseTo(PRIMARY_RATIO, 2)
    expect(byId(f, 'rear-sprocket').torque / box.torque).toBeCloseTo(FINAL_RATIO * EFFICIENCY, 3)
    expect(wheel.power / box.power).toBeCloseTo(EFFICIENCY, 1)
  })
  it('stops the flow at the gearbox in neutral', () => {
    const { f } = riding(inputs({ gear: 0, throttle: 0.2 }), 0)
    expect(f.links[0].state).toBe('driving')
    expect(f.links[1]).toMatchObject({ state: 'none', reason: 'neutral — no gear selected' })
  })
  it('stops it at the clutch when the lever is pulled in', () => {
    const { f } = riding(inputs({ gear: 2, clutch: 1 }), 30)
    expect(f.links.slice(1).every((l) => l.state === 'none')).toBe(true)
    expect(f.links[1].reason).toBe('clutch pulled in')
  })
  it('reverses it under engine braking: the wheel turns the engine', () => {
    const { f } = riding(inputs({ gear: 2 }), 30)
    expect(f.links.every((l) => l.state === 'engine-braking')).toBe(true)
    expect(byId(f, 'wheel').force).toBeLessThan(0)
  })
  it('shows a slipping clutch, and the heat it makes', () => {
    let s = initialPowertrain()
    const i = inputs({ gear: 1, clutch: 0.3, throttle: 0.4 })
    for (let t = 0; t < 0.4; t += 1 / 120) s = stepPowertrain(s, i, 1 / 120)
    const f = powerFlow(s, i, derivePowertrain(s, i))
    expect(f.links[1].state).toBe('slipping')
    expect(f.slipLoss).toBeGreaterThan(0)
  })
  it('shows nothing flowing with the engine stopped', () => {
    const s = initialPowertrain({ running: false, engine: 0 })
    const f = powerFlow(s, inputs(), derivePowertrain(s, inputs()))
    expect(f.links[0]).toMatchObject({ state: 'none', reason: 'engine stopped' })
  })
  it('gives the chain a pull, not a torque: sprocket torque ÷ pitch radius', () => {
    const { f } = riding(inputs({ gear: 2, throttle: 0.5 }), 30)
    const chain = byId(f, 'chain')
    expect(chain.force).toBeCloseTo(chain.torque / 0.0382, -1)
  })
})
