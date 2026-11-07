import { useCallback, useEffect, useRef, useState } from 'react'
import { checkGuided, followGuided, goToGuided, startGuided, type GuidedProgress } from '@/lib/simulation/guided'
import type { GuidedStep } from '@/lib/simulation/model'
import type { Simulation } from './useSimulation'

/**
 * Runs a guided sequence on a simulation: applies each step's setup, watches every model step
 * for its completion condition, and lets the learner move back and forth. `start` can be given
 * a different sequence (another scenario), which takes effect at once.
 *
 * `follow` keeps up with a learner who is ahead of the guide; `autoAdvanceMs` moves on from a
 * finished step by itself after that pause, unless the next step has a set-up of its own.
 */
export function useGuidedMode<I, S, D, C extends string, H extends { t: number }>(
  sim: Simulation<I, S, D, C, H>,
  initialSteps: readonly GuidedStep<I, S, D, C>[],
  { startActive = false, follow = false, autoAdvanceMs }: { startActive?: boolean; follow?: boolean; autoAdvanceMs?: number } = {},
) {
  const [steps, setSteps] = useState(initialSteps)
  const [active, setActive] = useState(startActive)
  const [progress, setProgress] = useState<GuidedProgress>(() => startGuided(initialSteps.length))
  // Read inside the per-step callback; set by start and exit (events), so the check always
  // uses the sequence that was just started.
  const live = useRef({ on: startActive, steps: initialSteps, paused: false })
  const [paused, setPausedState] = useState(false)
  const { onStep, model, inputs, load, state } = sim

  useEffect(
    () =>
      onStep((s) => {
        const { on, paused: held, steps: current } = live.current
        // Returning the same object leaves React state untouched.
        if (on && !held) setProgress((p) => (follow ? followGuided : checkGuided)(current, p, s, inputs.current, model.derive(s, inputs.current)))
      }),
    [onStep, model, inputs, follow],
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
      live.current = { on: true, steps: sequence, paused: live.current.paused }
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

  const setPaused = useCallback((held: boolean) => {
    live.current.paused = held
    setPausedState(held)
  }, [])

  const stepDone = progress.done[progress.index] ?? false
  const autoNext = autoAdvanceMs !== undefined && active && !paused && stepDone && progress.index < steps.length - 1 && !steps[progress.index + 1].setup
  useEffect(() => {
    if (!autoNext) return
    const target = progress.index + 1
    const id = setTimeout(() => setProgress((p) => (p.index === target - 1 ? goToGuided(p, target) : p)), autoAdvanceMs)
    return () => clearTimeout(id)
  }, [autoNext, autoAdvanceMs, progress.index])

  return {
    /** The finished step will move on by itself. */
    autoNext,
    active,
    progress,
    steps,
    step: steps[progress.index],
    stepDone,
    start,
    exit,
    setPaused,
    next: () => goTo(progress.index + 1),
    back: () => goTo(progress.index - 1),
    goTo,
  }
}
