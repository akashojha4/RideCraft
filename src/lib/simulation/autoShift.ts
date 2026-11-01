import type { InputSequence } from '@/hooks/usePowertrainSim'
import { drivelineSpeed, radToRpm } from '@/lib/mechanics/powertrain'

/**
 * The textbook gear change, as a timed input sequence:
 *   1. pull in the clutch and close the throttle (0 – 0.12 s);
 *   2. move the lever (at 0.15 s);
 *   3. optionally rev-match: while the clutch is in, open the throttle just enough to bring
 *      the engine to the speed the new gear will need at the current road speed
 *      (0.15 – 0.75 s) — what a skilled rider's throttle “blip” achieves on a downshift;
 *   4. ease the clutch out (0.35 – 0.75 s);
 *   5. return the throttle to where the rider had it (0.75 – 0.95 s).
 * At a standstill the clutch is left pulled in, as a rider would, so the engine doesn't stall.
 */
export const SHIFT_DURATION = 0.95
const CLUTCH_IN = 0.12
const SELECT = 0.15
const RELEASE_START = 0.35
const RELEASED = 0.75
/** Throttle per RPM of shortfall while rev-matching. */
const MATCH_GAIN = 1 / 600

export function autoShift(targetGear: number, { blip = false, holdClutch = false }: { blip?: boolean; holdClutch?: boolean } = {}): InputSequence {
  return (e, start, state) => {
    const ramp = (from: number, to: number, t0: number, t1: number) => from + (to - from) * Math.min(1, Math.max(0, (e - t0) / (t1 - t0)))
    const clutch = e < CLUTCH_IN ? ramp(start.clutch, 1, 0, CLUTCH_IN) : holdClutch || e < RELEASE_START ? 1 : ramp(1, 0, RELEASE_START, RELEASED)
    let throttle: number
    if (e < SELECT) throttle = ramp(start.throttle, 0, 0, CLUTCH_IN)
    else if (e < RELEASED) {
      if (blip && targetGear > 0) {
        const shortfall = radToRpm(drivelineSpeed(state.speed, targetGear)) - radToRpm(state.engine)
        throttle = Math.min(1, Math.max(0, shortfall * MATCH_GAIN))
      } else throttle = 0
    } else throttle = ramp(0, start.throttle, RELEASED, SHIFT_DURATION)
    return {
      inputs: { clutch, throttle, ...(e >= SELECT ? { gear: targetGear } : {}) },
      done: e >= SHIFT_DURATION,
    }
  }
}
