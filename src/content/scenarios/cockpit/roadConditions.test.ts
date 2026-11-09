import { describe, expect, it } from 'vitest'
import { crossGap } from '@/lib/simulation/cockpitWorld'
import { downhill, emergencyAbs, emergencyBraking, gravel, uphillStart, wetRoad } from './roadConditions'
import { ride } from './scriptedRider'

describe('road-condition scenarios', () => {
  it('hill start: brake held, biting point, then away without rolling back', () => {
    const r = ride(uphillStart, [
      [(t) => (t < 0.4 ? { clutch: Math.min(1, t * 4) } : { gear: 1 }), 0.6],
      [(t) => ({ throttle: 0.3, clutch: Math.max(0.3, 1 - t * 0.5) }), 3],
      [(t) => ({ rear: 0, throttle: 0.5, clutch: Math.max(0, 0.3 - t * 0.08) }), 6],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })

  it('hill start: letting the brake go in neutral rolls the motorcycle back', () => {
    const r = ride(uphillStart, [[() => ({ rear: 0 }), 1]], { strict: false })
    expect(r.mistakes).toContain('roll-back')
    expect(r.s.speed).toBeLessThan(-0.2)
  })

  it('downhill: gathers speed in third, brakes below 25, then second holds the speed', () => {
    const r = ride(downhill, [
      [() => ({}), 8],
      [(t) => ({ front: Math.min(0.22, t * 0.4), rear: 0.1 }), 3.2],
      [(t) => (t < 0.3 ? { front: 0, rear: 0, clutch: 1 } : t < 0.4 ? { gear: 2 } : { clutch: Math.max(0, 1 - (t - 0.4) * 0.8) }), 4],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })

  it('wet road: slow into the bend without locking; a grab that works in the dry locks the front', () => {
    const r = ride(wetRoad, [
      [() => ({ throttle: 0 }), 0.6],
      [(_t, s) => (s.speed * 3.6 > 32 ? { front: 0.2, rear: 0.05 } : { front: 0, rear: 0 }), 3.5],
      [() => ({ throttle: 0.22, front: 0, rear: 0, clutch: 0 }), 5.5],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    const grab = ride(wetRoad, [[() => ({ throttle: 0, front: 0.7 }), 1]], { strict: false })
    expect(grab.mistakes).toContain('front-lock')
  })

  it('gravel: rear brake then through the bend; the front locks far more easily than on tarmac', () => {
    const r = ride(gravel, [
      [() => ({ throttle: 0 }), 0.6],
      [(_t, s) => (s.speed * 3.6 > 18 ? { rear: 0.18 } : { rear: 0 }), 4],
      [() => ({ throttle: 0.14, rear: 0, front: 0, clutch: 0 }), 5],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    const grab = ride(gravel, [[() => ({ throttle: 0, front: 0.45 }), 1]], { strict: false })
    expect(grab.mistakes).toContain('front-lock')
  })

  it('emergency braking: a firm, progressive stop ends before the car; not braking hits it', () => {
    const r = ride(emergencyBraking, [
      [(t) => ({ throttle: 0, front: Math.min(0.6, t * 1.2), rear: 0.1 }), 1],
      [() => ({ clutch: 1, front: 0.6, rear: 0.1 }), 4],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(crossGap(emergencyBraking.world, r.s.distance)).toBeGreaterThan(1)
    const late = ride(emergencyBraking, [[() => ({ throttle: 0 }), 5]], { strict: false })
    expect(late.mistakes).toContain('collision')
  })

  it('emergency ABS: a grab stops short without locking', () => {
    const r = ride(emergencyAbs, [
      [() => ({ throttle: 0, clutch: 1, front: 1, rear: 0.25 }), 1],
      [() => ({ clutch: 1, front: 1, rear: 0.25 }), 4],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(crossGap(emergencyAbs.world, r.s.distance)).toBeGreaterThan(1)
  })
})
