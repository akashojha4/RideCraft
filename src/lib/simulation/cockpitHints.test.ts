import { describe, expect, it } from 'vitest'
import { drivelineSpeed, initialPowertrain, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import { nextHint } from './cockpitHints'
import { derivePowertrain } from './models/powertrain'

const inputs = (over: Partial<PowertrainInputs> = {}): PowertrainInputs => ({ clutch: 0, throttle: 0, brake: 0, front: 0, rear: 0, gear: 0, grade: 0, ...over })
const hint = (s: PowertrainState, i: PowertrainInputs) => nextHint(s, i, derivePowertrain(s, i))

describe('cockpit hints', () => {
  it('starts with the starter', () => {
    expect(hint(initialPowertrain({ running: false, engine: 0 }), inputs())).toMatch(/Press Start/)
    expect(hint(initialPowertrain({ running: false, engine: 0 }), inputs({ gear: 1 }))).toMatch(/clutch in.*then press Start/)
  })
  it('walks through pulling away', () => {
    expect(hint(initialPowertrain(), inputs())).toMatch(/first gear/)
    expect(hint(initialPowertrain(), inputs({ gear: 1, clutch: 1 }))).toMatch(/Open the throttle a little/)
  })
  it('suggests changing up when the engine revs hard, and down when it labours', () => {
    const fast = 33 / 3.6
    expect(hint(initialPowertrain({ speed: fast, engine: drivelineSpeed(fast, 1), locked: true }), inputs({ gear: 1, throttle: 0.5 }))).toMatch(/next gear/)
    const slow = 12 / 3.6
    expect(hint(initialPowertrain({ speed: slow, engine: drivelineSpeed(slow, 4), locked: true }), inputs({ gear: 4, throttle: 0.5 }))).toMatch(/change down/)
  })
  it('puts a locked front wheel first', () => {
    const s = { ...initialPowertrain({ speed: 10 }), brakes: { front: { force: 0, grip: 0, locked: true, abs: false }, rear: { force: 0, grip: 0, locked: false, abs: false } } }
    expect(hint(s, inputs({ gear: 2 }))).toMatch(/locked front wheel/)
  })
  it('stays quiet when there is nothing to suggest', () => {
    const v = 40 / 3.6
    expect(hint(initialPowertrain({ speed: v, engine: drivelineSpeed(v, 3), locked: true }), inputs({ gear: 3, throttle: 0.3 }))).toBeNull()
  })
})
