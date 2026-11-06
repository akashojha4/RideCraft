import type { GuidedStep } from './model'

/** Where the learner is in a guided sequence. A finished step stays finished. */
export interface GuidedProgress {
  index: number
  done: readonly boolean[]
}

export const startGuided = (count: number, index = 0): GuidedProgress => ({ index, done: Array(count).fill(false) })

/** Mark the current step finished once its condition holds. Returns the same object when nothing changed. */
export function checkGuided<I, S, D, C extends string>(steps: readonly GuidedStep<I, S, D, C>[], p: GuidedProgress, state: S, inputs: I, derived: D): GuidedProgress {
  const step = steps[p.index]
  if (!step || p.done[p.index] || !step.done(state, inputs, derived)) return p
  return { ...p, done: p.done.map((d, i) => d || i === p.index) }
}

export function goToGuided(p: GuidedProgress, index: number): GuidedProgress {
  return { ...p, index: Math.min(Math.max(index, 0), p.done.length - 1) }
}

export const guidedComplete = (p: GuidedProgress) => p.done.every(Boolean)
