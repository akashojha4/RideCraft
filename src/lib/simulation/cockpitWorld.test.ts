import { describe, expect, it } from 'vitest'
import { LOCK_RADIUS, carGap, initialWorld, lineGap, stepWorld, type WorldSpec } from './cockpitWorld'

describe('cockpit world', () => {
  it('keeps a stopped car where it is while the rider closes on it', () => {
    const spec: WorldSpec = { car: { gap: 30 } }
    let w = initialWorld(spec)
    for (let k = 0; k < 60; k++) w = stepWorld(spec, w, 1 / 60, 10)
    expect(carGap(w, 10)).toBeCloseTo(20)
    expect(w.t).toBeCloseTo(1)
  })
  it('moves a car off at its own speed', () => {
    const spec: WorldSpec = { car: { gap: 5, speed: (w) => (w.t > 1 ? 5 : 0) } }
    let w = initialWorld(spec)
    for (let k = 0; k < 180; k++) w = stepWorld(spec, w, 1 / 60, 0)
    expect(carGap(w, 0)).toBeCloseTo(15, 0)
  })
  it('runs a signal from time, the rider’s position and memory', () => {
    const spec: WorldSpec = {
      signal: {
        at: 60,
        colour: (w, d) => {
          if (w.mem.amberAt === undefined && d > 20) w.mem.amberAt = w.t
          return w.mem.amberAt === undefined ? 'green' : w.t - w.mem.amberAt < 3 ? 'amber' : 'red'
        },
      },
    }
    let w = initialWorld(spec)
    expect(w.signal).toBe('green')
    w = stepWorld(spec, w, 0.1, 25)
    expect(w.signal).toBe('amber')
    for (let k = 0; k < 40; k++) w = stepWorld(spec, w, 0.1, 30)
    expect(w.signal).toBe('red')
    expect(lineGap(spec, 30)).toBe(30)
  })
  it('turns a half circle of the lock radius at full lock, leaning as the speed needs', () => {
    const spec: WorldSpec = { pose: { y: -2.8 } }
    let w = initialWorld(spec)
    const v = 2
    const T = (Math.PI * LOCK_RADIUS) / v
    for (let t = 0; t < T; t += 1 / 600) w = stepWorld(spec, w, 1 / 600, 0, { speed: v, steer: 1 })
    expect(w.pose!.heading).toBeCloseTo(Math.PI, 1)
    expect(w.pose!.y).toBeCloseTo(-2.8 + 2 * LOCK_RADIUS, 1)
    expect(w.pose!.x).toBeCloseTo(0, 1)
    expect(w.pose!.lean).toBeCloseTo((Math.atan((v * v) / (9.81 * LOCK_RADIUS)) * 180) / Math.PI, 3)
    expect(w.pose!.trail.length).toBeGreaterThan(30)
  })
})
