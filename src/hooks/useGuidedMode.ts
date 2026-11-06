import { useCallback, useEffect, useRef, useState } from 'react'
import { checkGuided, goToGuided, startGuided, type GuidedProgress } from '@/lib/simulation/guided'
import type { GuidedStep } from '@/lib/simulation/model'
import type { Simulation } from './useSimulation'

/**
 * Runs a guided sequence on a simulation: applies each step's setup, watches every model step
 * for its completion condition, and lets the learner move back and forth. `start` can be given
 * a different sequence (another scenario), which takes effect at once.
 */
export function useGuidedMode<I, S, D, C extends string, H extends { t: number }>(
  sim: Simulation<I, S, D, C, H>,
  initialSteps: readonly GuidedStep<I, S, D, C>[],
  { startActive = false }: { startActive?: boolean } = {},
) {
  const [steps, setSteps] = useState(initialSteps)
  const [active, setActive] = useState(startActive)
  const [progress, setProgress] = useState<GuidedProgress>(() => startGuided(initialSteps.length))
  // Read inside the per-step callback; set by start and exit (events), so the check always
  // uses the sequence that was just started.
  const live = useRef({ on: startActive, steps: initialSteps })
  const { onStep, model, inputs, load, state } = sim

  useEffect(
    () =>
      onStep((s) => {
        const { on, steps: current } = live.current
        // Returning the same object leaves React state untouched.
        if (on) setProgress((p) => checkGuided(current, p, s, inputs.current, model.derive(s, inputs.current)))
      }),
    [onStep, model, inputs],
  )

  const enter = useCallback(
    (sequence: readonly GuidedStep<I, S, D, C>[], index: number) => {
      const setup = sequence[index]?.setup
      if (setup) load({ ...inputs.current, ...setup.inputs }, setup.state ?? (setup.inputs ? (state.current as Partial<S>) : {}))
    },
    [load, inputs, state],
  )

  const start = useCallback(
    (sequence: readonly GuidedStep<I, S, D, C>[] = live.current.steps) => {
      live.current = { on: true, steps: sequence }
      setSteps(sequence)
      setProgress(startGuided(sequence.length))
      setActive(true)
      enter(sequence, 0)
    },
    [enter],
  )

  const goTo = useCallback(
    (index: number) => {
      const sequence = live.current.steps
      const target = Math.min(Math.max(index, 0), sequence.length - 1)
      setProgress((p) => goToGuided(p, target))
      enter(sequence, target)
    },
    [enter],
  )

  const exit = useCallback(() => {
    live.current = { ...live.current, on: false }
    setActive(false)
  }, [])

  return {
    active,
    progress,
    steps,
    step: steps[progress.index],
    stepDone: progress.done[progress.index] ?? false,
    start,
    exit,
    next: () => goTo(progress.index + 1),
    back: () => goTo(progress.index - 1),
    goTo,
  }
}
