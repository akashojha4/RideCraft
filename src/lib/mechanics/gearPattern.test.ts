import { describe, expect, it } from 'vitest'
import { REVERSED_PATTERN, STANDARD_PATTERN, TOP_GEAR, shiftInPattern, shiftLever, type LeverAction } from './gearbox'

describe('gear patterns', () => {
  it('matches the existing 1-N-2-3-4-5 lever logic for every gear and action', () => {
    for (let g = 0; g <= TOP_GEAR; g++)
      for (const a of ['up', 'down', 'half'] as LeverAction[]) {
        const old = shiftLever(g, a)
        const now = shiftInPattern(STANDARD_PATTERN, g, a)
        expect([now.gear, now.moved]).toEqual([old.gear, old.moved])
      }
  })
  it('goes straight past neutral on a full movement, and finds it with a half movement', () => {
    expect(shiftInPattern(STANDARD_PATTERN, 1, 'up').gear).toBe(2)
    expect(shiftInPattern(STANDARD_PATTERN, 2, 'down').gear).toBe(1)
    expect(shiftInPattern(STANDARD_PATTERN, 1, 'half').gear).toBe(0)
    expect(shiftInPattern(STANDARD_PATTERN, 3, 'half').moved).toBe(false)
  })
  it('reverses the directions in the race pattern: lift for first, press for the rest', () => {
    expect(shiftInPattern(REVERSED_PATTERN, 0, 'up').gear).toBe(1)
    expect(shiftInPattern(REVERSED_PATTERN, 0, 'down').gear).toBe(2)
    expect(shiftInPattern(REVERSED_PATTERN, 1, 'down').gear).toBe(2)
    expect(shiftInPattern(REVERSED_PATTERN, 2, 'down').gear).toBe(3)
    expect(shiftInPattern(REVERSED_PATTERN, 5, 'down').moved).toBe(false)
    expect(shiftInPattern(REVERSED_PATTERN, 1, 'half').gear).toBe(0)
  })
})
