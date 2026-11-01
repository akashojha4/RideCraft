import { useCallback, useEffect, useRef, useState } from 'react'
import { clampingForce } from '@/lib/mechanics/clutch'
import { LIMITER_RPM, radToRpm, type PowertrainInputs } from '@/lib/mechanics/powertrain'
import { progress as progressStore } from '@/lib/progress/store'
import { emptyMetrics, type Exercise, type ExerciseMetrics, type Verdict } from '@/lib/simulation/exercises'
import type { PowertrainSim } from './usePowertrainSim'

/** RPM beyond the limiter that only a wheel forcing the engine round can reach. */
const OVER_REV_RPM = LIMITER_RPM + 300
/** Time constant for the acceleration a rider feels (filters out millisecond spikes), s. */
const FELT_TAU = 0.1
/** How often the live progress snapshot is published, s. */
const PROGRESS_INTERVAL = 0.1

/** A copy of the running exercise's telemetry and scratch values, for live readouts. */
export type ExerciseProgress = ExerciseMetrics & { memo: Record<string, number> }

/** Runs scored exercises on a powertrain simulation, gathering telemetry every physics step. */
export function useExercises<E extends Exercise>(sim: PowertrainSim, freeRideInputs: PowertrainInputs, source?: string) {
  const [active, setActive] = useState<E | null>(null)
  const [startedAt, setStartedAt] = useState(0)
  const [progress, setProgress] = useState<ExerciseProgress | null>(null)
  const lastProgress = useRef(-Infinity)
  const [verdict, setVerdict] = useState<Verdict>(null)
  const metrics = useRef<ExerciseMetrics & { start: number; last: number; felt: number }>({ ...emptyMetrics(), start: 0, last: 0, felt: 0 })
  const current = useRef<{ exercise: E | null; done: boolean; memo: Record<string, number> }>({ exercise: null, done: false, memo: {} })
  const { onStep, inputs, load, clock, cancelSequence } = sim

  useEffect(
    () =>
      onStep((state, now) => {
        const ex = current.current
        if (!ex.exercise || ex.done) return
        const m = metrics.current
        const dt = now - m.last
        m.last = now
        m.t = now - m.start
        const rpm = radToRpm(state.engine)
        if (!state.running) m.stalled = true
        m.felt += (state.acceleration - m.felt) * Math.min(1, dt / FELT_TAU)
        if (state.running) {
          m.maxAccel = Math.max(m.maxAccel, m.felt)
          m.maxDecel = Math.max(m.maxDecel, -m.felt)
        }
        if (rpm > OVER_REV_RPM) m.overRevved = true
        const { brake, front = 0, rear = 0 } = inputs.current
        if (brake > 0 || front > 0 || rear > 0) m.brakeUsed = true
        m.maxRpm = Math.max(m.maxRpm, rpm)
        m.minDistance = Math.min(m.minDistance, state.distance)
        const c = clampingForce(inputs.current.clutch)
        if (state.running && c > 0 && c < 1 && state.speed > 0.1) m.creepSeconds += dt
        const v = ex.exercise.evaluate({ ...m, state, inputs: inputs.current, dt, felt: m.felt, memo: ex.memo })
        if (v) {
          ex.done = true
          setVerdict(v)
          if (source) progressStore.recordPractice({ kind: 'exercise', source, item: ex.exercise.id, title: ex.exercise.title, result: v.result })
        }
        if (v || now - lastProgress.current >= PROGRESS_INTERVAL) {
          lastProgress.current = now
          setProgress({ ...m, memo: { ...ex.memo } })
        }
      }),
    [onStep, inputs, source],
  )

  const start = useCallback(
    (ex: E) => {
      cancelSequence()
      load(ex.setup.inputs, ex.setup.state)
      const now = clock.time.get()
      metrics.current = { ...emptyMetrics(), start: now, last: now, felt: 0 }
      current.current = { exercise: ex, done: false, memo: {} }
      setActive(ex)
      setStartedAt(now)
      setProgress(null)
      setVerdict(null)
      clock.play()
    },
    [load, clock, cancelSequence],
  )

  const freeRide = useCallback(() => {
    cancelSequence()
    current.current = { exercise: null, done: false, memo: {} }
    setActive(null)
    setVerdict(null)
    setProgress(null)
    load(freeRideInputs)
  }, [load, freeRideInputs, cancelSequence])

  const reset = useCallback(() => (active ? start(active) : freeRide()), [active, start, freeRide])

  /** `startedAt`: simulation time at which the active exercise began. */
  return { active, verdict, start, freeRide, reset, startedAt, progress }
}
