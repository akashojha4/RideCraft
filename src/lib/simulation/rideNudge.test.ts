import { describe, expect, it } from 'vitest'
import { rideNudge, type NudgeInputs } from './rideNudge'

const rest: NudgeInputs = { clutch: 0, throttle: 0, front: 0, rear: 0, gear: 0 }

describe('rideNudge', () => {
  it('calls out the starter, then a gear change, then the clutch', () => {
    expect(rideNudge(rest, rest, { started: true }).text).toMatch(/Start/)
    expect(rideNudge({ ...rest, gear: 0 }, { ...rest, gear: 1 }).text).toMatch(/pressing the gear lever down into first/)
    expect(rideNudge({ ...rest, gear: 1 }, { ...rest, gear: 2 }).text).toMatch(/lifting the gear lever into gear 2/)
    expect(rideNudge({ ...rest, gear: 1 }, { ...rest, gear: 0 }).text).toMatch(/neutral/)
    expect(rideNudge(rest, { ...rest, clutch: 0.4 }).text).toMatch(/pulling the clutch in/)
    expect(rideNudge({ ...rest, clutch: 0.5 }, { ...rest, clutch: 0.2 }).text).toMatch(/easing the clutch out/)
  })

  it('can name two controls that move together', () => {
    const n = rideNudge({ ...rest, clutch: 0.4, throttle: 0.1 }, { ...rest, clutch: 0.2, throttle: 0.3 })
    expect(n.text).toMatch(/clutch/)
    expect(n.text).toMatch(/throttle/)
  })

  it('says when the clutch is held in the friction zone', () => {
    expect(rideNudge({ ...rest, clutch: 0.3 }, { ...rest, clutch: 0.3 }).text).toMatch(/friction zone/)
  })
})
