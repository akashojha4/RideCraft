import { describe, expect, it } from 'vitest'
import { quizPassMark, quizPassed } from './store'

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
