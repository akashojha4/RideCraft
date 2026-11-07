import { describe, expect, it } from 'vitest'
import { getModule, validateCurriculum } from '@/content/curriculum'
import { cockpitScenarios, getCockpitScenario } from '@/content/scenarios/cockpit'

describe('Riding Situations module', () => {
  const m = getModule('riding-situations')!

  it('is in the curriculum with a lesson for every cockpit scenario, basics first', () => {
    expect(m).toBeDefined()
    expect(m.lessons.map((l) => l.id)).toEqual(['starting-and-moving-off', 'stopping-without-stalling', 'using-the-clutch', 'changing-gear', 'using-the-brakes', 'hill-start', 'riding-downhill', 'wet-road', 'gravel', 'emergency-braking', 'traffic-signal', 'moving-in-traffic', 'slow-traffic', 'speed-breaker', 'pothole', 'sudden-obstacle', 'overtaking', 'highway', 'u-turn'])
    expect(m.lessons.map((l) => l.situation!.scenario).sort()).toEqual(cockpitScenarios.map((s) => s.id).sort())
  })

  it('passes the curriculum validator (with every other module)', () => {
    expect(validateCurriculum()).toEqual([])
  })

  it('each lesson teaches an existing cockpit scenario that has a demonstration, by its stable id', () => {
    for (const l of m.lessons) {
      const sc = getCockpitScenario(l.situation!.scenario)
      expect(sc, l.id).toBeDefined()
      expect(sc!.demo?.length).toBe(sc!.steps.length)
      expect(l.knowledgeCheck).toHaveLength(3)
      for (const q of l.knowledgeCheck) expect(q.explanation.length).toBeGreaterThan(40)
    }
  })

  it('explains each control in all seven parts, and each mistake with its fix', () => {
    for (const l of m.lessons) {
      for (const c of l.situation!.controls) for (const k of ['what', 'when', 'how', 'howMuch', 'why', 'mechanics', 'result'] as const) expect(c[k].length, `${l.id} ${c.control}.${k}`).toBeGreaterThan(20)
      expect(l.situation!.mistakes.length).toBeGreaterThanOrEqual(4)
      for (const mk of l.situation!.mistakes) for (const k of ['does', 'feels', 'mechanics', 'motorcycle', 'cause', 'fix'] as const) expect(mk[k].length, `${l.id} ${mk.title}.${k}`).toBeGreaterThan(10)
    }
  })

  it('mistakes the cockpit spots are ones its scenario really detects and explains', () => {
    for (const l of m.lessons) {
      const sc = getCockpitScenario(l.situation!.scenario)!
      for (const mk of l.situation!.mistakes) if (mk.cockpit) expect(sc.mistakes.map((x) => x.id), `${l.id}: ${mk.title}`).toContain(mk.cockpit)
    }
  })
})
