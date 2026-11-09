import { describe, expect, it } from 'vitest'
import { getScenario } from './scenarios'
import { academyPath, academyPhases, getAcademyPhase, practicalChallenges, progressiveGroups } from './academy'
import { coreModules, getLesson } from './curriculum'

describe('academy path', () => {
  it('every step points at a real core lesson, once', () => {
    const keys = academyPath.map((s) => `${s.moduleId}/${s.lessonId}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const step of academyPath) {
      expect(getLesson(step.moduleId, step.lessonId), `${step.moduleId}/${step.lessonId}`).toBeDefined()
    }
  })

  it('covers every core lesson exactly once', () => {
    const path = new Set(academyPath.map((s) => `${s.moduleId}/${s.lessonId}`))
    const core = coreModules.flatMap((m) => m.lessons.map((l) => `${m.id}/${l.id}`))
    expect([...path].sort()).toEqual([...core].sort())
  })

  it('lesson Next follows the academy path, not the module file', () => {
    const slow = getLesson('handling', 'slow-speed')
    expect(slow?.place.title).toBe('Slow riding and turning')
    expect(slow?.place.step).toBe(1)
    expect(slow?.next?.lesson.id).toBe('u-turns')
    expect(slow?.previous?.lesson.id).toBe('using-the-brakes')
  })

  it('puts an emergency stop and countersteer before highway traffic', () => {
    const index = (id: string) => academyPath.findIndex((s) => s.lessonId === id)
    expect(index('emergency-braking')).toBeGreaterThan(-1)
    expect(index('countersteering')).toBeGreaterThan(-1)
    expect(index('emergency-braking')).toBeLessThan(index('highway'))
    expect(index('countersteering')).toBeLessThan(index('sudden-obstacle'))
    expect(index('using-the-brakes')).toBeLessThan(index('emergency-braking'))
  })

  it('phases are named and non-empty', () => {
    expect(academyPhases.length).toBeGreaterThanOrEqual(8)
    for (const p of academyPhases) {
      expect(p.lessons.length).toBeGreaterThan(0)
      expect(p.goal.length).toBeGreaterThan(20)
    }
  })

  it('each phase has a lookup id and lists every lesson', () => {
    for (const p of academyPhases) {
      expect(getAcademyPhase(p.id)?.lessons.length).toBe(p.lessons.length)
    }
  })
})

describe('practical challenges', () => {
  it('marks live-only work that the cockpit cannot do', () => {
    expect(practicalChallenges.some((c) => c.mode === 'live' && c.id === 'figure-eight')).toBe(true)
    expect(practicalChallenges.some((c) => c.mode === 'live' && c.id === 'slalom')).toBe(true)
    for (const c of practicalChallenges) {
      expect(c.lessonIds.length).toBeGreaterThan(0)
      expect(c.perform.length).toBeGreaterThan(20)
    }
  })
})

describe('progressive situation groups', () => {
  it('has ten groups of beginner, intermediate and advanced', () => {
    expect(progressiveGroups.length).toBe(10)
    for (const g of progressiveGroups) {
      expect(g.stages.map((s) => s.level)).toEqual(['Beginner', 'Intermediate', 'Advanced'])
      for (const s of g.stages) {
        expect(s.unlocksAfter.length).toBeGreaterThan(0)
        expect(s.happening.length).toBeGreaterThan(20)
      }
    }
  })

  it('every stage has a scenario that exists', () => {
    for (const g of progressiveGroups) {
      for (const s of g.stages) {
        expect(s.scenarioId, `${g.id} ${s.level}`).toBeDefined()
        expect(getScenario(s.scenarioId), `${g.id} ${s.level} → ${s.scenarioId}`).toBeDefined()
      }
    }
  })
})
