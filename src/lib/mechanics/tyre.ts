import { G } from './braking'

/*
 * Tyre force against slip, and wheel-slip control (ABS and traction control).
 *
 * Grip comes from a little slip: a braked tyre turns slightly slower than the road passes
 * under it, a driven one slightly faster, a cornering one points slightly away from where
 * it is going (slip angle). Force rises with slip to a peak — about 12 % slip, or about 5°
 * of slip angle — then falls as the tyre starts to slide (a locked tyre keeps about 70 %). Shapes follow Pacejka's "magic
 * formula": μ = D·sin(C·atan(B·s − E·(B·s − atan(B·s)))), with D the peak friction.
 *
 * Wheel model: one wheel carrying the motorcycle's full braking (or drive), inertia
 * 0.9 kg·m² (both wheels and drivetrain lumped), radius 0.3 m, load = weight. Each step:
 *   vehicle:  dv/dt = ∓μ(s)·g     wheel:  I·dω/dt = ±μ(s)·N·r − (brake or drive) torque
 * ABS releases brake pressure when slip passes 15 % and re-applies below 5 %; traction
 * control cuts drive torque above 10 % slip and restores it below 4 %. Real systems decide
 * this hundreds of times a second; the pattern is the same.
 */

const B = 12
const C = 1.6
const E = 0
const BL = 0.35
const CL = 1.5
const EL = 0.2
const R = 0.3
const I = 0.9
const MASS = 225

/** Longitudinal friction at slip ratio s (0–1), for a surface with peak friction `peak`. */
export const mu = (s: number, peak: number) => peak * Math.sin(C * Math.atan(B * s - E * (B * s - Math.atan(B * s))))
/** Lateral friction at slip angle α (deg). */
export const muLateral = (alpha: number, peak: number) => peak * Math.sin(CL * Math.atan(BL * alpha - EL * (BL * alpha - Math.atan(BL * alpha))))
/** Slip ratio at which longitudinal grip peaks. */
export function peakSlip(peak = 1) {
  let best = { s: 0, m: 0 }
  for (let s = 0; s <= 1; s += 0.001) if (mu(s, peak) > best.m) best = { s, m: mu(s, peak) }
  return best.s
}

export interface SlipSample {
  t: number
  /** Road speed and wheel surface speed, m/s. */
  v: number
  wheel: number
  slip: number
  /** Brake or drive torque as a fraction of the maximum asked for. */
  torque: number
  distance: number
}

/** Hard stop from `v0` with the brake applied fully in 0.15 s, with or without ABS. */
export function brakeStop(v0: number, peak: number, abs: boolean) {
  const dt = 0.0002
  const maxTorque = 1.6 * peak * MASS * G * R
  let v = v0
  let w = v0 / R
  let tq = 0
  let releasing = false
  let d = 0
  const out: SlipSample[] = []
  for (let t = 0; v > 0.5 && t < 15; t += dt) {
    const s = v > 0.5 ? Math.max(0, (v - w * R) / v) : 0
    const f = mu(Math.min(1, s), peak)
    if (abs) {
      if (s > 0.15) releasing = true
      else if (s < 0.05) releasing = false
      tq = releasing ? Math.max(0, tq - maxTorque * dt * 12) : Math.min(maxTorque, tq + maxTorque * dt * 8)
    } else tq = Math.min(maxTorque, tq + (maxTorque * dt) / 0.15)
    v -= f * G * dt
    w = Math.max(0, w + ((f * MASS * G * R - tq) / I) * dt)
    d += v * dt
    if (out.length === 0 || t - out[out.length - 1].t >= 0.004) out.push({ t, v, wheel: w * R, slip: s, torque: tq / maxTorque, distance: d })
  }
  // The last half metre per second, at the average deceleration.
  return { samples: out, distance: d + 0.0128, time: out[out.length - 1].t }
}

/** Snap the throttle open from `v0` in a low gear: drive torque far above what the tyre can carry. */
export function launch(v0: number, peak: number, tc: boolean, seconds = 2.5) {
  const dt = 0.0002
  // Drive torque at the wheel on a sudden full throttle in first gear (about 0.9 g worth).
  const drive = 0.9 * MASS * G * R
  // The rev limiter caps how fast the rear wheel can spin in first gear (≈ 35 km/h).
  const wMax = 9.9 / R
  let v = v0
  let w = v0 / R
  let tq = 0
  let cutting = false
  let d = 0
  const out: SlipSample[] = []
  for (let t = 0; t < seconds; t += dt) {
    const s = Math.max(0, (w * R - v) / Math.max(1, v))
    const f = mu(Math.min(1, s), peak) * (w * R > v ? 1 : 0)
    if (tc) {
      if (s > 0.1) cutting = true
      else if (s < 0.04) cutting = false
      tq = cutting ? Math.max(0, tq - drive * dt * 15) : Math.min(drive, tq + drive * dt * 10)
    } else tq = Math.min(drive, tq + (drive * dt) / 0.1)
    v += f * 0.55 * G * dt
    w = Math.min(wMax, Math.max(v / R, w + ((tq - f * 0.55 * MASS * G * R) / I) * dt))
    d += v * dt
    if (out.length === 0 || t - out[out.length - 1].t >= 0.004) out.push({ t, v, wheel: w * R, slip: s, torque: tq / drive, distance: d })
  }
  return { samples: out, distance: d, speed: v }
}
