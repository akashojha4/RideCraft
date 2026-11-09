import { describe, expect, it } from 'vitest'
import { progressiveScenarios } from './progressive'

describe('progressive decision scenarios', () => {
  it('are numbered 15–32 with unique ids', () => {
    expect(progressiveScenarios.map((s) => s.number)).toEqual(Array.from({ length: 18 }, (_, i) => i + 15))
    expect(new Set(progressiveScenarios.map((s) => s.id)).size).toBe(18)
  })

  for (const sc of progressiveScenarios) {
    it(`${sc.id}: three choices, a safe run with frames, and at least one bad outcome`, () => {
      expect(sc.choices).toHaveLength(3)
      const results = sc.choices.map((c) => ({ id: c.id, out: sc.run(c.id) }))
      const safe = results.filter((r) => r.out.verdict === 'safe')
      const bad = results.filter((r) => r.out.verdict === 'risky' || r.out.verdict === 'crash')
      expect(safe.length, `${sc.id} safe`).toBeGreaterThan(0)
      expect(bad.length, `${sc.id} bad`).toBeGreaterThan(0)
      for (const r of results) {
        expect(r.out.frames.length, `${sc.id} ${r.id} frames`).toBeGreaterThan(5)
        expect(r.out.rider.length).toBeGreaterThan(20)
        expect(r.out.motorcycle.length).toBeGreaterThan(20)
        expect(r.out.explanation.length).toBeGreaterThan(20)
        expect(r.out.consequence.length).toBeGreaterThan(10)
        expect(r.out.metrics.length).toBeGreaterThan(0)
      }
    })
  }
})
