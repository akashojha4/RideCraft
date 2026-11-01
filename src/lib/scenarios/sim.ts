import { G } from '@/lib/mechanics/braking'
import { deg, rad, riderSteer, stepLean, uprightState } from '@/lib/mechanics/cornering'
import { drivelineSpeed, initialPowertrain, stepPowertrain, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'

/*
 * Physics runners for scenarios — thin wrappers around the shared models, so every
 * consequence in a scenario is computed rather than drawn by hand.
 */

export const REACTION = 1
export const kmh = (v: number) => v * 3.6
export const ms = (k: number) => k / 3.6
export const fmt = (n: number, d = 1) => n.toFixed(d)

export interface RideSample {
  t: number
  s: PowertrainState
  inputs: PowertrainInputs
}

export const riding = (kmhSpeed: number, gear: number): Partial<PowertrainState> => ({ speed: ms(kmhSpeed), engine: drivelineSpeed(ms(kmhSpeed), gear), locked: true })

/**
 * Runs the powertrain with rider inputs chosen each step by `script` (return 'end' to stop).
 * Samples are kept every `sample` seconds.
 */
export function ride(
  start: { state?: Partial<PowertrainState>; inputs: PowertrainInputs },
  script: (t: number, s: PowertrainState, inputs: PowertrainInputs) => Partial<PowertrainInputs> | 'end' | void,
  { duration = 20, dt = 1 / 120, sample = 1 / 30 } = {},
): RideSample[] {
  let s = initialPowertrain(start.state)
  let inputs = { ...start.inputs }
  const out: RideSample[] = [{ t: 0, s, inputs }]
  let lastSample = 0
  for (let t = 0; t < duration; t += dt) {
    const change = script(t, s, inputs)
    if (change === 'end') break
    if (change) inputs = { ...inputs, ...change }
    s = stepPowertrain(s, inputs, dt)
    if (t + dt - lastSample >= sample) {
      lastSample = t + dt
      out.push({ t: t + dt, s, inputs })
    }
  }
  return out
}

/** Well-judged hard braking: a little rear, then the front squeezed on over half a second (no lock on dry asphalt). */
export const goodBraking = (since: number) => ({ clutch: 1, throttle: 0, rear: 0.12, front: Math.min(0.62, (since / 0.5) * 0.62) })

/** First sample at which a condition holds. */
export const firstWhere = <T,>(list: T[], fn: (x: T) => boolean) => list.find(fn)

export interface SwerveSample {
  t: number
  x: number
  y: number
  heading: number
  lean: number
}

/**
 * A swerve at constant speed using the lean-dynamics model: the rider countersteers to
 * `lean` degrees towards `side`, holds it for `hold` seconds, then the other way to come back
 * parallel, with `urgency` setting how briskly (see riderSteer). Returns the lateral path (x right).
 */
export function swerve(v: number, { startAt, lean, hold, side, urgency = 3 }: { startAt: number; lean: number; hold: number; side: 1 | -1; urgency?: number }, duration = 4, dt = 0.002): SwerveSample[] {
  let s = uprightState()
  const out: SwerveSample[] = []
  for (let t = 0; t < duration; t += dt) {
    const e = t - startAt
    const target = e < 0 ? 0 : e < hold ? side * rad(lean) : e < 2 * hold ? -side * rad(lean) : 0
    s = stepLean(s, riderSteer(s, target, v, urgency), v, dt)
    if (out.length === 0 || t - out[out.length - 1].t >= 1 / 30) out.push({ t, x: s.x, y: s.y, heading: deg(s.psi), lean: deg(s.phi) })
  }
  return out
}

/*
 * Quarter-car model of the front end crossing a road bump (speed breaker). Sprung mass
 * 110 kg on a fork of 14 kN/m (k) with 1.5 kN·s/m damping (c), both adjustable, and 110 mm travel; 12 kg unsprung on a
 * tyre of 150 kN/m. Braking pre-compresses the fork by the extra load moved onto the front.
 * Returns the peak vertical acceleration felt, the fork travel used (bottoming out past
 * 110 mm), the lowest tyre load as a fraction of normal, and whether the tyre left the road.
 */
export const FORK_TRAVEL = 0.11
export function bumpRide(v: number, bump: { start: number; length: number; height: number }, { preload = 0, k = 14000, c = 1500 }: { preload?: number; k?: number; c?: number } = {}) {
  const ms_ = 110
  const mu = 12
  const kt = 150000
  const dt = 0.0005
  const road = (x: number) => (x < bump.start || x > bump.start + bump.length ? 0 : bump.height * Math.sin((Math.PI * (x - bump.start)) / bump.length))
  let zs = 0
  let vs = 0
  let zu = 0
  let vu = 0
  let peakG = 0
  let minLoad = 1
  let maxComp = preload
  let airborne = false
  const trace: { x: number; t: number; body: number; comp: number; load: number }[] = []
  const T = (bump.start + bump.length + 6) / Math.max(0.5, v)
  for (let t = 0; t < T; t += dt) {
    const x = v * t
    const comp = Math.min(FORK_TRAVEL, Math.max(0, preload + (zu - zs)))
    // Past full travel the fork is solid: a stiff stop takes over.
    const stop = preload + (zu - zs) > FORK_TRAVEL ? 400000 * (preload + (zu - zs) - FORK_TRAVEL) : 0
    const fs = k * (zu - zs) + c * (vu - vs) + stop
    // Measured from the static position, so static loads cancel. The tyre can push but not pull:
    // its total force can't drop below zero, i.e. the dynamic part can't go below −weight.
    const tyreForce = Math.max(-(ms_ + mu) * G, kt * (road(x) - zu))
    if (tyreForce <= -(ms_ + mu) * G + 1) airborne = true
    minLoad = Math.min(minLoad, 1 + tyreForce / ((ms_ + mu) * G))
    const as = fs / ms_
    const au = (tyreForce - fs) / mu
    vs += as * dt
    zs += vs * dt
    vu += au * dt
    zu += vu * dt
    peakG = Math.max(peakG, Math.abs(as) / G)
    maxComp = Math.max(maxComp, preload + (zu - zs))
    if (trace.length === 0 || x - trace[trace.length - 1].x >= 0.1) trace.push({ x, t, body: zs, comp, load: 1 + tyreForce / ((ms_ + mu) * G) })
  }
  return { peakG, travelUsed: maxComp, bottomed: maxComp > FORK_TRAVEL, airborne, minLoad: Math.max(0, minLoad), trace }
}
