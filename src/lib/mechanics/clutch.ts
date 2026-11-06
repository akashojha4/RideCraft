/*
 * Wet multi-plate clutch, from lever to torque capacity, for a small commuter motorcycle.
 *
 *   lever pull ─(freeplay, then a fixed ratio)→ pushrod travel
 *              ─(cushion-plate stack)→ clamp load on the plates
 *              ─(n · μ · F · r)→ torque the clutch can carry
 *
 * Actuation. A cable clutch has noticeable freeplay at the lever (about 12 % of its travel)
 * so the pressure plate is never held open as the cable stretches and the plates wear. A
 * hydraulic clutch (master and slave cylinders) adjusts itself for wear and has only a
 * little freeplay (about 4 %). After the freeplay, lever travel moves the pushrod in
 * proportion, up to 2.4 mm at the grip.
 *
 * Clamp load. Coil springs press the pressure plate on the stack with 1,150 N. The stack
 * includes a wave-shaped cushion plate, so it acts as a stiff spring: as the pushrod lifts
 * the pressure plate, the clamp load falls quickly at first, then tails off gently until the
 * plates separate after 0.65 mm. Modelled as F = F₀ · (1 − x/0.65)^1.6; the exponent is a
 * model choice that gives this progressive shape, not a measured value. The gentle tail is
 * what makes the biting point controllable. Lifting the plate compresses the springs
 * further, so the force the release mechanism (and your hand) must hold rises with travel.
 *
 * Capacity. 8 friction surfaces × μ × F × 0.05 m mean radius. Plates that are gripping
 * (static) carry more than plates that are slipping (μ 0.15 vs 0.13 in motorcycle oil). With
 * the plates fully apart, oil shear still drags about 0.8 N·m — why first gear goes in with
 * a clunk.
 *
 * Values are representative, not those of a specific motorcycle.
 */

export type Actuation = 'cable' | 'hydraulic'

export const CLUTCH = {
  /** Lever travel taken up before the pushrod moves, fraction of full travel. */
  freeplay: { cable: 0.12, hydraulic: 0.04 } satisfies Record<Actuation, number>,
  /** Pushrod (and pressure-plate) travel with the lever at the grip, mm. */
  pushrodTravel: 2.4,
  /** Pushrod travel over which the cushioned stack unloads until the plates separate, mm. */
  engagementTravel: 0.65,
  cushionExponent: 1.6,
  /** Spring clamp load with the lever released, N. */
  springPreload: 1150,
  /** Extra spring force per mm of lift, N/mm. */
  springRate: 140,
  surfaces: 8,
  /** Mean friction radius, m. */
  radius: 0.05,
  muStatic: 0.15,
  muKinetic: 0.13,
  /** Oil-shear drag with the plates apart, N·m at the clutch. */
  drag: 0.8,
} as const

/** Pushrod travel, mm, for a lever pull of 0 (released) – 1 (at the grip). */
export function pushrodTravel(pull: number, actuation: Actuation = 'cable') {
  const free = CLUTCH.freeplay[actuation]
  const p = Math.min(Math.max(pull, 0), 1)
  return p <= free ? 0 : ((p - free) / (1 - free)) * CLUTCH.pushrodTravel
}

/** Clamp load on the plates, N, at a pushrod travel (mm). */
export function clampLoad(travel: number) {
  const u = travel / CLUTCH.engagementTravel
  return u >= 1 ? 0 : CLUTCH.springPreload * Math.pow(1 - Math.max(0, u), CLUTCH.cushionExponent)
}

/** Gap opened between the plates once they have separated, mm (shared across the stack). */
export const plateGap = (travel: number) => Math.max(0, travel - CLUTCH.engagementTravel)

/** Force in the springs, N — what the release mechanism holds against. */
export const springForce = (travel: number) => CLUTCH.springPreload + CLUTCH.springRate * travel

/** Clamping force as a fraction of full (0–1) for a lever pull. */
export function clampingForce(pull: number, actuation: Actuation = 'cable') {
  return clampLoad(pushrodTravel(pull, actuation)) / CLUTCH.springPreload
}

/** Torque the clutch can carry at the clutch shaft, N·m: static (gripping) or sliding. */
export function torqueCapacity(clamp: number, sliding: boolean) {
  return CLUTCH.surfaces * (sliding ? CLUTCH.muKinetic : CLUTCH.muStatic) * clamp * CLUTCH.springPreload * CLUTCH.radius
}

export type ClutchStage = 'freeplay' | 'engaged' | 'friction' | 'disengaged'

export interface ClutchMechanism {
  pull: number
  actuation: Actuation
  /** Pushrod travel, mm. */
  travel: number
  /** Gap opened between the plates, mm. */
  gap: number
  /** Clamp load, N, and as a fraction of full. */
  clampN: number
  clamp: number
  springN: number
  /** Capacity at the clutch, N·m. */
  staticCapacity: number
  slidingCapacity: number
  stage: ClutchStage
}

/** Every stage of the mechanism for one lever position. */
export function clutchMechanism(pull: number, actuation: Actuation = 'cable'): ClutchMechanism {
  const travel = pushrodTravel(pull, actuation)
  const clampN = clampLoad(travel)
  const clamp = clampN / CLUTCH.springPreload
  const stage: ClutchStage = travel === 0 ? (pull > 0 ? 'freeplay' : 'engaged') : clamp > 0 ? 'friction' : 'disengaged'
  return {
    pull,
    actuation,
    travel,
    gap: plateGap(travel),
    clampN,
    clamp,
    springN: springForce(travel),
    staticCapacity: torqueCapacity(clamp, false),
    slidingCapacity: torqueCapacity(clamp, true),
    stage,
  }
}

/** Lever pull at which the clutch passes `fraction` of its full clamp (searching from released). */
export function leverForClamp(fraction: number, actuation: Actuation = 'cable') {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (clampingForce(mid, actuation) > fraction) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
