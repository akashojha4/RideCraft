import { describe, expect, it } from 'vitest'
import { validateCurriculum } from './curriculum'
import { glossary } from './glossary'

describe('curriculum', () => {
  it('every lesson meets the lesson contract', () => {
    expect(validateCurriculum()).toEqual([])
  })
})

describe('glossary', () => {
  it('links only to real lessons', async () => {
    const { getLesson } = await import('./curriculum')
    const broken = glossary
      .flatMap((g) => g.entries)
      .filter((e) => e.to?.startsWith('/learn/'))
      .map((e) => e.to!.split('/').slice(2))
      .filter(([moduleId, lessonId]) => !getLesson(moduleId, lessonId))
      .map((parts) => parts.join('/'))
    expect(broken).toEqual([])
  })
})
