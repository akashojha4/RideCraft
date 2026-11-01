/**
 * Clutch lever travel → spring clamping force (0–1).
 *
 *   0 – 15 %   freeplay: cable slack taken up, the springs still fully clamp the plates;
 *   15 – 60 %  the pressure plate lifts progressively and clamping force — and so the
 *              torque the clutch can pass — falls from 100 % to 0: the friction zone;
 *   60 – 100 % plates fully separated, no torque passes.
 */
export const CLUTCH_FREEPLAY = 0.15
export const CLUTCH_FULLY_LIFTED = 0.6

export function clampingForce(pull: number) {
  if (pull <= CLUTCH_FREEPLAY) return 1
  if (pull >= CLUTCH_FULLY_LIFTED) return 0
  return 1 - (pull - CLUTCH_FREEPLAY) / (CLUTCH_FULLY_LIFTED - CLUTCH_FREEPLAY)
}
