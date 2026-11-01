/**
 * Butterfly throttle valve. The idle stop holds the plate about 6° open from fully
 * closed. Airflow is approximated as the fraction of the duct the plate leaves
 * uncovered (projected blockage = plate length × cos(opening angle)); real airflow also
 * depends on engine speed.
 */
export const THROTTLE_IDLE_ANGLE = 6
/** Plate half-length and duct half-height, in the diagram's units. */
export const THROTTLE_PLATE_HALF = 26
export const THROTTLE_DUCT_HALF = 28

/** Valve angle from closed, degrees, for a throttle opening of 0–100 %. */
export function valveAngle(opening: number) {
  return THROTTLE_IDLE_ANGLE + (opening / 100) * (90 - THROTTLE_IDLE_ANGLE)
}

/** Relative airflow, 0–1. */
export function airflow(opening: number) {
  const a = (valveAngle(opening) * Math.PI) / 180
  return Math.max(0, 1 - (Math.cos(a) * THROTTLE_PLATE_HALF) / THROTTLE_DUCT_HALF)
}
