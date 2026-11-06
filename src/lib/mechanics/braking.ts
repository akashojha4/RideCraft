/*
 * Brakes, tyre grip and load transfer for a small motorcycle with rider.
 *
 * Load transfer: front share of the weight = static share − (h / L) × (acceleration / g),
 * from taking moments about the rear contact patch (wheelbase L = 1.3 m, centre-of-mass
 * height h = 0.6 m, 45 % on the front at rest). Under braking the share grows; under
 * acceleration it shrinks. The fork takes a fraction of a second to compress and the chassis
 * to settle; as a simple stand-in for that, the load here follows the acceleration with a
 * 0.15 s lag (a model choice, not a measured value). It reproduces why a grabbed brake can
 * lock a wheel that the same brake, squeezed on progressively, would not.
 *
 * Grip: each tyre can provide a braking force of up to μ × the load on it (μ ≈ 0.9 dry
 * asphalt, ≈ 0.5 wet). Ask for more and the wheel locks; a sliding tyre grips less — about
 * 70 % of peak, the value the slip curve in tyre.ts gives at 100 % slip — and can't steer.
 * It rolls again once the brake is eased below what the sliding tyre can carry.
 *
 * Brakes: the front brake alone can produce about 1 g of force (enough to lock the front
 * on its own), the rear about 0.6 g (far more than the lightly loaded rear can use).
 * ABS holds each brake just below the lock point. A combined braking system (CBS) makes the
 * rear pedal also apply part of the front brake.
 */

export const G = 9.81
export const WHEELBASE = 1.3
export const CG_HEIGHT = 0.6
export const STATIC_FRONT = 0.45
export const GRIP = { dry: 0.9, wet: 0.5 } as const
/** Grip of a locked, sliding tyre as a fraction of its peak grip. */
export const SLIDING = 0.7
/** Brake force at full lever / pedal, as a multiple of the total weight. */
export const FRONT_BRAKE_MAX = 1
export const REAR_BRAKE_MAX = 0.6
/** With CBS, the pedal also applies this fraction of the full front brake. */
export const CBS_FRONT = 0.35
/** ABS keeps the brake force at about this fraction of the peak grip. */
export const ABS_LIMIT = 0.92
/** Time for the load to shift after the acceleration changes (suspension pitch), s. */
export const LOAD_TAU = 0.15
/** Below this speed a wheel can't lock (it simply stops turning), m/s. */
export const LOCK_MIN_SPEED = 0.5

/** Share of the total weight on the front tyre at a given forward acceleration (m/s²). */
export const frontShare = (acceleration: number) => Math.min(1, Math.max(0, STATIC_FRONT - (CG_HEIGHT / WHEELBASE) * (acceleration / G)))

export interface BrakeInputs {
  /** Front brake lever, 0–1. */
  front: number
  /** Rear brake pedal, 0–1. */
  rear: number
  /** Ideal combined brake (always shared in proportion to the load), 0–1 = 0–0.8 g. */
  ideal: number
  cbs: boolean
}

export interface WheelBrake {
  /** Braking force the tyre is producing, N. */
  force: number
  /** The most the tyre can provide before locking, N. */
  grip: number
  locked: boolean
  /** ABS is holding the brake back. */
  abs: boolean
}

const IDEAL_MAX = 0.8

/** Force each brake asks for, N. */
export function brakeRequests(b: BrakeInputs, share: number, weight: number) {
  return {
    front: ((b.front + (b.cbs ? b.rear * CBS_FRONT : 0)) * FRONT_BRAKE_MAX + b.ideal * IDEAL_MAX * share) * weight,
    rear: (b.rear * REAR_BRAKE_MAX + b.ideal * IDEAL_MAX * (1 - share)) * weight,
  }
}

/** One tyre: the force it delivers for a requested brake force, and whether it locks. */
export function wheelBrake(request: number, load: number, grip: number, wasLocked: boolean, abs: boolean, rolling: boolean): WheelBrake {
  const peak = grip * load
  if (!rolling) return { force: Math.min(request, peak), grip: peak, locked: false, abs: false }
  if (abs) {
    const limit = ABS_LIMIT * peak
    return { force: Math.min(request, limit), grip: peak, locked: false, abs: request > limit }
  }
  const sliding = SLIDING * peak
  const locked = wasLocked ? request > sliding : request > peak
  return { force: locked ? sliding : request, grip: peak, locked, abs: false }
}
