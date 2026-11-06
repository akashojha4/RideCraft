import { describe, expect, it } from 'vitest'
import { G, frontShare } from './braking'
import { gripLean, leanFor, steerFor } from './cornering'
import { PRIMARY_RATIO, gearRatio, overallRatio, rpmAtSpeed, shiftLever } from './gearbox'
import { CLUTCH_CAPACITY, fullThrottleTorque, rpmPerKmh } from './powertrain'

/*
 * Pins the figures checked in the Phase 1 accuracy audit, so a model change that moves them
 * is noticed. Where a lesson quotes a figure, the lesson is named.
 */

describe('gearing (basics/understanding-gears, mechanics/gear-ratios)', () => {
  it('has about 30 : 1 overall in first and 9.6 : 1 in fifth', () => {
    expect(overallRatio(1)).toBeCloseTo(30.15, 1)
    expect(overallRatio(5)).toBeCloseTo(9.65, 1)
  })
  it('turns about 267 RPM per km/h in first and 86 in fifth', () => {
    expect(rpmPerKmh(1)).toBeCloseTo(267, 0)
    expect(rpmPerKmh(5)).toBeCloseTo(86, -0.5)
  })
  it('labours at about 3,400 RPM at 40 km/h in fifth and passes the redline in first', () => {
    expect(rpmAtSpeed(40, 5)).toBeCloseTo(3420, -1)
    expect(rpmAtSpeed(40, 1)).toBeGreaterThan(9000)
  })
  it('gives about 48 km/h at 6,000 RPM in third (basics/understanding-drivetrain)', () => {
    expect(6000 / rpmAtSpeed(1, 3)).toBeCloseTo(48, 0)
  })
  it('shifts 1–N–2–3–4–5 with a half-shift to neutral', () => {
    expect(shiftLever(0, 'down').gear).toBe(1)
    expect(shiftLever(0, 'up').gear).toBe(2)
    expect(shiftLever(1, 'up').gear).toBe(2)
    expect(shiftLever(1, 'half').gear).toBe(0)
    expect(shiftLever(2, 'half').gear).toBe(0)
    expect(shiftLever(3, 'half').moved).toBe(false)
    expect(gearRatio(1)).toBe(3)
  })
})

describe('clutch (mechanics/clutch-plates)', () => {
  it('can carry about 60 N·m at the clutch, about 1.75 × peak engine torque arriving there', () => {
    const atClutch = CLUTCH_CAPACITY * PRIMARY_RATIO
    expect(atClutch).toBeCloseTo(60, 0)
    expect(atClutch / (fullThrottleTorque(6500) * PRIMARY_RATIO)).toBeCloseTo(1.76, 1)
  })
})

describe('load transfer (mechanics/weight-transfer)', () => {
  it('puts 45 % on the front at rest, about 68 % at 0.5 g and 86 % at 0.9 g of braking', () => {
    expect(frontShare(0)).toBeCloseTo(0.45)
    expect(frontShare(-0.5 * G)).toBeCloseTo(0.68, 2)
    expect(frontShare(-0.9 * G)).toBeCloseTo(0.865, 2)
  })
})

describe('cornering (handling/leaning, handling/slow-speed)', () => {
  it('limits lean to about 42° dry and 27° wet', () => {
    expect(gripLean(0.9)).toBeCloseTo(42, 0)
    expect(gripLean(0.5)).toBeCloseTo(26.6, 1)
  })
  it('needs the same lean whatever the mass: tan(lean) = v² / gR', () => {
    const v = 50 / 3.6
    expect(Math.tan((leanFor(v, 30) * Math.PI) / 180)).toBeCloseTo((v * v) / (G * 30))
  })
  it('needs about 30° of steering to hold a 5° lean at 5 km/h', () => {
    expect(steerFor(5 / 3.6, 5)).toBeCloseTo(30, 0)
  })
})
