import { describe, expect, it } from 'vitest'
import { CENTRE_LINE, HORIZON, LEFT_EDGE, MAX_BEND_ANGLE, NEAR, VIEW_H, VIEW_W, bendOffset, project, repeating, roadPoint, visibleLength } from './roadGeometry'

describe('first-person road geometry', () => {
  it('puts the nearest drawn point on the bottom edge and distant points towards the horizon', () => {
    expect(project(NEAR, 0).y).toBeCloseTo(VIEW_H)
    expect(project(1000, 0).y).toBeGreaterThan(HORIZON)
    expect(project(1000, 0).y - HORIZON).toBeLessThan(1)
  })
  it('keeps the rider in the left lane: centre line to the right, road edge to the left', () => {
    expect(project(10, CENTRE_LINE).x).toBeGreaterThan(VIEW_W / 2)
    expect(project(10, LEFT_EDGE).x).toBeLessThan(VIEW_W / 2)
  })
  it('converges: the same sideways offset shrinks with distance', () => {
    expect(Math.abs(project(50, 2).x - VIEW_W / 2)).toBeLessThan(Math.abs(project(10, 2).x - VIEW_W / 2))
  })
  it('bends the road the way the corner goes, more with distance', () => {
    expect(bendOffset(30, 1 / 100)).toBeGreaterThan(0)
    expect(bendOffset(30, -1 / 100)).toBeLessThan(0)
    expect(bendOffset(60, 1 / 100)).toBeCloseTo(4 * bendOffset(30, 1 / 100))
    expect(bendOffset(30, 0)).toBe(0)
  })
  it('streams repeating features towards the rider as distance grows', () => {
    const a = repeating(0, 10)[0]
    const b = repeating(3, 10)[0]
    expect(b.index).toBe(a.index)
    expect(b.d).toBeCloseTo(a.d - 3)
    // A feature that has passed the near limit is replaced by the next one.
    expect(repeating(a.d - NEAR + 0.01, 10)[0].index).toBe(a.index + 1)
  })
  it('follows an exact arc in a bend, matching the small-angle offset near the rider', () => {
    const c = 1 / 50
    expect(roadPoint(10, 0, c).side).toBeCloseTo(bendOffset(10, c), 1)
    // A quarter of the way round a 50 m circle: 50 m forward, 50 m to the side, never further.
    const q = roadPoint((Math.PI / 2) * 50, 0, c)
    expect(q.forward).toBeCloseTo(50)
    expect(q.side).toBeCloseTo(50)
    expect(roadPoint(30, 0, -c).side).toBeLessThan(0)
  })
  it('stops drawing a tight bend once it has turned out of sight', () => {
    expect(visibleLength(1 / 50)).toBeCloseTo(MAX_BEND_ANGLE * 50)
    expect(visibleLength(0)).toBeGreaterThan(300)
  })
})
