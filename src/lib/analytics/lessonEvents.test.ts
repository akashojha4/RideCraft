import { afterEach, describe, expect, it, vi } from 'vitest'
import { getLesson } from '@/content/curriculum'
import { resetAnalyticsForTests } from './ga'
import { lessonParams, trackLessonCompleted, trackLessonStarted } from './lessonEvents'

afterEach(() => {
  resetAnalyticsForTests()
  vi.unstubAllGlobals()
})

const clutch = getLesson('basics', 'understanding-clutch')!

describe('lesson event parameters', () => {
  it('identify the lesson by topic and id, with its title and topic name', () => {
    expect(lessonParams(clutch.module, clutch.lesson)).toEqual({ lesson_id: 'basics/understanding-clutch', lesson_title: 'Understanding the clutch', lesson_category: 'Motorcycle Basics' })
  })

  it('tell apart lessons that share an id across topics', () => {
    const a = getLesson('handling', 'weight-transfer')!
    const b = getLesson('mechanics', 'weight-transfer')!
    expect(lessonParams(a.module, a.lesson).lesson_id).not.toBe(lessonParams(b.module, b.lesson).lesson_id)
  })

  it('send nothing outside production', () => {
    expect(trackLessonStarted(clutch.module, clutch.lesson)).toBe(false)
    expect(trackLessonCompleted(clutch.module, clutch.lesson, { last: 3, total: 3, attempts: 1 })).toBe(false)
  })
})

describe('lesson events in production', () => {
  it('send lesson_started and lesson_completed with the quiz parameters, each once', () => {
    vi.stubGlobal('window', { dataLayer: [] as unknown[], location: { hostname: 'www.ridecraft.in', origin: 'https://www.ridecraft.in' } })
    vi.stubGlobal('document', { title: '', querySelector: () => null, createElement: () => ({}), head: { appendChild: () => {} } })
    vi.stubEnv('PROD', true)
    expect(trackLessonStarted(clutch.module, clutch.lesson)).toBe(true)
    expect(trackLessonStarted(clutch.module, clutch.lesson)).toBe(false)
    expect(trackLessonCompleted(clutch.module, clutch.lesson, { last: 2, total: 3, attempts: 2 })).toBe(true)
    const events = (window.dataLayer as unknown as Array<IArguments>).filter((e) => e[0] === 'event').map((e) => [e[1], e[2]])
    expect(events).toEqual([
      ['lesson_started', { lesson_id: 'basics/understanding-clutch', lesson_title: 'Understanding the clutch', lesson_category: 'Motorcycle Basics' }],
      ['lesson_completed', { lesson_id: 'basics/understanding-clutch', lesson_title: 'Understanding the clutch', lesson_category: 'Motorcycle Basics', quiz_score: 2, quiz_total: 3, quiz_attempts: 2 }],
    ])
    vi.unstubAllEnvs()
  })
})
