import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { withWorld, type RunResult } from '@/content/scenarios/cockpit/run'
import type { CockpitScenario } from '@/content/scenarios/cockpit/types'
import type { SimulationSpeed } from '@/lib/motion'
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

export function useDemoPlayer(cockpit: ReturnType<typeof useCockpitSim>, scenario: CockpitScenario, run: RunResult) {
  const { sim, restore, start, getWorld, controls, setStage } = cockpit
  const { onStep, inputs, model, clock } = sim
  const { play: clockPlay, pause: clockPause, setSpeed } = clock
  const demo = useMemo(() => scenario.demo ?? [], [scenario])
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<DemoStatus>('ready')
  const [done, setDone] = useState<boolean[]>(() => demo.map(() => false))
  // Read by the per-step callback; written only by events and that callback.
  const live = useRef({ index: 0, from: 0, active: false, done: demo.map(() => false), steer: 0 })
  const now = useRef(0)
  const checks = useRef(withWorld(scenario.steps, getWorld))
  const startEngine = useRef(start)
  const setSteer = useRef(controls.setSteer)
  useEffect(() => {
    startEngine.current = start
    setSteer.current = controls.setSteer
  }, [start, controls.setSteer])

  // Hold still until the learner presses Play.
  useEffect(() => clockPause(), [clockPause])

  useEffect(
    () =>
      onStep((s, t) => {
        now.current = t
        const L = live.current
        if (!L.active) return
        const step = demo[L.index]
        if (!step) return
        const local = t - L.from
        const { steer, start: press, ...change } = step.act(local, s, getWorld())
        inputs.current = { ...inputs.current, ...change }
        if (press && !s.running) startEngine.current()
        if (steer !== undefined && steer !== L.steer) {
          L.steer = steer
          setSteer.current(steer > 0 ? 1 : steer < 0 ? -1 : 0)
        }
        const met = checks.current[L.index]?.done(s, inputs.current, model.derive(s, inputs.current)) ?? false
        if (met && !L.done[L.index]) {
          L.done = L.done.map((v, k) => (k === L.index ? true : v))
          setDone(L.done)
        }
        // Like the guided runner, a step counts as done once its check has been met.
        if (local >= step.seconds && (L.done[L.index] || local >= step.seconds + GRACE)) {
          if (L.index + 1 >= demo.length) {
            L.active = false
            setStatus('done')
            clockPause()
            return
          }
          L.index += 1
          L.from = t
          setStage(L.index)
          setIndex(L.index)
        }
      }),
    [onStep, inputs, model, demo, clockPause, setStage, getWorld],
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
      L.from = now.current
      L.steer = snap.steer
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
    [demo, run, restore, clockPlay, setStage],
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
