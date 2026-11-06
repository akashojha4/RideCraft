/*
 * Geometry of the first-person road: a pinhole camera at the rider's eye, looking along the
 * motorcycle's heading. Left-hand traffic (as in the scenarios): the rider is in the middle of
 * the left lane, the centre line is to the right.
 *
 *   screen x = centre + f · x / d        screen y = horizon + f · eye height / d
 *
 * A bend of curvature c (1/radius, positive to the right) moves the road's centreline sideways
 * by c · d² / 2 at distance d (small-angle arc). Distances are metres.
 */

export const VIEW_W = 800
export const VIEW_H = 450
export const HORIZON = 190
export const FOCAL = 520
export const EYE_HEIGHT = 1.2
export const LANE = 3.5
/** Nearest distance drawn: where the road meets the bottom of the view. */
export const NEAR = (FOCAL * EYE_HEIGHT) / (VIEW_H - HORIZON)
export const FAR = 400
/** Riders hold their heads more upright than the motorcycle; the view rolls by this share of the lean. */
export const HEAD_ROLL = 0.5

/** Lateral positions relative to the rider, m (positive = right). */
export const LEFT_EDGE = -LANE / 2
export const CENTRE_LINE = LANE / 2
export const RIGHT_EDGE = LANE * 1.5

/** Sideways offset of the road at distance d in a bend of curvature c (small-angle approximation). */
export const bendOffset = (d: number, curvature: number) => (curvature * d * d) / 2

/** How far round a bend the road is drawn before it turns out of sight, rad. */
export const MAX_BEND_ANGLE = 1.4

/**
 * Where a point on the road is, relative to the rider: `s` metres along the rider's path and
 * `x` metres to the side of it (positive right), on a bend of constant curvature c (exact arc).
 * Returns forward and sideways distances, m.
 */
export function roadPoint(s: number, x: number, c: number) {
  if (Math.abs(c) < 1e-9) return { forward: s, side: x }
  const a = c * s
  return { forward: Math.sin(a) / c - x * Math.sin(a), side: (1 - Math.cos(a)) / c + x * Math.cos(a) }
}

/** Furthest distance along the road that is drawn for a bend of curvature c. */
export const visibleLength = (c: number) => (Math.abs(c) < 1e-9 ? FAR : Math.min(FAR, MAX_BEND_ANGLE / Math.abs(c)))

/** Screen position of a road point (see roadPoint), or null if it is behind the near limit. */
export function projectRoad(s: number, x: number, c: number) {
  const p = roadPoint(s, x, c)
  return p.forward < NEAR * 0.6 ? null : project(p.forward, p.side)
}

/** Screen position of a point d metres ahead and x metres to the side. */
export function project(d: number, x: number) {
  const dd = Math.max(d, 0.1)
  return { x: VIEW_W / 2 + (FOCAL * x) / dd, y: HORIZON + (FOCAL * EYE_HEIGHT) / dd }
}

/** Screen size of an object of real size `m` metres at distance d. */
export const scaleAt = (d: number) => FOCAL / Math.max(d, 0.1)

/** Distances of repeating road features (dashes, posts) between NEAR and `far`, given the distance ridden. */
export function repeating(distance: number, spacing: number, far = FAR) {
  const first = Math.ceil((distance + NEAR) / spacing) * spacing
  const out: { d: number; index: number }[] = []
  for (let at = first; at - distance < far; at += spacing) out.push({ d: at - distance, index: Math.round(at / spacing) })
  return out
}

/** Deterministic pseudo-random number in [0, 1) for a feature index, so scenery doesn't flicker. */
export function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
