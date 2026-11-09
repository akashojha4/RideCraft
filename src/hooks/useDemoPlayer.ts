import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { withWorld, type RunResult } from '@/content/scenarios/cockpit/run'
import type { CockpitScenario } from '@/content/scenarios/cockpit/types'
import type { SimulationSpeed } from '@/lib/motion'
import { inputsForNudge, rideNudge, type NudgeInputs, type RideNudge } from '@/lib/simulation/rideNudge'
import type { useCockpitSim } from './useCockpitSim'

/*
 * "Watch it done": the scenario's demonstration played on a live cockpit simulation. Each model
 * step applies the current demo step's action to the simulation's inputs (exactly what the
 * scenario runner does), so the levers, road, instruments and machine views all move as the
 * rider would make them. A step ends when its time is up and its guided check is met (or a few
 * seconds later). Jumping to a step restores the state a run of the same plan had there.
 */

export type DemoStatus = 'ready' | 'playing' | 'paused' | 'done'

/** Extra time a step may take in live playback to meet its check before moving on, s. */
const GRACE = 3

export function useDemoPlayer(
  cockpit: ReturnType<typeof useCockpitSim>,
  scenario: CockpitScenario,
  run: RunResult,
  { autoPlay = false }: { autoPlay?: boolean } = {},
) {
  const { sim, restore, start, getWorld, controls, setStage, setDriven } = cockpit
  const { onStep, onBeforeStep, inputs, model, clock } = sim
  const { play: clockPlay, pause: clockPause, setSpeed } = clock
  const demo = useMemo(() => scenario.demo ?? [], [scenario])
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<DemoStatus>('ready')
  const [done, setDone] = useState<boolean[]>(() => demo.map(() => false))
  // Read by the per-step callback; written only by events and that callback.
  const live = useRef({
    index: 0,
    from: 0,
    active: false,
    done: demo.map(() => false),
    steer: 0,
    prev: null as NudgeInputs | null,
    nudgeText: '',
    nudgeHold: 0,
  })
  const [nudge, setNudge] = useState<RideNudge>({ text: 'Now: watch the controls' })
  const now = useRef(0)
  const checks = useRef(withWorld(scenario.steps, getWorld))
  useEffect(() => {
    checks.current = withWorld(scenario.steps, getWorld)
  }, [scenario, getWorld])
  const startEngine = useRef(start)
  const setSteer = useRef(controls.setSteer)
  const restoreStep = useRef(restore)
  const runRef = useRef(run)
  useEffect(() => {
    startEngine.current = start
    setSteer.current = controls.setSteer
    restoreStep.current = restore
    runRef.current = run
  }, [start, controls.setSteer, restore, run])

  // Hold still until the learner presses Play, unless this player starts by itself.
  useEffect(() => {
    if (!autoPlay) clockPause()
  }, [clockPause, autoPlay])
  useEffect(() => {
    setDriven(true)
    return () => setDriven(false)
  }, [setDriven])

  // Apply this step's controls before the physics, the same order the recorded run uses.
  useEffect(
    () =>
      onBeforeStep((s, t) => {
        const L = live.current
        if (!L.active) return
        const step = demo[L.index]
        if (!step) return
        const { steer, start: press, ...change } = step.act(Math.max(0, t - L.from), s, getWorld())
        inputs.current = { ...inputs.current, ...change }
        const starting = !!(press && !s.running)
        if (starting) startEngine.current()
        const turning = steer !== undefined && steer !== L.steer
        if (turning) {
          L.steer = steer
          setSteer.current(steer > 0 ? 1 : steer < 0 ? -1 : 0)
        }
        const next = inputsForNudge(inputs.current)
        const n = rideNudge(L.prev, next, { started: starting, steer: turning })
        L.prev = next
        const holding = /holding|watching|clutch held/.test(n.text)
        if (n.text !== L.nudgeText) {
          // A gear change or the starter lasts one frame; keep that line up so it can be read.
          if (holding && t < L.nudgeHold) return
          L.nudgeText = n.text
          L.nudgeHold = holding ? 0 : t + 0.9
          setNudge(n)
        }
      }),
    [onBeforeStep, inputs, demo, getWorld],
  )

  useEffect(
    () =>
      onStep((s, t) => {
        now.current = t
        const L = live.current
        if (!L.active) return
        const step = demo[L.index]
        if (!step) return
        const local = t - L.from
        const met = checks.current[L.index]?.done(s, inputs.current, model.derive(s, inputs.current)) ?? false
        if (met && !L.done[L.index]) {
          L.done = L.done.map((v, k) => (k === L.index ? true : v))
          setDone(L.done)
        }
        // A step moves on once its time is up and its check has been met (or a few seconds later).
        // On the cockpit Watch, linger so the step list and the explanation can be read.
        const linger = autoPlay && L.done[L.index] && L.index + 1 < demo.length ? 1.4 : 0
        if (local >= step.seconds + linger && (L.done[L.index] || local >= step.seconds + GRACE)) {
          if (L.index + 1 >= demo.length) {
            L.active = false
            setStatus('done')
            clockPause()
            return
          }
          const next = L.index + 1
          const snap = runRef.current.stepStarts[next]
          if (snap) restoreStep.current(snap)
          L.index = next
          L.from = clock.time.get()
          L.steer = snap?.steer ?? L.steer
          L.prev = snap ? inputsForNudge(snap.inputs) : L.prev
          L.nudgeText = ''
          L.nudgeHold = 0
          setStage(next)
          setIndex(next)
        }
      }),
    [onStep, inputs, model, demo, clockPause, setStage, clock.time, autoPlay],
  )

  /** Put the simulation where the run had it at the start of step k (and keep the done marks before it). */
  const goTo = useCallback(
    (k: number, then: 'play' | 'keep' = 'keep') => {
      const target = Math.max(0, Math.min(demo.length - 1, k))
      const snap = run.stepStarts[target]
      if (!snap) return
      restore(snap)
      const L = live.current
      L.index = target
      setStage(target)
      // The clock's own time: a cockpit that has been open a while is far past zero.
      L.from = clock.time.get()
      L.steer = snap.steer
      L.prev = inputsForNudge(snap.inputs)
      L.nudgeText = ''
      L.nudgeHold = 0
      L.done = demo.map((_, j) => j < target)
      setDone(L.done)
      setIndex(target)
      if (then === 'play' || L.active) {
        L.active = true
        setStatus('playing')
        clockPlay()
      } else {
        setStatus('paused')
      }
    },
    [demo, run, restore, clockPlay, setStage, clock.time],
  )

  const play = useCallback(() => {
    const L = live.current
    if (status === 'ready' || status === 'done') return goTo(0, 'play')
    L.active = true
    setStatus('playing')
    clockPlay()
  }, [status, goTo, clockPlay])

  const pause = useCallback(() => {
    live.current.active = false
    setStatus('paused')
    clockPause()
  }, [clockPause])

  return {
    index,
    status,
    nudge,
    done,
    speed: clock.speed,
    play,
    pause,
    replay: () => goTo(0, 'play'),
    previous: () => goTo(live.current.index - 1),
    next: () => goTo(live.current.index + 1),
    goTo,
    setSpeed: (v: SimulationSpeed) => setSpeed(v),
  }
}
