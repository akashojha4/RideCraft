import { G, WHEELBASE } from './braking'

/*
 * Cornering physics for a small motorcycle with rider (same vehicle as braking.ts).
 *
 * Steady turn: the combined centre of mass leans until gravity and the cornering force
 * balance about the tyre contact patches, so tan(lean) = v² / (g R) — independent of mass.
 * The lateral acceleration is g·tan(lean), and the tyres must supply it as friction, so the
 * lean can never exceed atan(μ) (≈ 42° dry, 27° wet). On a commuter motorcycle the footpegs
 * touch the road at about 40°.
 *
 * Lean dynamics (point-mass model of a two-wheeler, after Åström, Klein & Lennartsson 2005):
 *   h·φ'' = g·sin φ − (v² / L)·δ·cos φ − (a·v / L)·δ'·cos φ
 * φ = lean (positive right), δ = steer angle at the road (positive right), h = centre-of-mass
 * height, a = its distance ahead of the rear contact patch, L = wheelbase. Gravity alone
 * tips the motorcycle over; steering under it creates the cornering force that holds it up.
 * To lean right from upright, the front wheel must first be steered left — countersteering.
 * Heading changes at ψ' = v·tan δ / L.
 */

export const CG_HEIGHT_TURN = 0.6
export const CG_AHEAD = 0.6
/** Lean angle at which the footpegs touch down, deg. */
export const CLEARANCE_LEAN = 40
/** Handlebar steering lock, deg. */
export const STEERING_LOCK = 38
/** Steering-head rake: the steering axis leans back this far from vertical, deg (typical small commuter). */
export const RAKE = 26

export const rad = (d: number) => (d * Math.PI) / 180
export const deg = (r: number) => (r * 180) / Math.PI
export const ms = (kmh: number) => kmh / 3.6

/** Lean angle needed for a steady turn of radius `r` (m) at `v` (m/s), deg. */
export const leanFor = (v: number, r: number) => deg(Math.atan((v * v) / (G * r)))
/** Turn radius at speed `v` (m/s) and lean `leanDeg`, m. */
export const radiusFor = (v: number, leanDeg: number) => (v * v) / (G * Math.tan(rad(Math.max(0.01, leanDeg))))
/** Fastest speed for a turn of radius `r` at lean `leanDeg`, m/s. */
export const speedFor = (r: number, leanDeg: number) => Math.sqrt(G * r * Math.tan(rad(leanDeg)))
/** Largest lean the tyres can hold on a surface with friction coefficient μ, deg. */
export const gripLean = (mu: number) => deg(Math.atan(mu))
/** Lateral acceleration at a given lean, in g. */
export const lateralG = (leanDeg: number) => Math.tan(rad(leanDeg))
/**
 * Steer angle at the road for a handlebar angle, deg. Because the steering axis is raked back,
 * turning the bars turns the wheel's contact line on the road by less: tan δ = tan(bar) · cos(rake)
 * (upright motorcycle; lean and trail ignored).
 */
export const roadSteer = (barDeg: number) => deg(Math.atan(Math.tan(rad(barDeg)) * Math.cos(rad(RAKE))))
/** Full lock measured at the road, deg (≈ 35° for 38° at the bars). */
export const ROAD_LOCK = roadSteer(STEERING_LOCK)
/**
 * Walking-pace turning radius for a handlebar angle, m, measured at the front wheel — the
 * outermost track, and how manufacturers quote it: wheelbase / sin(road steer). The rear wheel
 * follows a tighter circle, wheelbase / tan(road steer).
 */
export const turnRadius = (barDeg: number) => WHEELBASE / Math.sin(rad(Math.max(0.5, roadSteer(barDeg))))
/** Tightest turning radius at full lock, m (≈ 2.3 m; owner's manuals list about 1.9–2.9 m for 125 cc motorcycles). */
export const LOCK_RADIUS = turnRadius(STEERING_LOCK)
/** Steer angle needed to hold a lean at speed v, deg (small-angle kinematic turn). */
export const steerFor = (v: number, leanDeg: number) => deg(Math.atan((G * WHEELBASE * Math.tan(rad(leanDeg))) / Math.max(0.01, v * v)))

/*
 * Body position (rear view). The motorcycle (150 kg, centre of mass 0.5 m up its centre line)
 * leans at β about the contact patch; the rider (75 kg, centre of mass 0.95 m up) can move
 * their centre of mass `offset` metres sideways from the motorcycle's centre line (positive
 * towards the inside of the turn). The turn needs the *combined* centre of mass at the
 * cornering lean, so moving the rider inward lets the motorcycle itself lean less.
 */
export const BIKE_MASS = 150
export const RIDER_MASS = 75
export const BIKE_CG = 0.5
export const RIDER_CG = 0.95

/** Combined centre of mass (inward offset x, height y, m) for motorcycle lean β (deg) and rider offset. */
export function combinedCg(betaDeg: number, offset: number) {
  const b = rad(betaDeg)
  const m = BIKE_MASS + RIDER_MASS
  const x = (BIKE_MASS * BIKE_CG * Math.sin(b) + RIDER_MASS * (RIDER_CG * Math.sin(b) + offset * Math.cos(b))) / m
  const y = (BIKE_MASS * BIKE_CG * Math.cos(b) + RIDER_MASS * (RIDER_CG * Math.cos(b) - offset * Math.sin(b))) / m
  return { x, y }
}

/** Motorcycle lean (deg) that puts the combined centre of mass at the cornering lean `leanDeg`. */
export function bikeLeanFor(leanDeg: number, offset: number) {
  let lo = -80
  let hi = 80
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    const c = combinedCg(mid, offset)
    if (deg(Math.atan2(c.x, c.y)) < leanDeg) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export interface LeanState {
  /** Lean, rad (positive right). */
  phi: number
  /** Lean rate, rad/s. */
  phiDot: number
  /** Steer angle at the road, rad (positive right). */
  delta: number
  /** Heading, rad (0 = up the page, positive clockwise / right). */
  psi: number
  x: number
  y: number
}

export const uprightState = (): LeanState => ({ phi: 0, phiDot: 0, delta: 0, psi: 0, x: 0, y: 0 })

/** Advance the lean dynamics by `dt` with the steer angle set to `delta` (rad). */
export function stepLean(s: LeanState, delta: number, v: number, dt: number): LeanState {
  const h = CG_HEIGHT_TURN
  const deltaDot = (delta - s.delta) / dt
  const phiDDot = (G * Math.sin(s.phi) - ((v * v) / WHEELBASE) * delta * Math.cos(s.phi) - ((CG_AHEAD * v) / WHEELBASE) * deltaDot * Math.cos(s.phi)) / h
  const phiDot = s.phiDot + phiDDot * dt
  const phi = s.phi + phiDot * dt
  const psi = s.psi + ((v * Math.tan(delta)) / WHEELBASE) * dt
  return { phi, phiDot, delta, psi, x: s.x + v * Math.sin(psi) * dt, y: s.y + v * Math.cos(psi) * dt }
}

/**
 * A rider holding a target lean the way people do without thinking: steer to keep the
 * cornering force matched to the lean, plus a correction towards the target. Starting from
 * upright, the correction first steers *away* from the turn — the countersteer.
 * `w` (rad/s) sets how briskly: about 3 for an everyday turn, 6–7 for an emergency swerve.
 */
export function riderSteer(s: LeanState, targetPhi: number, v: number, w = 3) {
  const hl = CG_HEIGHT_TURN * WHEELBASE
  const k1 = (w * w * hl) / (v * v)
  const k2 = (2 * 0.8 * w * hl) / (v * v)
  const balance = (G * WHEELBASE * Math.tan(s.phi)) / (v * v)
  const delta = balance + k1 * (s.phi - targetPhi) + k2 * s.phiDot
  const lock = rad(ROAD_LOCK)
  return Math.max(-lock, Math.min(lock, delta))
}
