import { describe, expect, it } from 'vitest'
import { carGap, personGap } from '@/lib/simulation/cockpitWorld'
import { obstacleNoEscape, pedestrianWetBehind, pillion } from './fullWorld'
import { ride } from './scriptedRider'

describe('full-world cockpit scenarios', () => {
  it('pillion: extra mass still stops at the red light', () => {
    const r = ride(pillion, [
      [() => ({ throttle: 0 }), 0.7],
      [(_t, s) => ({ throttle: 0, front: Math.min(0.45, (s.speed * s.speed) / (2 * Math.max(0.5, 40 - s.distance)) / 9.81), rear: 0.08 }), 3.5],
      [() => ({ throttle: 0, clutch: 1, front: 0.35, rear: 0.08 }), 6],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(r.s.distance).toBeLessThan(40)
  })

  it('pedestrian-wet-behind: stops short of the person', () => {
    const r = ride(pedestrianWetBehind, [
      [() => ({ throttle: 0 }), 0.8],
      [(_t, s) => (s.speed * 3.6 > 16 ? { throttle: 0, front: 0.2, rear: 0.05 } : { throttle: 0, clutch: 1, front: 0.18, rear: 0.05 }), 3.2],
      [() => ({ clutch: 1, front: 0.2, rear: 0.05 }), 7],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(personGap(r.w, r.s.distance)).toBeGreaterThan(1)
  })

  it('obstacle-no-escape: a wet stop from 30, still in lane', () => {
    const r = ride(obstacleNoEscape, [
      [() => ({ throttle: 0 }), 0.5],
      [(_t, s) => (s.speed * 3.6 > 10 ? { throttle: 0, front: 0.2, rear: 0.05 } : { throttle: 0, clutch: 1, front: 0.18, rear: 0.05 }), 2.2],
      [() => ({ clutch: 1, front: 0.2, rear: 0.05 }), 5],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(personGap(r.w, r.s.distance)).toBeGreaterThan(1)
    expect(carGap(r.w, r.s.distance)).toBeNull()
  })
})
