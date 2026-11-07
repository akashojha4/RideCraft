import { motionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import type { SimModel } from '@/lib/simulation/model'
import { useSimulationClock } from './useSimulationClock'

/** Longest step handed to the model, so a backgrounded tab doesn't make it jump. */
const MAX_STEP = 0.1
/** React re-renders (readouts, text) at about 20 Hz; rotations update every frame. */
const UI_INTERVAL = 0.05
const SAMPLE_INTERVAL = 0.05

/**
 * A scripted change of inputs over time (e.g. an auto-clutch gear change). Called every
 * step with the seconds elapsed, the inputs at the start and the current state; returns the
 * inputs to apply.
 */
export type InputSequence<I, S> = (elapsed: number, start: I, state: S) => { inputs: Partial<I>; done: boolean }

export interface SimulationOptions<I, S, D, C extends string, H extends { t: number }> {
  /** Rotating parts to animate; each gets a MotionValue angle in degrees. */
  parts?: readonly C[]
  /** Rotations are drawn this many times slower than real. */
  visualSlowdown?: number
  /** Telemetry sample kept in the rolling history. */
  sample?: (state: S, inputs: I, derived: D, t: number) => H
  historySeconds?: number
  /** Publish a snapshot immediately (not just at 20 Hz) when this returns true. */
  publishWhen?: (before: S, after: S) => boolean
  autoPlay?: boolean
}

export interface SimulationSnapshot<I, S, D, H> {
  state: S
  inputs: I
  derived: D
  t: number
  history: H[]
  /** A scripted input sequence is running. */
  busy: boolean
}

/**
 * Runs any SimModel in real time on a simulation clock (so it can be paused, slowed down
 * and reset), keeps a rolling telemetry history, and integrates the visual rotation angles
 * of the moving parts.
 */
export function useSimulation<I, S, D, C extends string = string, H extends { t: number } = { t: number }>(
  model: SimModel<I, S, D, C>,
  initialInputs: I,
  { parts = [], visualSlowdown = 1, sample, historySeconds = 12, publishWhen, autoPlay = true }: SimulationOptions<I, S, D, C, H> = {},
) {
  const clock = useSimulationClock({ autoPlay })
  const inputs = useRef<I>(initialInputs)
  const state = useRef<S>(model.initial())
  const history = useRef<H[]>([])
  const lastT = useRef(0)
  const lastSample = useRef(-Infinity)
  const lastUi = useRef(-Infinity)
  const listeners = useRef(new Set<(s: S, t: number) => void>())
  const drivers = useRef(new Set<(s: S, t: number) => void>())
  const sequence = useRef<{ start: number; base: I; fn: InputSequence<I, S> } | null>(null)
  const [angles] = useState(() => Object.fromEntries(parts.map((p) => [p, motionValue(0)])) as Record<C, MotionValue<number>>)
  const [snapshot, setSnapshot] = useState<SimulationSnapshot<I, S, D, H>>(() => {
    const s = model.initial()
    return { state: s, inputs: initialInputs, derived: model.derive(s, initialInputs), t: 0, history: [], busy: false }
  })

  const publish = useCallback(
    (t: number) =>
      setSnapshot({
        state: state.current,
        inputs: { ...inputs.current },
        derived: model.derive(state.current, inputs.current),
        t,
        history: history.current.slice(),
        busy: sequence.current !== null,
      }),
    [model],
  )

  useMotionValueEvent(clock.time, 'change', (t) => {
    const dt = t - lastT.current
    lastT.current = t
    if (dt <= 0) return
    const seq = sequence.current
    if (seq) {
      const r = seq.fn(t - seq.start, seq.base, state.current)
      inputs.current = { ...inputs.current, ...r.inputs }
      if (r.done) {
        sequence.current = null
        publish(t)
      }
    }
    for (const fn of drivers.current) fn(state.current, t)
    const before = state.current
    const s = model.step(before, inputs.current, Math.min(dt, MAX_STEP))
    state.current = s

    const needDerived = model.rotations || sample
    const derived = needDerived ? model.derive(s, inputs.current) : (null as D)
    if (model.rotations) {
      const rpm = model.rotations(s, inputs.current, derived)
      for (const p of parts) {
        const r = rpm[p]
        if (r) angles[p].set(angles[p].get() + (r * 6 * dt) / visualSlowdown)
      }
    }
    if (sample && t - lastSample.current >= SAMPLE_INTERVAL) {
      lastSample.current = t
      history.current.push(sample(s, inputs.current, derived, t))
      while (history.current.length && history.current[0].t < t - historySeconds) history.current.shift()
    }
    for (const fn of listeners.current) fn(s, t)
    if (t - lastUi.current >= UI_INTERVAL || publishWhen?.(before, s)) {
      lastUi.current = t
      publish(t)
    }
  })

  /** Change one or more inputs. */
  const setInputs = useCallback(
    (change: Partial<I>) => {
      inputs.current = { ...inputs.current, ...change }
      publish(lastT.current)
    },
    [publish],
  )

  /** Put the simulation into a known state (exercises and guided steps use this). */
  const load = useCallback(
    (nextInputs: I, nextState: Partial<S> = {}) => {
      inputs.current = nextInputs
      state.current = model.initial(nextState)
      history.current = []
      lastSample.current = -Infinity
      publish(lastT.current)
    },
    [model, publish],
  )

  /** Replace the state directly (e.g. restarting a stalled engine). */
  const replaceState = useCallback(
    (fn: (s: S) => S) => {
      state.current = fn(state.current)
      publish(lastT.current)
    },
    [publish],
  )

  /** Run a scripted input sequence on the simulation clock (respects pause and slow motion). */
  const runSequence = useCallback(
    (fn: InputSequence<I, S>) => {
      sequence.current = { start: clock.time.get(), base: { ...inputs.current }, fn }
      publish(lastT.current)
    },
    [clock.time, publish],
  )
  const cancelSequence = useCallback(() => {
    sequence.current = null
  }, [])

  /** Subscribe to every model step (for exercise scoring and guided steps). */
  const onStep = useCallback((fn: (s: S, t: number) => void) => {
    listeners.current.add(fn)
    return () => {
      listeners.current.delete(fn)
    }
  }, [])

  /** Run before the model steps, so a demonstration can set the inputs the physics will use. */
  const onBeforeStep = useCallback((fn: (s: S, t: number) => void) => {
    drivers.current.add(fn)
    return () => {
      drivers.current.delete(fn)
    }
  }, [])

  return { model, clock, snapshot, angles, inputs, state, setInputs, load, replaceState, runSequence, cancelSequence, onStep, onBeforeStep }
}

export type Simulation<I, S, D, C extends string = string, H extends { t: number } = { t: number }> = ReturnType<typeof useSimulation<I, S, D, C, H>>
