import { G, GRIP } from '@/lib/mechanics/braking'

/*
 * What is on the road around the cockpit's motorcycle in a scenario: a car ahead, a car behind,
 * oncoming traffic, a person, a crossing car, a signal, a bump, a bend, night. Positions are
 * distances along the road from where the scenario started, in metres. Pure: stepped alongside
 * the powertrain, testable on its own.
 */

export type Surface = 'dry' | 'wet' | 'gravel'
/** Tyre–road friction for each surface (dry and wet as in braking.ts; loose gravel about 0.35). */
export const SURFACE_GRIP: Record<Surface, number> = { dry: GRIP.dry, wet: GRIP.wet, gravel: 0.35 }
/** What the vehicle ahead is drawn as. */
export type VehicleKind = 'car' | 'truck' | 'tractor'

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
  /** Lateral offset of the vehicle ahead from the rider's track, m (positive = right). */
  carX: number
  /** What the vehicle ahead is drawn as. */
  carKind: VehicleKind
  signal: SignalColour | null
  /** Scratch values a scenario keeps (e.g. when the light turned amber). */
  mem: Record<string, number>
  /** Position and heading, for scenarios that steer (null otherwise). */
  pose: WorldPose | null
  /** Front of a following car, m along the road (null: none). Rider at 0 starts this negative. */
  behindPos: number | null
  behindSpeed: number
  /** Oncoming vehicle, m along the road (null: none). Moves toward the rider. */
  oncomingPos: number | null
  oncomingSpeed: number
  /** Person in or beside the lane, m along the road (null: none). */
  personAt: number | null
  /** Person's offset from the rider's wheel track, m (positive = right). */
  personX: number
  /** What the in-lane figure is drawn as. */
  personKind: 'person' | 'dog'
  /** Cross-traffic car's lateral position from the rider's track, m (null: none). */
  crossX: number | null
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
  /** A vehicle ahead: starting gap, optional speed (m/s), lane offset, and what it looks like. */
  car?: { gap: number; speed?: (w: WorldState, riderDistance: number, ride?: RideInputs) => number; x?: number; kind?: VehicleKind }
  /** A wet painted line in the rider's wheel track. */
  paint?: boolean
  /** A roundabout / island kerb this far ahead, offset `x` m, radius `r` m. */
  island?: { at: number; x: number; r?: number }
  /** A car behind in the rider's lane: starting gap (m) and its speed (m/s). */
  behind?: { gap: number; speed?: (w: WorldState, riderDistance: number, ride?: RideInputs) => number }
  /** An oncoming vehicle: starting distance ahead (m) and closing speed (m/s). */
  oncoming?: { at: number; speed?: (w: WorldState, riderDistance: number, ride?: RideInputs) => number }
  /** A person or a dog on the road, this far ahead, offset `x` m from the wheel track (0 = in it). */
  person?: { at: number; x?: number; kind?: 'person' | 'dog' }
  /** A car crossing at `at` m, starting at lateral `x0` m, moving at `vx` m/s (negative = toward the rider's lane). */
  cross?: { at: number; x0: number; vx?: (w: WorldState, riderDistance: number, ride?: RideInputs) => number }
  /** A traffic signal whose stop line is at `at`; its colour may depend on time, where the rider is, and memory. */
  signal?: { at: number; colour: (w: WorldState, riderDistance: number, ride?: RideInputs) => SignalColour }
  /** A speed breaker starting at `at`, `length` long and `height` high, m. */
  bump?: { at: number; length: number; height: number }
  /** The motorcycle can steer, starting `y` metres across the road from the centre line. */
  pose?: { y: number }
  /** Constant lane curvature, 1/m (positive = right-hand bend). The motorcycle stays in-lane; lean follows speed. */
  curvature?: number
  /** Headlight reach at night, m. Hazards beyond it are unlit. */
  beam?: number
}

/** How far the rider's eye is behind the front of the motorcycle, m: contact with a car ahead below this gap. */
export const NOSE = 1

export function initialWorld(spec: WorldSpec | undefined): WorldState {
  const w: WorldState = {
    t: 0,
    carPos: spec?.car ? spec.car.gap : null,
    carSpeed: 0,
    carX: spec?.car?.x ?? 0,
    carKind: spec?.car?.kind ?? 'car',
    signal: null,
    mem: {},
    pose: spec?.pose ? { x: 0, y: spec.pose.y, heading: 0, steer: 0, lean: 0, trail: [{ x: 0, y: spec.pose.y }] } : null,
    behindPos: spec?.behind ? -spec.behind.gap : null,
    behindSpeed: 0,
    oncomingPos: spec?.oncoming ? spec.oncoming.at : null,
    oncomingSpeed: 0,
    personAt: spec?.person ? spec.person.at : null,
    personX: spec?.person?.x ?? 0,
    personKind: spec?.person?.kind ?? 'person',
    crossX: spec?.cross ? spec.cross.x0 : null,
  }
  if (spec?.car?.speed) w.carSpeed = spec.car.speed(w, 0)
  if (spec?.behind?.speed) w.behindSpeed = spec.behind.speed(w, 0)
  if (spec?.oncoming?.speed) w.oncomingSpeed = spec.oncoming.speed(w, 0)
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
  if (spec.behind && w.behindPos != null) {
    next.behindSpeed = spec.behind.speed ? Math.max(0, spec.behind.speed(next, riderDistance, ride)) : 0
    next.behindPos = w.behindPos + next.behindSpeed * dt
  }
  if (spec.oncoming && w.oncomingPos != null) {
    next.oncomingSpeed = spec.oncoming.speed ? Math.max(0, spec.oncoming.speed(next, riderDistance, ride)) : 0
    next.oncomingPos = w.oncomingPos - next.oncomingSpeed * dt
  }
  if (spec.cross && w.crossX != null) {
    const vx = spec.cross.vx ? spec.cross.vx(next, riderDistance, ride) : -8
    next.crossX = w.crossX + vx * dt
  }
  if (spec.signal) next.signal = spec.signal.colour(next, riderDistance, ride)
  return next
}

/** Gap from the rider to the car ahead, m (null: no car). */
export const carGap = (w: WorldState, riderDistance: number) => (w.carPos == null ? null : w.carPos - riderDistance)
/** Gap to a vehicle that is actually in the rider's own lane, m (null: none, or it is in the next lane). */
export const inLaneCarGap = (w: WorldState, riderDistance: number) => (Math.abs(w.carX) > 1.5 ? null : carGap(w, riderDistance))
/** Gap from a following car's front to the rider, m (null: none). Positive = they are still behind. */
export const behindGap = (w: WorldState, riderDistance: number) => (w.behindPos == null ? null : riderDistance - w.behindPos)
/** Gap to an oncoming vehicle, m (null: none). */
export const oncomingGap = (w: WorldState, riderDistance: number) => (w.oncomingPos == null ? null : w.oncomingPos - riderDistance)
/** Gap to a person on the road, m (null: none). */
export const personGap = (w: WorldState, riderDistance: number) => (w.personAt == null ? null : w.personAt - riderDistance)
/** Nearest hazard in the rider's own lane (car ahead or person), m. */
export function aheadGap(w: WorldState, riderDistance: number) {
  const gaps = [inLaneCarGap(w, riderDistance), personGap(w, riderDistance)].filter((g): g is number => g != null)
  return gaps.length ? Math.min(...gaps) : null
}
/** Distance from the rider to a crossing car's path, m (null: none). */
export const crossGap = (spec: WorldSpec | undefined, riderDistance: number) => (spec?.cross ? spec.cross.at - riderDistance : null)
/** Distance from the rider to the signal's stop line, m (negative once past it). */
export const lineGap = (spec: WorldSpec | undefined, riderDistance: number) => (spec?.signal ? spec.signal.at - riderDistance : null)
/** Distance to the start of the speed breaker, m. */
export const bumpGap = (spec: WorldSpec | undefined, riderDistance: number) => (spec?.bump ? spec.bump.at - riderDistance : null)
/** Distance from the motorcycle to the nearer road edge, m (null: not steering). */
export const edgeGap = (w: WorldState) => (w.pose ? ROAD_HALF - Math.abs(w.pose.y) : null)
/** Lean the bend asks for at this speed, deg (positive = right). */
export function leanForCurvature(speed: number, curvature: number) {
  if (Math.abs(curvature) < 1e-6) return 0
  const R = 1 / Math.abs(curvature)
  return Math.sign(curvature) * ((Math.atan((speed * speed) / (G * R)) * 180) / Math.PI)
}

