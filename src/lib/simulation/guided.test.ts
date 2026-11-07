import { describe, expect, it } from 'vitest'
import { checkGuided, followGuided, goToGuided, guidedComplete, startGuided } from './guided'
import type { GuidedStep } from './model'

type I = { lever: number }
const steps: GuidedStep<I, number, null>[] = [
  { id: 'pull', title: 'Pull', instruction: 'Pull the lever', done: (_s, i) => i.lever > 0.9, explanation: '' },
  { id: 'release', title: 'Release', instruction: 'Release it', done: (_s, i) => i.lever < 0.1, explanation: '' },
]

describe('guided steps', () => {
  it('marks the current step done only when its condition holds', () => {
    const p = startGuided(2)
    expect(checkGuided(steps, p, 0, { lever: 0.5 }, null)).toBe(p)
    const q = checkGuided(steps, p, 0, { lever: 1 }, null)
    expect(q.done).toEqual([true, false])
  })

  it('does not finish a step that is not current', () => {
    // Lever released (step 2's condition) while still on step 1.
    expect(checkGuided(steps, startGuided(2), 0, { lever: 0 }, null).done).toEqual([false, false])
  })

  it('keeps a finished step finished', () => {
    const q = checkGuided(steps, startGuided(2), 0, { lever: 1 }, null)
    expect(checkGuided(steps, q, 0, { lever: 0.5 }, null)).toBe(q)
  })

  it('clamps navigation to the steps that exist', () => {
    const p = startGuided(2)
    expect(goToGuided(p, -3).index).toBe(0)
    expect(goToGuided(p, 9).index).toBe(1)
  })

  it('follows a learner who is ahead of the guide', () => {
    const three: GuidedStep<I, number, null>[] = [...steps, { id: 'pull-again', title: 'Pull again', instruction: 'Pull it again', done: (_s, i) => i.lever > 0.9, explanation: '' }]
    const p = followGuided(three, startGuided(3), 0, { lever: 1 }, null)
    expect(p).toEqual({ index: 0, done: [true, false, false] })
    // Lever released while still on step 1's explanation: the guide catches up to step 2, not step 3.
    expect(followGuided(three, p, 0, { lever: 0 }, null)).toEqual({ index: 1, done: [true, true, false] })
  })

  it('does not follow into a step with its own set-up', () => {
    const withSetup: GuidedStep<I, number, null>[] = [steps[0], { ...steps[1], setup: { inputs: { lever: 0 } } }]
    const p = followGuided(withSetup, startGuided(2), 0, { lever: 1 }, null)
    expect(followGuided(withSetup, p, 0, { lever: 0 }, null)).toBe(p)
  })

  it('is complete when every step is done', () => {
    let p = checkGuided(steps, startGuided(2), 0, { lever: 1 }, null)
    expect(guidedComplete(p)).toBe(false)
    p = checkGuided(steps, goToGuided(p, 1), 0, { lever: 0 }, null)
    expect(guidedComplete(p)).toBe(true)
  })
})
