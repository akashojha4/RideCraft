import { beforeEach, describe, expect, it } from 'vitest'
import { progress, quizPassMark, quizPassed } from './store'

describe('lesson quiz pass mark', () => {
  it('needs two thirds of the answers, rounded up', () => {
    expect([1, 2, 3, 4, 5, 6].map(quizPassMark)).toEqual([1, 2, 2, 3, 4, 4])
  })

  it('does not count a failed quiz as a pass', () => {
    expect(quizPassed(0, 3)).toBe(false)
    expect(quizPassed(1, 3)).toBe(false)
    expect(quizPassed(2, 3)).toBe(true)
  })
})

describe('one-time lesson changes (what the analytics events hang on)', () => {
  beforeEach(() => progress.reset())

  it('visitLesson is true only when it creates the lesson’s record', () => {
    expect(progress.visitLesson('basics', 'understanding-clutch')).toBe(true)
    expect(progress.visitLesson('basics', 'understanding-clutch')).toBe(false)
    expect(progress.visitLesson('basics', 'understanding-gears')).toBe(true)
    // The same lesson id in another topic is a different lesson.
    expect(progress.visitLesson('handling', 'weight-transfer')).toBe(true)
    expect(progress.visitLesson('mechanics', 'weight-transfer')).toBe(true)
  })

  it('recordQuiz reports completed only on the first passing attempt', () => {
    progress.visitLesson('basics', 'understanding-clutch')
    const fail = progress.recordQuiz('basics', 'understanding-clutch', 1, 3)
    expect(fail.completed).toBe(false)
    const pass = progress.recordQuiz('basics', 'understanding-clutch', 2, 3)
    expect(pass).toMatchObject({ completed: true, quiz: { last: 2, total: 3, attempts: 2 } })
    expect(progress.recordQuiz('basics', 'understanding-clutch', 3, 3).completed).toBe(false)
    expect(progress.recordQuiz('basics', 'understanding-clutch', 0, 3).completed).toBe(false)
    expect(progress.get().lessons['basics/understanding-clutch'].completedAt).toBeDefined()
  })

  it('a 4-question check needs 3 right to complete', () => {
    expect(progress.recordQuiz('pre-ride', 'helmet', 2, 4).completed).toBe(false)
    expect(progress.recordQuiz('pre-ride', 'helmet', 3, 4).completed).toBe(true)
  })

  it('after a progress reset the lesson can be started and completed again', () => {
    progress.visitLesson('basics', 'understanding-clutch')
    progress.recordQuiz('basics', 'understanding-clutch', 3, 3)
    progress.reset()
    expect(progress.visitLesson('basics', 'understanding-clutch')).toBe(true)
    expect(progress.recordQuiz('basics', 'understanding-clutch', 3, 3).completed).toBe(true)
  })
})
