import { describe, expect, it } from 'vitest'
import { carGap, lineGap } from '@/lib/simulation/cockpitWorld'
import { movingInTraffic, slowTraffic, speedBreaker, trafficSignal } from './traffic'
import { ride } from './scriptedRider'

/** Front brake for a steady stop 2 m before the stop line (deceleration v² / 2x, as a share of 1 g). */
const toLine = (s: { speed: number; distance: number }) => Math.min(0.5, Math.max(0.05, (s.speed * s.speed) / (2 * Math.max(0.5, 78 - s.distance)) / 9.81))

describe('traffic and hazard scenarios', () => {
  it('traffic signal: brakes on amber, stops at the line, waits in neutral', () => {
    const r = ride(trafficSignal, [
      [(_t, s) => (s.distance < 36 ? {} : { throttle: 0, front: toLine(s), rear: 0.05 }), 6],
      [(_t, s) => ({ clutch: s.speed < 4 ? 1 : 0, front: toLine(s), rear: 0.05 }), 8],
      [(t) => (t < 0.2 ? { gear: 0 } : {}), 0.5],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(lineGap(trafficSignal.world, r.s.distance)).toBeGreaterThanOrEqual(0)
  })

  it('traffic signal: riding on through the red is flagged', () => {
    const r = ride(trafficSignal, [[() => ({}), 10]], { strict: false })
    expect(r.mistakes).toContain('ran-red')
  })

  it('moving in traffic: ready on red, away after the car, second gear with a two-second gap', () => {
    const r = ride(movingInTraffic, [
      [(t) => (t < 0.4 ? { clutch: 1 } : { gear: 1 }), 0.6],
      [(t, s) => (t < 7 ? {} : { throttle: 0.3, clutch: s.locked ? 0 : Math.max(0, 0.42 - (t - 7) * 0.08) }), 14],
      [(t) => (t < 0.3 ? { clutch: 1, throttle: 0 } : t < 0.4 ? { gear: 2 } : { clutch: Math.max(0, 0.4 - (t - 0.4) * 0.3), throttle: 0.3 }), 5],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })

  it('moving in traffic: setting off before the car moves runs the red and reaches it', () => {
    const r = ride(movingInTraffic, [
      [(t) => (t < 0.4 ? { clutch: 1 } : { gear: 1 }), 0.6],
      [(t) => ({ throttle: 0.3, clutch: Math.max(0, 0.42 - t * 0.08) }), 6],
    ], { strict: false })
    expect(r.mistakes).toContain('collision')
  })

  it('moving in traffic: the light stays red while the learner is still on “Get ready”, and turns green 3 s after they move on', () => {
    const still = ride(movingInTraffic, [[(t) => (t < 0.4 ? { clutch: 1 } : { gear: 1 }), 8]], { strict: false })
    expect(still.w.signal).toBe('red')
    const on = ride(movingInTraffic, [[(t) => (t < 0.4 ? { clutch: 1 } : { gear: 1 }), 2], [() => ({}), 2.5]], { strict: false })
    expect(on.w.signal).toBe('red')
    const later = ride(movingInTraffic, [[(t) => (t < 0.4 ? { clutch: 1 } : { gear: 1 }), 2], [() => ({}), 3.5]], { strict: false })
    expect(later.w.signal).toBe('green')
  })

  it('slow traffic: creeps on the clutch, stops behind the car, follows again — no stall', () => {
    const r = ride(slowTraffic, [
      [() => ({ throttle: 0.15, clutch: 0.33 }), 1.5],
      // The car stops 5 s in (3.5 s into this step): crawl until then, then clutch in and brake.
      [(t, s) => (t < 3.4 ? {} : { clutch: 1, throttle: 0, rear: s.speed > 0.05 ? 0.3 : 0.2 }), 6],
      // It moves again 8 s in.
      [(t) => (t < 1 ? {} : { rear: 0, throttle: 0.2, clutch: Math.max(0.27, 0.4 - (t - 1) * 0.1) }), 5],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes.filter((m) => m !== 'lurch')).toEqual([])
    expect(carGap(r.w, r.s.distance)).toBeGreaterThan(1)
  })

  it('speed breaker: slowed and in second before it, off the brakes over it, away above 20', () => {
    const r = ride(speedBreaker, [
      [(_t, s) => (s.distance < 35 ? {} : s.speed * 3.6 > 14 ? { throttle: 0, front: 0.25, rear: 0.1 } : { front: 0, rear: 0, clutch: 1, gear: 2 }), 8],
      [(t) => ({ clutch: Math.max(0, 1 - t * 1.2), throttle: 0.12 }), 8],
      [(t) => ({ throttle: Math.min(0.6, 0.15 + t * 0.3), clutch: 0 }), 6],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })

  it('speed breaker: arriving fast, or braking on it, is flagged', () => {
    expect(ride(speedBreaker, [[() => ({}), 8]], { strict: false }).mistakes).toContain('bump-fast')
    const braking = ride(speedBreaker, [[(_t, s) => (s.distance < 47 ? {} : { throttle: 0, clutch: 1, front: s.speed * 3.6 > 12 ? 0.3 : 0.06 }), 10]], { strict: false })
    expect(braking.mistakes).toContain('bump-braking')
    expect(braking.mistakes).not.toContain('bump-fast')
  })
})
