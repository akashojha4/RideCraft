import { G } from '@/lib/mechanics/braking'
import { deg } from '@/lib/mechanics/cornering'

/*
 * Paths for top-view handling animations, built like a turtle drawing from straights and
 * arcs, in metres (x east, y north). Heading 0 is north; positive turns are clockwise
 * (right). Each sample knows its curvature, so the lean at any speed follows directly from
 * tan(lean) = v²·κ / g — the same physics as the rest of the module.
 */

export type Segment = { type: 'straight'; length: number; tag?: string } | { type: 'arc'; radius: number; angle: number; tag?: string }

export interface PathSample {
  x: number
  y: number
  /** Degrees clockwise from north. */
  heading: number
  /** 1/m, positive turning right. */
  curvature: number
  /** Distance along the path, m. */
  s: number
  tag?: string
}

export function buildPath(start: { x: number; y: number; heading: number }, segments: Segment[], step = 0.2): PathSample[] {
  let { x, y } = start
  let h = (start.heading * Math.PI) / 180
  let s = 0
  const out: PathSample[] = [{ x, y, heading: start.heading, curvature: 0, s, tag: segments[0]?.tag }]
  for (const seg of segments) {
    const length = seg.type === 'straight' ? seg.length : (Math.abs(seg.angle) * Math.PI * seg.radius) / 180
    const k = seg.type === 'straight' ? 0 : Math.sign(seg.angle) / seg.radius
    const n = Math.max(1, Math.ceil(length / step))
    const ds = length / n
    for (let i = 0; i < n; i++) {
      h += (k * ds) / 2
      x += Math.sin(h) * ds
      y += Math.cos(h) * ds
      h += (k * ds) / 2
      s += ds
      out.push({ x, y, heading: deg(h), curvature: k, s, tag: seg.tag })
    }
  }
  return out
}

export interface TimedSample extends PathSample {
  t: number
  /** Speed, m/s. */
  v: number
  /** Lean, deg (positive right), following the curvature with a short lag as a real motorcycle rolls in. */
  lean: number
}

const ROLL_TAU = 0.25

/**
 * Time-stamps a path from a speed profile. `speedAt` gives the speed (m/s) at each sample;
 * `waits` holds the motorcycle still at a given distance for some seconds.
 */
export function timeline(path: PathSample[], speedAt: (p: PathSample) => number, waits: { s: number; seconds: number }[] = []): TimedSample[] {
  const out: TimedSample[] = []
  let t = 0
  let lean = 0
  const pending = [...waits].sort((a, b) => a.s - b.s)
  for (let i = 0; i < path.length; i++) {
    const p = path[i]
    const v = Math.max(0.3, speedAt(p))
    if (i > 0) {
      const dt = (p.s - path[i - 1].s) / v
      t += dt
      const target = deg(Math.atan((v * v * p.curvature) / G))
      lean += (target - lean) * Math.min(1, dt / ROLL_TAU)
    }
    out.push({ ...p, t, v, lean })
    while (pending.length && pending[0].s <= p.s) {
      const w = pending.shift()!
      t += w.seconds
      out.push({ ...p, t, v: 0, lean })
    }
  }
  return out
}

/** The (interpolated) sample at time t. */
export function sampleAt(samples: TimedSample[], t: number): TimedSample {
  if (t <= samples[0].t) return samples[0]
  const last = samples[samples.length - 1]
  if (t >= last.t) return last
  let lo = 0
  let hi = samples.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (samples[mid].t <= t) lo = mid
    else hi = mid
  }
  const a = samples[lo]
  const b = samples[hi]
  const f = b.t > a.t ? (t - a.t) / (b.t - a.t) : 0
  let dh = b.heading - a.heading
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  return { ...a, x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, heading: a.heading + dh * f, v: a.v + (b.v - a.v) * f, lean: a.lean + (b.lean - a.lean) * f }
}

/** SVG path data for a list of points through a world→screen mapping. */
export const toPathD = (pts: { x: number; y: number }[], map: (p: { x: number; y: number }) => { x: number; y: number }) =>
  pts.map((p, i) => {
    const q = map(p)
    return `${i ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`
  }).join(' ')
