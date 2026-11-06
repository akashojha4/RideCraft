import { describe, expect, it } from 'vitest'
import { CLUTCH, clampingForce, clutchMechanism, leverForClamp, pushrodTravel, springForce, torqueCapacity } from './clutch'

describe('clutch lever → pushrod', () => {
  it('takes up freeplay first: more on a cable clutch than a hydraulic one', () => {
    expect(pushrodTravel(0.1, 'cable')).toBe(0)
    expect(pushrodTravel(0.1, 'hydraulic')).toBeGreaterThan(0)
    expect(pushrodTravel(1, 'cable')).toBeCloseTo(CLUTCH.pushrodTravel)
    expect(pushrodTravel(1, 'hydraulic')).toBeCloseTo(CLUTCH.pushrodTravel)
  })
  it('reports the freeplay stage while the lever is moving but the pushrod is not', () => {
    expect(clutchMechanism(0, 'cable').stage).toBe('engaged')
    expect(clutchMechanism(0.08, 'cable').stage).toBe('freeplay')
    expect(clutchMechanism(1, 'cable').stage).toBe('disengaged')
  })
})

describe('clamp load', () => {
  it('is full with the lever released and zero once the plates separate', () => {
    expect(clampingForce(0)).toBe(1)
    expect(clampingForce(0.5)).toBe(0)
    expect(clutchMechanism(1).gap).toBeCloseTo(CLUTCH.pushrodTravel - CLUTCH.engagementTravel)
  })
  it('only ever falls as the lever is pulled', () => {
    let last = 2
    for (let p = 0; p <= 1; p += 0.01) {
      const c = clampingForce(p)
      expect(c).toBeLessThanOrEqual(last)
      last = c
    }
  })
  it('is not linear in lever travel: it falls fast at first and tails off near the biting point', () => {
    const start = leverForClamp(0.999)
    const end = leverForClamp(0.001)
    const mid = clampingForce((start + end) / 2)
    // A straight line would give 0.5 halfway through the friction zone.
    expect(mid).toBeLessThan(0.4)
    // The first quarter of the zone sheds far more clamp than the last quarter.
    const q = (end - start) / 4
    expect(1 - clampingForce(start + q)).toBeGreaterThan(3 * clampingForce(end - q))
  })
  it('has a friction zone much narrower than half the lever travel', () => {
    const width = leverForClamp(0.001) - leverForClamp(0.999)
    expect(width).toBeLessThan(0.3)
    expect(width).toBeGreaterThan(0.15)
  })
  it('loads the release mechanism more as the plate lifts (heavier lever)', () => {
    expect(springForce(2)).toBeGreaterThan(springForce(0))
  })
})

describe('torque capacity (mechanics/clutch-plates)', () => {
  it('carries about 60 N·m slipping — 8 surfaces × 0.13 × 1,150 N × 0.05 m — and more when gripping', () => {
    expect(torqueCapacity(1, true)).toBeCloseTo(59.8, 1)
    expect(torqueCapacity(1, false)).toBeGreaterThan(torqueCapacity(1, true))
  })
  it('scales with clamp load', () => {
    expect(torqueCapacity(0.5, true)).toBeCloseTo(torqueCapacity(1, true) / 2)
  })
})
