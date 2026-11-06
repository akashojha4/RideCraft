import { describe, expect, it } from 'vitest'
import { ROAD_HALF } from '@/lib/simulation/cockpitWorld'
import { ride } from './scriptedRider'
import { uTurn } from './uTurn'

/** Clutch by feel in the friction zone: slip more when faster than walking pace, less when slower. */
const walk = (s: { speed: number }) => ({ throttle: 0.15, clutch: s.speed > 2 ? 0.36 : s.speed < 1.2 ? 0.3 : 0.33 })

describe('U-turn', () => {
  it('first gear, full lock, round at walking pace, straight and away — inside the road', () => {
    const r = ride(uTurn, [
      [(t) => (t < 0.4 ? { clutch: 1 } : { gear: 1 }), 0.6],
      [() => ({ steer: 1 }), 0.2],
      [(_t, s) => walk(s), 8],
      [(_t, s) => ({ steer: 0, ...walk(s) }), 2],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes.filter((m) => m !== 'lurch')).toEqual([])
    expect(Math.abs(r.w.pose!.y)).toBeLessThan(ROAD_HALF)
  })

  it('too much speed at full lock, the front brake at lock and running wide are all flagged', () => {
    const fast = ride(uTurn, [[(t) => (t < 0.4 ? { clutch: 1 } : t < 0.6 ? { gear: 1, steer: 1 } : { throttle: 0.5, clutch: Math.max(0, 0.42 - (t - 0.6) * 0.15) }), 6]], { strict: false })
    expect(fast.mistakes).toContain('too-fast-turn')
    const front = ride(uTurn, [[(t, s) => (t < 0.4 ? { clutch: 1 } : t < 0.6 ? { gear: 1, steer: 1 } : t < 3 ? walk(s) : { ...walk(s), front: 0.2 }), 4]], { strict: false })
    expect(front.mistakes).toContain('lock-front-brake')
    const wide = ride(uTurn, [[(t, s) => (t < 0.4 ? { clutch: 1 } : t < 0.6 ? { gear: 1, steer: 1 } : t < 3.5 ? walk(s) : { ...walk(s), steer: 0 }), 9]], { strict: false })
    expect(wide.mistakes).toContain('kerb')
  })
})
