import { useMotionValue, useMotionValueEvent } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import {
  canRestart,
  drivelineSpeed,
  initialPowertrain,
  radToRpm,
  stepPowertrain,
  type PowertrainInputs,
  type PowertrainState,
} from '@/lib/mechanics/powertrain'
import { clampingForce } from '@/lib/mechanics/clutch'
import { FINAL_RATIO, PRIMARY_RATIO, TYRE_CIRCUMFERENCE } from '@/lib/mechanics/gearbox'
import { useSimulationClock } from './useSimulationClock'

/** Rotations in the drawings are shown this many times slower than real. */
export const VISUAL_SLOWDOWN = 28
const HISTORY_SECONDS = 12
const SAMPLE_INTERVAL = 0.05
/** React re-renders (readouts, text) at about 20 Hz; rotations update every frame. */
const UI_INTERVAL = 0.05

/**
 * A scripted change of inputs over time (e.g. an auto-clutch gear change). Called every
 * step with the seconds elapsed, the inputs at the start and the current state; returns the
 * inputs to apply.
 */
export type InputSequence = (elapsed: number, start: PowertrainInputs, state: PowertrainState) => { inputs: Partial<PowertrainInputs>; done: boolean }

export interface Sample {
  t: number
  engineRpm: number
  wheelRpm: number
  kmh: number
}

/**
 * Runs the powertrain model in real time on a simulation clock (so it can be paused,
 * slowed down and reset), keeps a short telemetry history, and integrates the visual
 * rotation angles of the moving parts.
 */
export function usePowertrainSim(initialInputs: PowertrainInputs) {
  const clock = useSimulationClock({ autoPlay: true })
  const inputs = useRef<PowertrainInputs>(initialInputs)
  const state = useRef<PowertrainState>(initialPowertrain())
  const history = useRef<Sample[]>([])
  const lastT = useRef(0)
  const lastSample = useRef(-Infinity)
  const lastUi = useRef(-Infinity)
  const listeners = useRef(new Set<(s: PowertrainState, t: number) => void>())
  const sequence = useRef<{ start: number; base: PowertrainInputs; fn: InputSequence } | null>(null)
  const [snapshot, setSnapshot] = useState(() => ({ state: initialPowertrain(), inputs: initialInputs, t: 0, history: [] as Sample[], busy: false }))

  const angles = {
    crank: useMotionValue(0),
    basket: useMotionValue(0),
    mainshaft: useMotionValue(0),
    countershaft: useMotionValue(0),
    wheel: useMotionValue(0),
    /** Each wheel separately: a locked wheel stops turning while the motorcycle slides on. */
    frontWheel: useMotionValue(0),
    rearWheel: useMotionValue(0),
  }

  const publish = useCallback(
    (t: number) =>
      setSnapshot({ state: state.current, inputs: { ...inputs.current }, t, history: history.current.slice(), busy: sequence.current !== null }),
    [],
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
    const before = state.current
    const s = stepPowertrain(before, inputs.current, Math.min(dt, 0.1))
    state.current = s

    // Visual rotations (degrees), slowed down; gear meshes reverse direction.
    const engineRpm = radToRpm(s.engine)
    const wheelRpm = (s.speed / TYRE_CIRCUMFERENCE) * 60
    const countershaft = inputs.current.gear > 0 ? wheelRpm * FINAL_RATIO : 0
    // In gear the mainshaft follows the wheel; in neutral it turns with the clutch hub when the clutch is engaged.
    const mainshaft =
      inputs.current.gear > 0
        ? radToRpm(drivelineSpeed(s.speed, inputs.current.gear)) / PRIMARY_RATIO
        : clampingForce(inputs.current.clutch) > 0
          ? engineRpm / PRIMARY_RATIO
          : 0
    const deg = (rpm: number) => (rpm * 6 * dt) / VISUAL_SLOWDOWN
    angles.crank.set(angles.crank.get() + deg(engineRpm))
    angles.basket.set(angles.basket.get() + deg(engineRpm / PRIMARY_RATIO))
    angles.mainshaft.set(angles.mainshaft.get() + deg(mainshaft))
    angles.countershaft.set(angles.countershaft.get() + deg(countershaft))
    angles.wheel.set(angles.wheel.get() + deg(wheelRpm))
    if (!s.brakes.front.locked) angles.frontWheel.set(angles.frontWheel.get() + deg(wheelRpm))
    if (!s.brakes.rear.locked) angles.rearWheel.set(angles.rearWheel.get() + deg(wheelRpm))

    if (t - lastSample.current >= SAMPLE_INTERVAL) {
      lastSample.current = t
      history.current.push({ t, engineRpm, wheelRpm: radToRpm(drivelineSpeed(s.speed, inputs.current.gear)), kmh: s.speed * 3.6 })
      while (history.current.length && history.current[0].t < t - HISTORY_SECONDS) history.current.shift()
    }
    for (const fn of listeners.current) fn(s, t)
    if (t - lastUi.current >= UI_INTERVAL || before.running !== s.running || before.locked !== s.locked) {
      lastUi.current = t
      publish(t)
    }
  })

  /** Change one or more rider inputs. */
  const setInputs = useCallback(
    (change: Partial<PowertrainInputs>) => {
      inputs.current = { ...inputs.current, ...change }
      publish(lastT.current)
    },
    [publish],
  )

  /** Put the simulation into a known state (exercises use this). */
  const load = useCallback(
    (nextInputs: PowertrainInputs, nextState: Partial<PowertrainState> = {}) => {
      inputs.current = nextInputs
      state.current = initialPowertrain(nextState)
      history.current = []
      lastSample.current = -Infinity
      publish(lastT.current)
    },
    [publish],
  )

  const restart = useCallback(() => {
    if (state.current.running || !canRestart(inputs.current)) return false
    state.current = { ...initialPowertrain({ speed: state.current.speed, distance: state.current.distance }) }
    publish(lastT.current)
    return true
  }, [publish])

  /** Run a scripted input sequence on the simulation clock (respects pause and slow motion). */
  const runSequence = useCallback(
    (fn: InputSequence) => {
      sequence.current = { start: clock.time.get(), base: { ...inputs.current }, fn }
      publish(lastT.current)
    },
    [clock.time, publish],
  )
  const cancelSequence = useCallback(() => {
    sequence.current = null
  }, [])

  /** Subscribe to every physics step (for exercise scoring). */
  const onStep = useCallback((fn: (s: PowertrainState, t: number) => void) => {
    listeners.current.add(fn)
    return () => {
      listeners.current.delete(fn)
    }
  }, [])

  return { clock, snapshot, angles, setInputs, load, restart, onStep, inputs, runSequence, cancelSequence }
}

export type PowertrainSim = ReturnType<typeof usePowertrainSim>
