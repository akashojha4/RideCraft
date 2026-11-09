import { describe, expect, it } from 'vitest'
import { carGap, personGap } from '@/lib/simulation/cockpitWorld'
import { followingOneSecondWet, followingWithRoom, overtakeGap, pedestrianAhead, potholeLate } from './progressive'
import { ride } from './scriptedRider'

describe('progressive cockpit scenarios', () => {
  it('pedestrian-ahead: ease, slow, stop short of the crossing', () => {
    const r = ride(pedestrianAhead, [
      [() => ({ throttle: 0 }), 0.8],
      [(_t, s) => (s.speed * 3.6 > 18 ? { throttle: 0, front: 0.32, rear: 0.08 } : { throttle: 0, clutch: 1, front: 0.28, rear: 0.08 }), 2.8],
      [() => ({ clutch: 1, front: 0.35, rear: 0.08 }), 6],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(personGap(r.w, r.s.distance)).toBeGreaterThan(1)
  })

  it('following-with-room: hold the gap, then match the slowing car', () => {
    const r = ride(followingWithRoom, [
      [() => ({ throttle: 0.28 }), 2.4],
      [(t) => (t < 0.8 ? { throttle: 0.28 } : { throttle: 0, front: Math.min(0.22, 0.08 + (t - 0.8) * 0.25), rear: 0.06 }), 3.5],
      [() => ({ throttle: 0.12, front: 0, rear: 0 }), 4.5],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })

  it('following-one-second-wet: open the gap, then a wet stop', () => {
    const r = ride(followingOneSecondWet, [
      [() => ({ throttle: 0 }), 3.8],
      [(t) => (t < 1.4 ? { throttle: 0 } : { throttle: 0, front: Math.min(0.22, (t - 1.4) * 0.25), rear: 0.04 }), 2.2],
      [() => ({ clutch: 1, front: 0.22, rear: 0.04 }), 8],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(carGap(r.w, r.s.distance)).toBeGreaterThan(1)
  })

  it('pothole-late: brake at once, off the brakes over it, away', () => {
    const r = ride(potholeLate, [
      [(t, s) => (s.speed * 3.6 > 16 ? { throttle: 0, front: Math.min(0.32, 0.08 + t * 0.7), rear: 0.08 } : { front: 0, rear: 0, clutch: 1, gear: 2 }), 4],
      [(t) => ({ clutch: Math.max(0, 1 - t * 1.2), throttle: 0.12, gear: 2 }), 5],
      [(t) => ({ throttle: Math.min(0.7, 0.2 + t * 0.35), clutch: 0, gear: 2 }), 7],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })

  it('overtake-gap: hold 40, change to third, stay behind', () => {
    const r = ride(overtakeGap, [
      [() => ({ throttle: 0.22 }), 2.2],
      [(t) => (t < 0.35 ? { clutch: 1, throttle: 0 } : t < 0.5 ? { clutch: 1, throttle: 0, gear: 3 } : { clutch: Math.max(0, 1 - (t - 0.5) * 1.4), throttle: 0.16, gear: 3 }), 2.4],
      [() => ({ throttle: 0.18, gear: 3, clutch: 0 }), 5],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(carGap(r.w, r.s.distance)).toBeGreaterThan(20)
  })
})
