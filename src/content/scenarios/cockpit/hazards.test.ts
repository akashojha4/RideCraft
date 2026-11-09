import { describe, expect, it } from 'vitest'
import { carGap } from '@/lib/simulation/cockpitWorld'
import { highway, overtaking, pothole, suddenObstacle } from './hazards'
import { ride } from './scriptedRider'

describe('hazard cockpit scenarios', () => {
  it('pothole: slowed and in second before it, off the brakes over it, away above 25', () => {
    const r = ride(pothole, [
      [(_t, s) => (s.speed * 3.6 > 16 ? { throttle: 0, front: 0.32, rear: 0.1 } : { front: 0, rear: 0, clutch: 1, gear: 2 }), 6],
      [(t) => ({ clutch: Math.max(0, 1 - t * 1.2), throttle: 0.12 }), 8],
      [(t) => ({ throttle: Math.min(0.6, 0.15 + t * 0.3), clutch: 0 }), 6],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })

  it('pothole: arriving fast, or braking on it, is flagged', () => {
    expect(ride(pothole, [[() => ({}), 8]], { strict: false }).mistakes).toContain('bump-fast')
    const braking = ride(pothole, [[(_t, s) => (s.distance < 12 ? {} : { throttle: 0, clutch: 1, front: 0.28 }), 8]], { strict: false })
    expect(braking.mistakes).toContain('bump-braking')
    expect(braking.mistakes).not.toContain('bump-fast')
  })

  it('sudden obstacle: progressive braking stops short without locking', () => {
    const r = ride(suddenObstacle, [
      [(t) => ({ throttle: 0, front: Math.min(0.6, t * 1.2), rear: 0.1 }), 1.2],
      [() => ({ clutch: 1, front: 0.6, rear: 0.1 }), 4],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })

  it('sudden obstacle: riding on is a collision', () => {
    expect(ride(suddenObstacle, [[() => ({}), 6]], { strict: false }).mistakes).toContain('collision')
  })

  it('overtaking: holding 40 km/h keeps a two-second gap; accelerating closes in', () => {
    const r = ride(overtaking, [
      [() => ({ throttle: 0.22 }), 2.2],
      [() => ({ throttle: 0.22 }), 4],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(carGap(r.w, r.s.distance)).toBeGreaterThan(20)

    const close = ride(overtaking, [[() => ({ throttle: 0.8 }), 8]], { strict: false })
    expect(close.mistakes.some((m) => m === 'tailgating' || m === 'collision')).toBe(true)
  })

  it('highway: two-second gap, then a hard stop when the car brakes', () => {
    const r = ride(highway, [
      [() => ({ throttle: 0.35 }), 2.5],
      [(t) => (t < 1.1 ? { throttle: 0.35 } : { throttle: 0, front: Math.min(0.55, 0.15 + (t - 1.1) * 0.5), rear: 0.08 }), 4],
      [() => ({ clutch: 1, front: 0.5, rear: 0.08 }), 6],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(carGap(r.w, r.s.distance)).toBeGreaterThan(1)
  })

  it('highway: holding throttle after the car brakes reaches it', () => {
    const r = ride(highway, [[() => ({ throttle: 0.35 }), 10]], { strict: false })
    expect(r.mistakes).toContain('collision')
  })
})
