/** SVG geometry helpers shared by mechanical illustrations. */

export interface Circle {
  x: number
  y: number
  r: number
}

const f = (n: number) => n.toFixed(2)

/**
 * Closed loop around two circles (a chain or belt): both external tangents joined by
 * arcs around each circle. The path starts on the run that lies to the left of the
 * direction from `a` to `b` (the top run when `b` is to the right of `a`) and travels
 * from `a` towards `b` on that run, so a negative dash offset moves the chain the way
 * a clockwise-turning sprocket would drive it.
 */
export function beltPath(a: Circle, b: Circle): string {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.hypot(dx, dy)
  const ux = dx / d
  const uy = dy / d
  // Unit normal of each tangent: n = k·u + m·p, where p ⟂ u and k = (ra − rb) / d.
  const k = (a.r - b.r) / d
  const m = Math.sqrt(1 - k * k)
  const px = -uy
  const py = ux
  const n1 = { x: k * ux - m * px, y: k * uy - m * py }
  const n2 = { x: k * ux + m * px, y: k * uy + m * py }
  const at = (c: Circle, n: { x: number; y: number }) => `${f(c.x + c.r * n.x)},${f(c.y + c.r * n.y)}`
  const largeB = b.r > a.r ? 1 : 0
  const largeA = a.r > b.r ? 1 : 0
  return [
    `M${at(a, n1)}`,
    `L${at(b, n1)}`,
    `A${f(b.r)},${f(b.r)} 0 ${largeB} 1 ${at(b, n2)}`,
    `L${at(a, n2)}`,
    `A${f(a.r)},${f(a.r)} 0 ${largeA} 1 ${at(a, n1)}`,
  ].join(' ')
}

/** Outline of a sprocket centred on the origin, with trapezoidal teeth around `pitchRadius`. */
export function sprocketPath(teeth: number, pitchRadius: number, rootDepth = 3.5, tipHeight = 4): string {
  const root = pitchRadius - rootDepth
  const tip = pitchRadius + tipHeight
  const step = (2 * Math.PI) / teeth
  const pt = (r: number, a: number) => `${f(r * Math.cos(a))},${f(r * Math.sin(a))}`
  let d = ''
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    d += `${i === 0 ? 'M' : 'L'}${pt(root, a - step / 2)} L${pt(tip, a - step / 5)} L${pt(tip, a + step / 5)} `
  }
  return `${d}Z`
}

/** Pitch radius of a sprocket with `teeth` teeth for a given chain pitch. */
export function pitchRadius(teeth: number, chainPitch: number) {
  return (teeth * chainPitch) / (2 * Math.PI)
}

/** Point on a circle; angle in degrees, clockwise from the +x axis (SVG convention). */
export function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}
