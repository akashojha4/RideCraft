/**
 * Keyframed simulation timelines.
 *
 * A simulation is a sequence of steps. Each step lasts `duration` seconds and may
 * keyframe any channel; channels it doesn't mention carry over from the previous step.
 * The whole simulation is therefore a pure function of one time value T, so playing,
 * pausing, slowing down, replaying and jumping to a step are all exact.
 *
 * Rotating parts get their angle by integrating their speed over time. Integration is
 * done once, at build time, on a fine grid, so the angle at any T is a cheap lookup.
 */

/** [local time in seconds, value] pairs, in time order. */
export type Track = readonly (readonly [number, number])[]

export interface StepModel<C extends string> {
  duration: number
  tracks: Partial<Record<C, Track>>
}

export interface TimelineOptions<C extends string, R extends string> {
  initial: Record<C, number>
  /** Channels that jump at keyframes instead of interpolating (switches, gear). */
  discrete: readonly C[]
  /** Rotation speeds in degrees per second, derived from the channel values. */
  rotations: (values: Record<C, number>) => Record<R, number>
  /** Starting angle of each rotating part, degrees. */
  initialAngles?: Partial<Record<R, number>>
}

const GRID = 1 / 120

/** Value of a track at local time t. Before its first keyframe a track starts from the carried-over value. */
function sample(track: Track | undefined, t: number, carry: number, discrete: boolean) {
  if (!track || track.length === 0) return carry
  const [t0, v0] = track[0]
  if (t < t0) return discrete ? carry : carry + ((v0 - carry) * t) / t0
  for (let i = 1; i < track.length; i++) {
    const [t1, v1] = track[i]
    if (t < t1) {
      const [t0, v0] = track[i - 1]
      return discrete ? v0 : v0 + ((v1 - v0) * (t - t0)) / (t1 - t0)
    }
  }
  return track[track.length - 1][1]
}

export function buildTimeline<C extends string, R extends string>(steps: readonly StepModel<C>[], opts: TimelineOptions<C, R>) {
  const channels = Object.keys(opts.initial) as C[]
  const starts: number[] = []
  const startValues: Record<C, number>[] = []
  let time = 0
  let carry = { ...opts.initial }
  for (const step of steps) {
    starts.push(time)
    startValues.push(carry)
    const end = {} as Record<C, number>
    for (const c of channels) end[c] = sample(step.tracks[c], step.duration, carry[c], opts.discrete.includes(c))
    carry = end
    time += step.duration
  }
  const total = time
  const ends = steps.map((s, i) => starts[i] + s.duration)

  function locate(T: number) {
    const clamped = Math.min(Math.max(T, 0), total)
    let index = steps.length - 1
    for (let i = 0; i < steps.length; i++) {
      if (clamped < ends[i]) {
        index = i
        break
      }
    }
    return { index, local: clamped - starts[index] }
  }

  function valuesAt(T: number): Record<C, number> {
    const { index, local } = locate(T)
    const step = steps[index]
    const out = {} as Record<C, number>
    for (const c of channels) out[c] = sample(step.tracks[c], local, startValues[index][c], opts.discrete.includes(c))
    return out
  }

  // Integrate rotation speeds on a fine grid.
  const rotationKeys = Object.keys(opts.rotations(opts.initial)) as R[]
  const samples = Math.ceil(total / GRID) + 1
  const angles = {} as Record<R, Float64Array>
  for (const r of rotationKeys) {
    angles[r] = new Float64Array(samples)
    angles[r][0] = opts.initialAngles?.[r] ?? 0
  }
  let prev = opts.rotations(valuesAt(0))
  for (let i = 1; i < samples; i++) {
    const next = opts.rotations(valuesAt(i * GRID))
    for (const r of rotationKeys) angles[r][i] = angles[r][i - 1] + ((prev[r] + next[r]) / 2) * GRID
    prev = next
  }

  function anglesAt(T: number): Record<R, number> {
    const x = Math.min(Math.max(T, 0), total) / GRID
    const i = Math.min(Math.floor(x), samples - 2)
    const f = x - i
    const out = {} as Record<R, number>
    for (const r of rotationKeys) out[r] = angles[r][i] + (angles[r][i + 1] - angles[r][i]) * f
    return out
  }

  return { starts, ends, total, locate, valuesAt, anglesAt }
}

export type Timeline<C extends string, R extends string> = ReturnType<typeof buildTimeline<C, R>>
