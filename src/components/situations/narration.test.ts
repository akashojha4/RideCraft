import { describe, expect, it } from 'vitest'
import { getModule } from '@/content/curriculum'
import { getCockpitScenario } from '@/content/scenarios/cockpit'
import { buildNarration, speakable } from './narration'
import { SECTIONS } from './sections'

describe('lesson narration', () => {
  const lessons = getModule('riding-situations')!.lessons.filter((l) => l.situation?.narrated)

  it('the pilot narrates the two Batch A lessons', () => {
    expect(lessons.map((l) => l.id)).toEqual(['starting-and-moving-off', 'stopping-without-stalling'])
  })

  for (const l of lessons) {
    const sc = getCockpitScenario(l.situation!.scenario)!
    const cues = buildNarration(l, sc)
    it(`${l.id}: walks through all seven sections in order`, () => {
      const order = [...new Set(cues.map((c) => c.section))]
      expect(order).toEqual(SECTIONS.map((s) => s.id))
    })
    it(`${l.id}: covers every control (with its mechanics), stage, demonstration step and mistake`, () => {
      for (const c of l.situation!.controls) {
        expect(cues.some((q) => q.control === c.control && !q.detail && q.text.includes(c.howMuch))).toBe(true)
        expect(cues.some((q) => q.control === c.control && q.detail && q.text.includes(c.mechanics))).toBe(true)
      }
      expect(cues.filter((q) => q.section === 'timeline' && q.text.startsWith('Stage')).map((q) => q.stage)).toEqual(sc.steps.map((_, k) => k))
      expect(cues.filter((q) => q.demoStep !== undefined).map((q) => q.demoStep)).toEqual(sc.demo!.map((_, k) => k))
      expect(cues.filter((q) => q.section === 'mistakes' && q.text.includes('To correct it')).length).toBe(l.situation!.mistakes.length)
    })
    it(`${l.id}: every cue has text, and ids are unique`, () => {
      expect(cues.every((c) => c.text.length > 10)).toBe(true)
      expect(new Set(cues.map((c) => c.id)).size).toBe(cues.length)
    })
  }

  it('says units and symbols in words', () => {
    expect(speakable('about 40 km/h, 12–36 % pulled — at 2500 RPM, 0.8 g, 265 N')).toBe('about 40 kilometres per hour, 12–36 percent pulled, at 2500 R P M, 0.8 g, 265 N')
    expect(speakable('roughly 12 m, in 3 s; the lean grows as v² / g·R')).toBe('roughly 12 metres, in 3 seconds; the lean grows as v squared over g times R')
  })
})
