import { G, GRIP } from '@/lib/mechanics/braking'

/*
 * What is on the road around the cockpit's motorcycle in a scenario: a car ahead in the rider's
 * lane, a traffic signal with its stop line, a speed breaker. Positions are distances along the
 * road from where the scenario started, in metres, so the rider's own position is simply the
 * distance ridden. Pure: stepped alongside the powertrain, testable on its own.
 */

export type Surface = 'dry' | 'wet' | 'gravel'
/** Tyre–road friction for each surface (dry and wet as in braking.ts; loose gravel about 0.35). */
export const SURFACE_GRIP: Record<Surface, number> = { dry: GRIP.dry, wet: GRIP.wet, gravel: 0.35 }

export type SignalColour = 'green' | 'amber' | 'red'

/** Half the road's width (two 3.5 m lanes either side of the centre line), m. */
export const ROAD_HALF = 3.5
/** The kerb is reached when the motorcycle's centre is this close to the road edge, m. */
export const KERB_MARGIN = 0.3
/** Radius of the motorcycle's path at full steering lock, m (wheelbase ÷ tan of the effective lock). */
export const LOCK_RADIUS = 2.8

/**
 * Where the motorcycle is on the road when it can steer: `x` along the road from the start, `y`
 * across it from the centre line (positive to the right), heading (rad, 0 = along the road,
 * positive turning right), the handlebar (−1 full lock left, 0 straight, 1 full lock right),
 * the lean that turn needs (deg) and the path ridden so far.
 */
export interface WorldPose {
  x: number
  y: number
  heading: number
  steer: number
  lean: number
  trail: readonly { x: number; y: number }[]
}

export interface WorldState {
  /** Seconds since the scenario started. */
  t: number
  /** Position of the car's rear bumper, m (null: no car). */
  carPos: number | null
  carSpeed: number
  signal: SignalColour | null
  /** Scratch values a scenario keeps (e.g. when the light turned amber). */
  mem: Record<string, number>
  /** Position and heading, for scenarios that steer (null otherwise). */
  pose: WorldPose | null
}

/** What the world can see of the rider each step: speed (m/s), handlebar, and (for a light that waits for them) gear and clutch. */
export interface RideInputs {
  speed: number
  steer: number
  gear?: number
  clutch?: number
  /** The guided step the learner is on (undefined when riding freely). */
  stage?: number
}

export interface WorldSpec {
  /** A car ahead in the rider's lane: its starting gap and its speed over time (m/s). */
  car?: { gap: number; speed?: (w: WorldState, riderDistance: number, ride?: RideInputs) => number }
  /** A traffic signal whose stop line is at `at`; its colour may depend on time, where the rider is, and memory. */
  signal?: { at: number; colour: (w: WorldState, riderDistance: number, ride?: RideInputs) => SignalColour }
  /** A speed breaker starting at `at`, `length` long and `height` high, m. */
  bump?: { at: number; length: number; height: number }
  /** The motorcycle can steer, starting `y` metres across the road from the centre line. */
  pose?: { y: number }
}

/** How far the rider's eye is behind the front of the motorcycle, m: contact with a car ahead below this gap. */
export const NOSE = 1

export function initialWorld(spec: WorldSpec | undefined): WorldState {
  const w: WorldState = { t: 0, carPos: spec?.car ? spec.car.gap : null, carSpeed: 0, signal: null, mem: {}, pose: spec?.pose ? { x: 0, y: spec.pose.y, heading: 0, steer: 0, lean: 0, trail: [{ x: 0, y: spec.pose.y }] } : null }
  if (spec?.car?.speed) w.carSpeed = spec.car.speed(w, 0)
  if (spec?.signal) w.signal = spec.signal.colour(w, 0)
  return w
}

/**
 * One step of the world. `ride` gives the motorcycle's speed (m/s) and handlebar position, for
 * scenarios that steer: at full lock it follows a circle of LOCK_RADIUS and leans as v² / (g·R) needs.
 */
export function stepWorld(spec: WorldSpec | undefined, w: WorldState, dt: number, riderDistance: number, ride?: RideInputs): WorldState {
  if (!spec) return { ...w, t: w.t + dt }
  const next: WorldState = { ...w, t: w.t + dt, mem: w.mem }
  if (w.pose && ride) {
    const { speed, steer } = ride
    const heading = w.pose.heading + ((speed * steer) / LOCK_RADIUS) * dt
    const x = w.pose.x + speed * Math.cos(heading) * dt
    const y = w.pose.y + speed * Math.sin(heading) * dt
    const lean = steer === 0 ? 0 : Math.sign(steer) * ((Math.atan((speed * speed) / (G * LOCK_RADIUS)) * 180) / Math.PI)
    const last = w.pose.trail[w.pose.trail.length - 1]
    const trail = Math.hypot(x - last.x, y - last.y) >= 0.2 ? [...w.pose.trail, { x, y }] : w.pose.trail
    next.pose = { x, y, heading, steer, lean, trail }
  }
  if (spec.car && w.carPos != null) {
    next.carSpeed = spec.car.speed ? Math.max(0, spec.car.speed(next, riderDistance, ride)) : 0
    next.carPos = w.carPos + next.carSpeed * dt
  }
  if (spec.signal) next.signal = spec.signal.colour(next, riderDistance, ride)
  return next
}

/** Gap from the rider to the car ahead, m (null: no car). */
export const carGap = (w: WorldState, riderDistance: number) => (w.carPos == null ? null : w.carPos - riderDistance)
/** Distance from the rider to the signal's stop line, m (negative once past it). */
export const lineGap = (spec: WorldSpec | undefined, riderDistance: number) => (spec?.signal ? spec.signal.at - riderDistance : null)
/** Distance to the start of the speed breaker, m. */
export const bumpGap = (spec: WorldSpec | undefined, riderDistance: number) => (spec?.bump ? spec.bump.at - riderDistance : null)
/** Distance from the motorcycle to the nearer road edge, m (null: not steering). */
export const edgeGap = (w: WorldState) => (w.pose ? ROAD_HALF - Math.abs(w.pose.y) : null)

