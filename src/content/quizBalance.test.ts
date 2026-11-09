import { describe, expect, it } from 'vitest'
import { modules } from './curriculum'

/*
 * A quiz you can pass by picking the longest answer teaches nothing. Options are shown in a
 * mixed order (lib/shuffle), and the wording keeps the right answer from standing out by length.
 */
const questions = modules.flatMap((m) => m.lessons.flatMap((l) => (l.knowledgeCheck ?? []).map((q) => ({ where: `${m.id}/${l.id}`, q }))))

describe('quiz balance', () => {
  it('the correct answer is the longest option in at most 35% of questions', () => {
    const longest = questions.filter(({ q }) => {
      const right = q.options.find((o) => o.id === q.correctOptionId)!
      return q.options.every((o) => o === right || o.label.length < right.label.length)
    })
    expect(longest.length / questions.length).toBeLessThanOrEqual(0.35)
  })

  it('no question is asked twice', () => {
    const seen = new Map<string, string>()
    const repeats: string[] = []
    for (const { where, q } of questions) {
      if (seen.has(q.prompt)) repeats.push(`${q.prompt} (${seen.get(q.prompt)} and ${where})`)
      else seen.set(q.prompt, where)
    }
    expect(repeats).toEqual([])
  })
})
