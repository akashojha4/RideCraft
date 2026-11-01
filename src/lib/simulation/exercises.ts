import type { PowertrainInputs, PowertrainState } from '@/lib/mechanics/powertrain'

/** Telemetry gathered while an exercise runs, used to score it. */
export interface ExerciseMetrics {
  /** Seconds since the exercise started. */
  t: number
  stalled: boolean
  /** Largest forward acceleration so far, m/s². */
  maxAccel: number
  /** Largest deceleration so far, m/s² (positive). */
  maxDecel: number
  /** Furthest roll backwards so far, m (≤ 0). */
  minDistance: number
  /** Seconds spent creeping with the clutch lever held in the friction zone. */
  creepSeconds: number
  /** The engine was forced past its rev limiter (e.g. by a downshift at too high a speed). */
  overRevved: boolean
  brakeUsed: boolean
  maxRpm: number
}

export interface ExerciseContext extends ExerciseMetrics {
  state: PowertrainState
  inputs: PowertrainInputs
  /** Seconds since the previous step. */
  dt: number
  /** Acceleration the rider feels now (filtered), m/s². */
  felt: number
  /** Scratch values an exercise can keep between steps; cleared when it starts. */
  memo: Record<string, number>
}

export type Verdict = { result: 'pass' | 'fail'; text: string } | null

export interface Exercise {
  id: string
  title: string
  goal: string
  tips: string[]
  setup: { inputs: PowertrainInputs; state?: Partial<PowertrainState> }
  evaluate: (c: ExerciseContext) => Verdict
}

export interface Topic {
  title: string
  text: string
  exercise?: string
}

export const emptyMetrics = (): ExerciseMetrics => ({
  t: 0,
  stalled: false,
  maxAccel: 0,
  maxDecel: 0,
  minDistance: 0,
  creepSeconds: 0,
  overRevved: false,
  brakeUsed: false,
  maxRpm: 0,
})
