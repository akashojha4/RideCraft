import type { PowertrainInputs, PowertrainState } from '@/lib/mechanics/powertrain'
import type { PowertrainDerived } from './models/powertrain'

/*
 * Learner mistakes, spotted from one simulation step to the next, so a guided scenario can
 * explain them constructively instead of just failing. Starting in gear and changing gear
 * without the clutch are refused by the cockpit itself and reported from there.
 */

export type MistakeId =
  | 'stall'
  | 'front-lock'
  | 'rear-lock'
  | 'roll-back'
  | 'lurch'
  | 'slip-heat'
  | 'over-rev'
  | 'start-in-gear'
  | 'shift-without-clutch'
  // Scenario-specific (spotted with the world in view):
  | 'collision'
  | 'ran-red'
  | 'tailgating'
  | 'bump-fast'
  | 'bump-braking'
  | 'stopped-in-traffic'
  | 'kerb'
  | 'too-fast-turn'
  | 'lock-front-brake'

/**
 * A jolt: acceleration rising faster than this, m/s³. What a rider feels as jerky is a sudden
 * change in acceleration, not its size — a brisk but smooth pull-away builds up over about a
 * second; a dumped clutch steps up within a fraction of one.
 */
export const LURCH_JERK = 30
/** Only while actually accelerating, m/s². */
const LURCH_MIN = 1.5
/**
 * Engine speed that is far too high while the clutch slips, RPM. (Heat alone doesn't tell
 * abuse from a normal pull-away: the slipping clutch limits the torque, so a careful start at
 * ~3,500 RPM makes as much heat as a screaming one — the revs are what differ.)
 */
export const SLIP_RPM = 6000
export const OVER_REV_RPM = 8500

/** `dt`: seconds between `prev` and `s`. */
export function detectMistake(prev: PowertrainState, s: PowertrainState, i: PowertrainInputs, d: PowertrainDerived, dt: number): MistakeId | null {
  if (prev.running && !s.running && s.stallCause) return 'stall'
  if (!prev.brakes.front.locked && s.brakes.front.locked) return 'front-lock'
  if (!prev.brakes.rear.locked && s.brakes.rear.locked) return 'rear-lock'
  // Rolling backwards on a climb (about 0.7 km/h back).
  if (i.grade > 0 && prev.speed > -0.2 && s.speed <= -0.2) return 'roll-back'
  if (s.running && i.gear > 0 && dt > 0 && s.acceleration > LURCH_MIN && (s.acceleration - prev.acceleration) / dt > LURCH_JERK) return 'lurch'
  if (d.slipping && d.clamp > 0.02 && d.engineRpm > SLIP_RPM) return 'slip-heat'
  if (s.running && i.gear > 0 && s.locked && d.engineRpm > OVER_REV_RPM) return 'over-rev'
  return null
}
