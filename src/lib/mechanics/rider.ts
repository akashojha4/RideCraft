/**
 * Rider posture from the "rider triangle". Legs and arms are solved with two-bone inverse
 * kinematics; the torso lean is chosen so the hands reach the bars with the requested
 * arm extension. Units are drawing units, with limbs scaled so the torso is about one
 * wheel diameter, as on a real rider.
 */

export type Pt = { x: number; y: number }

export const LIMB = { thigh: 64, shin: 60, torso: 90, upperArm: 42, forearm: 40 }

export const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y)

/** Two-bone IK: joint position for a limb from `a` to `b`; `prefer` picks between the two solutions. */
export function joint(a: Pt, b: Pt, l1: number, l2: number, prefer: (p: Pt, q: Pt) => Pt): Pt {
  const d = Math.min(Math.max(dist(a, b), 1), l1 + l2 - 0.01)
  const ux = (b.x - a.x) / dist(a, b)
  const uy = (b.y - a.y) / dist(a, b)
  const cos = (l1 ** 2 + d ** 2 - l2 ** 2) / (2 * l1 * d)
  const sin = Math.sqrt(Math.max(0, 1 - cos ** 2))
  const p = { x: a.x + l1 * (ux * cos - uy * sin), y: a.y + l1 * (uy * cos + ux * sin) }
  const q = { x: a.x + l1 * (ux * cos + uy * sin), y: a.y + l1 * (uy * cos - ux * sin) }
  return prefer(p, q)
}

/**
 * Solve a rider sitting on a motorcycle that faces left (front = smaller x).
 * `armExtension` is the hand-to-shoulder distance as a fraction of full arm length:
 * about 0.9 is relaxed with bent elbows; close to 1 is arms locked straight.
 */
export function solveRider(
  { hip, hand, foot }: { hip: Pt; hand: Pt; foot: Pt },
  { armExtension = 0.9 }: { armExtension?: number } = {},
) {
  const reach = armExtension * (LIMB.upperArm + LIMB.forearm)
  let best = { lean: 0, err: Infinity }
  for (let lean = -25; lean <= 70; lean += 0.5) {
    const r = (lean * Math.PI) / 180
    const s = { x: hip.x - LIMB.torso * Math.sin(r), y: hip.y - LIMB.torso * Math.cos(r) }
    const err = Math.abs(dist(s, hand) - reach)
    if (err < best.err) best = { lean, err }
  }
  const r = (best.lean * Math.PI) / 180
  const shoulder = { x: hip.x - LIMB.torso * Math.sin(r), y: hip.y - LIMB.torso * Math.cos(r) }
  const head = { x: shoulder.x - 18 * Math.sin(r), y: shoulder.y - 18 * Math.cos(r) }
  // Knees point forward (towards the front); elbows bend down.
  const knee = joint(hip, foot, LIMB.thigh, LIMB.shin, (p, q) => (p.x < q.x ? p : q))
  const elbow = joint(shoulder, hand, LIMB.upperArm, LIMB.forearm, (p, q) => (p.y > q.y ? p : q))
  return { lean: best.lean, shoulder, head, knee, elbow }
}

export const polyline = (...pts: Pt[]) => `M${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}`
