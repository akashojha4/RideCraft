import { useMotionValue, useMotionValueEvent, useReducedMotion, type MotionValue } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { ROAD_HALF, type SignalColour, type Surface, type WorldPose } from '@/lib/simulation/cockpitWorld'
import { CENTRE_LINE, FAR, FOCAL, HEAD_ROLL, HORIZON, LANE, LEFT_EDGE, NEAR, RIGHT_EDGE, VIEW_H, VIEW_W, hash, project, projectRoad, repeating, roadPoint, scaleAt, visibleLength } from './roadGeometry'

/*
 * The road ahead from the rider's eye (geometry in roadGeometry.ts). Lane markings and
 * roadside objects stream towards the rider at road speed; in a bend the road curves away,
 * the hills slide across as the heading changes and the view rolls with the lean. Standing
 * still, nothing moves — except a slight vibration when the engine idles.
 *
 * Without `motion` it is the same scene, stationary.
 */

export interface RoadTraffic {
  behindGap: number | null
  oncomingGap: number | null
  personGap: number | null
  personX: number
  personKind: 'person' | 'dog'
  crossGap: number | null
  crossX: number | null
  carX: number
  carKind: 'car' | 'truck' | 'tractor'
}

export interface RoadMotion {
  /** Distance ridden, m. */
  distance: MotionValue<number>
  /** Heading turned since the start, rad (positive = right). */
  heading: MotionValue<number>
  /** Simulation time, s — every change redraws the scene. */
  time: MotionValue<number>
  /** Gap to a car ahead in the rider's lane, m, if there is one. */
  carGap?: MotionValue<number | null>
  /** Position and heading on the road, for a scenario that steers: the road is then drawn from there. */
  pose?: MotionValue<WorldPose | null>
  /** Other road users the world is tracking. */
  traffic?: MotionValue<RoadTraffic>
}

/** What else a scenario puts on the road: its gradient and surface, a traffic signal, a speed breaker. */
export interface RoadScene {
  /** Rise over run (positive = uphill). */
  grade?: number
  surface?: Surface
  /** A signal with its stop line `at` metres from the start, showing `colour`. */
  signal?: { at: number; colour: SignalColour }
  /** A speed breaker `at` metres from the start, `length` long. */
  bump?: { at: number; length: number }
  /** Constant lane curvature, 1/m (positive = right). Used when the caller does not pass `curvature`. */
  curvature?: number
  /** Headlight reach at night, m. */
  beam?: number
  night?: boolean
  /** A passenger is on the motorcycle. */
  pillion?: boolean
  /** A painted line in the wheel track. */
  paint?: boolean
  /** A roundabout / island kerb. */
  island?: { at: number; x: number; r?: number }
}

/** How far beyond its stop line the signal head stands, m. */
const SIGNAL_BEYOND = 4

/*
 * The world's own colours — a dusk road — kept apart from the site's greys, so the road never
 * looks like part of the page and every control drawn over it stands out.
 */
const W = {
  skyTop: '#121a30',
  skyMid: '#26334f',
  skyLow: '#5a5266',
  hillFar: '#2b3742',
  hillNear: '#26342b',
  verge: '#2c3825',
  vergeNear: '#1d2618',
  asphaltFar: '#30343c',
  asphaltNear: '#14161a',
  gravel: '#4a4237',
  line: '#d8dbe0',
  dash: '#e6e2cf',
  post: '#d5d8dc',
  reflector: '#f2994a',
  trunk: '#4a3a2b',
  leaf: ['#2f4a34', '#3a5236', '#2a4038'],
  pole: '#3a3f47',
  car: '#3d5e80',
  carDark: '#1b2532',
  oncoming: '#7a5a3a',
  truck: '#8a6d3b',
  tractor: '#8c3b2c',
  tyre: '#16181c',
  island: '#3f5233',
  kerb: '#cfd3d8',
} as const

const LIGHT_CLASS: Record<SignalColour, string> = { red: 'fill-danger-400', amber: 'fill-caution-400', green: 'fill-ok-400' }

function Signal({ gap, colour, curvature }: { gap: number; colour: SignalColour; curvature: number }) {
  const p = projectRoad(gap, LEFT_EDGE - 0.8, curvature)
  if (!p) return null
  const s = scaleAt(roadPoint(gap, LEFT_EDGE - 0.8, curvature).forward)
  const h = 3.2 * s
  const lamps: SignalColour[] = ['red', 'amber', 'green']
  return (
    <g data-signal={colour}>
      <rect x={p.x - 0.06 * s} y={p.y - h} width={0.12 * s} height={h} fill={W.pole} />
      <rect x={p.x - 0.22 * s} y={p.y - h - 0.95 * s} width={0.44 * s} height={1.05 * s} rx={0.08 * s} fill="#0c0e12" stroke={W.pole} strokeWidth={Math.max(0.5, 0.03 * s)} />
      {lamps.map((c, i) => (
        <circle key={c} cx={p.x} cy={p.y - h - 0.78 * s + i * 0.32 * s} r={0.12 * s} className={c === colour ? LIGHT_CLASS[c] : undefined} fill={c === colour ? undefined : '#22262d'} />
      ))}
    </g>
  )
}

/*
 * Drawing from a pose: road points (X along the road, Y across it from the centre line) seen from
 * the rider at (x, y) looking along `heading`. Shapes are clipped at the near limit before they
 * are projected, so the road stays whole whichever way the motorcycle faces.
 */
type Cam = { x: number; y: number; heading: number }
type CamPt = { forward: number; side: number }
const CLIP = NEAR * 0.6
const toCam = (c: Cam, X: number, Y: number): CamPt => {
  const dx = X - c.x
  const dy = Y - c.y
  const ch = Math.cos(c.heading)
  const sh = Math.sin(c.heading)
  return { forward: dx * ch + dy * sh, side: -dx * sh + dy * ch }
}
const cut = (a: CamPt, b: CamPt): CamPt => {
  const k = (CLIP - a.forward) / (b.forward - a.forward)
  return { forward: CLIP, side: a.side + (b.side - a.side) * k }
}
/** A road-plane polygon from a pose, clipped and projected (null if wholly behind). */
function posePolygon(c: Cam, corners: [number, number][]) {
  const pts = corners.map(([X, Y]) => toCam(c, X, Y))
  const out: CamPt[] = []
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length]
    const ain = a.forward >= CLIP
    const bin = b.forward >= CLIP
    if (ain) out.push(a)
    if (ain !== bin) out.push(cut(a, b))
  })
  if (out.length < 3) return null
  return out.map((p) => project(p.forward, p.side)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}
/** A road-plane line from a pose, clipped and projected. */
function poseLine(c: Cam, [X1, Y1]: [number, number], [X2, Y2]: [number, number]) {
  let a = toCam(c, X1, Y1)
  let b = toCam(c, X2, Y2)
  if (a.forward < CLIP && b.forward < CLIP) return null
  if (a.forward < CLIP) a = cut(a, b)
  if (b.forward < CLIP) b = cut(b, a)
  const p = project(a.forward, a.side)
  const q = project(b.forward, b.side)
  return { x1: p.x, y1: p.y, x2: q.x, y2: q.y }
}

/** The road, its markings and roadside things as seen from a pose. */
function PoseRoad({ pose, surfaceFill }: { pose: WorldPose; surfaceFill: string }) {
  const c: Cam = pose
  const far = 300
  const road = posePolygon(c, [
    [c.x - far, -ROAD_HALF],
    [c.x + far, -ROAD_HALF],
    [c.x + far, ROAD_HALF],
    [c.x - far, ROAD_HALF],
  ])
  const edges = [-ROAD_HALF, ROAD_HALF].map((Y) => poseLine(c, [c.x - far, Y], [c.x + far, Y]))
  const dashes: string[] = []
  for (let X = Math.floor((c.x - 120) / DASH_SPACING) * DASH_SPACING; X < c.x + 120; X += DASH_SPACING) {
    const q = posePolygon(c, [
      [X, -0.07],
      [X + DASH_LENGTH, -0.07],
      [X + DASH_LENGTH, 0.07],
      [X, 0.07],
    ])
    if (q) dashes.push(q)
  }
  const things: Thing[] = []
  for (let X = Math.floor((c.x - 150) / OBJECT_SPACING) * OBJECT_SPACING; X < c.x + 150; X += OBJECT_SPACING) {
    const index = Math.round(X / OBJECT_SPACING)
    const r = hash(index)
    const kind: Thing['kind'] = index % 9 === 0 ? 'sign' : (r * 7) % 1 < 0.45 ? 'tree' : 'post'
    const off = kind === 'post' ? 1 : kind === 'sign' ? 1.4 : 3 + hash(index + 7) * 5
    const Y = r < 0.5 ? -ROAD_HALF - off : ROAD_HALF + off
    const at = toCam(c, X, Y)
    if (at.forward > CLIP) things.push({ d: at.forward, kind, x: at.side, seed: hash(index + 3), at })
  }
  things.sort((a, b) => b.d - a.d)
  return (
    <>
      {road && <polygon data-road-pose points={road} fill={surfaceFill} />}
      {edges.map((l, i) => l && <line key={i} {...l} strokeWidth={3} stroke={W.line} strokeOpacity={0.85} />)}
      <g fill={W.dash}>
        {dashes.map((p, i) => (
          <polygon key={i} points={p} />
        ))}
      </g>
      {things.map((th, i) => (
        <Object3D key={`${th.kind}-${i}`} t={th} curvature={0} />
      ))}
    </>
  )
}

/** A band across the rider's lane between two distances (stop line, speed breaker). */
function band(a: number, b: number, curvature: number) {
  const q = [projectRoad(a, LEFT_EDGE, curvature), projectRoad(a, CENTRE_LINE, curvature), projectRoad(b, CENTRE_LINE, curvature), projectRoad(b, LEFT_EDGE, curvature)]
  if (q.some((p) => !p)) return null
  const [p1, p2, p3, p4] = q as { x: number; y: number }[]
  return `M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} L${p4.x},${p4.y} Z`
}

const DASH_SPACING = 9
const DASH_LENGTH = 3
const OBJECT_SPACING = 14
const HILL_TILE = 1600
/** Distances sampled along the road outline, near to far (closer together near the rider). */
const SAMPLES = Array.from({ length: 36 }, (_, i) => NEAR * 0.7 * Math.pow(FAR / (NEAR * 0.7), i / 35))

type Thing = { d: number; kind: 'post' | 'tree' | 'sign' | 'car' | 'truck' | 'tractor' | 'person' | 'dog' | 'oncoming' | 'cross' | 'island'; x: number; seed: number; at?: { forward: number; side: number }; unlit?: boolean; r?: number }
type Pt = { x: number; y: number }

function hills(shift: number) {
  const base = HORIZON
  const tile = (o: number) =>
    `M${o},${base} C${o + 120},${base - 40} ${o + 220},${base - 18} ${o + 330},${base - 34} S${o + 560},${base - 8} ${o + 700},${base - 40} S${o + 980},${base - 14} ${o + 1120},${base - 30} S${o + 1420},${base - 6} ${o + HILL_TILE},${base} Z`
  const o = -((((shift % HILL_TILE) + HILL_TILE) % HILL_TILE) + 400)
  return [tile(o), tile(o + HILL_TILE), tile(o + 2 * HILL_TILE)].join(' ')
}

function Object3D({ t, curvature }: { t: Thing; curvature: number }) {
  const rp = t.at ?? roadPoint(t.d, t.x, curvature)
  if (rp.forward < NEAR * 0.6) return null
  const p = project(rp.forward, rp.side)
  const s = scaleAt(rp.forward)
  if (t.kind === 'truck') {
    const w = 2.4 * s
    const h = 2.55 * s
    return (
      <g data-car="truck" data-truck opacity={t.unlit ? 0.08 : 1}>
        <rect x={p.x - w / 2} y={p.y - h} width={w} height={h} rx={0.12 * s} fill={W.truck} stroke="#0c0e12" strokeOpacity={0.6} strokeWidth={Math.max(0.5, 0.03 * s)} />
        <rect x={p.x - w * 0.38} y={p.y - h * 0.96} width={w * 0.76} height={h * 0.28} rx={0.06 * s} fill={W.carDark} />
        <rect x={p.x - w * 0.46} y={p.y - h * 0.42} width={w * 0.16} height={h * 0.1} className="fill-danger-400" />
        <rect x={p.x + w * 0.3} y={p.y - h * 0.42} width={w * 0.16} height={h * 0.1} className="fill-danger-400" />
        <rect x={p.x - w * 0.5} y={p.y - h * 0.04} width={w} height={h * 0.08} fill={W.tyre} />
      </g>
    )
  }
  if (t.kind === 'tractor') {
    const w = 1.7 * s
    const h = 2.1 * s
    return (
      <g data-car="tractor" data-tractor opacity={t.unlit ? 0.08 : 1}>
        <rect x={p.x - w * 0.38} y={p.y - h} width={w * 0.76} height={h * 0.55} rx={0.12 * s} fill={W.tractor} stroke="#0c0e12" strokeOpacity={0.6} strokeWidth={Math.max(0.5, 0.03 * s)} />
        <ellipse cx={p.x - w * 0.42} cy={p.y - h * 0.28} rx={0.28 * s} ry={0.38 * s} fill={W.tyre} />
        <ellipse cx={p.x + w * 0.42} cy={p.y - h * 0.28} rx={0.28 * s} ry={0.38 * s} fill={W.tyre} />
        <rect x={p.x - w * 0.22} y={p.y - h * 0.92} width={w * 0.44} height={h * 0.22} rx={0.04 * s} fill={W.carDark} />
      </g>
    )
  }
  if (t.kind === 'island') {
    const r = (t.r ?? 2.4) * s
    return (
      <g data-island>
        <ellipse cx={p.x} cy={p.y} rx={r} ry={r * 0.35} fill={W.island} stroke={W.kerb} strokeWidth={Math.max(0.6, 0.04 * s)} />
      </g>
    )
  }
  if (t.kind === 'car' || t.kind === 'oncoming' || t.kind === 'cross') {
    const w = 1.8 * s
    const h = 1.35 * s
    return (
      <g data-car={t.kind} data-oncoming={t.kind === 'oncoming' || undefined} opacity={t.unlit ? 0.08 : 1}>
        <rect x={p.x - w / 2} y={p.y - h} width={w} height={h} rx={0.18 * s} fill={t.kind === 'car' ? W.car : W.oncoming} stroke="#0c0e12" strokeOpacity={0.6} strokeWidth={Math.max(0.5, 0.03 * s)} />
        <rect x={p.x - w * 0.36} y={p.y - h * 0.92} width={w * 0.72} height={h * 0.34} rx={0.08 * s} fill={W.carDark} />
        <rect x={p.x - w * 0.47} y={p.y - h * 0.48} width={w * 0.16} height={h * 0.12} className={t.kind === 'oncoming' ? 'fill-caution-400' : 'fill-danger-400'} />
        <rect x={p.x + w * 0.31} y={p.y - h * 0.48} width={w * 0.16} height={h * 0.12} className={t.kind === 'oncoming' ? 'fill-caution-400' : 'fill-danger-400'} />
        <rect x={p.x - w * 0.5} y={p.y - h * 0.05} width={w} height={h * 0.1} fill={W.tyre} />
      </g>
    )
  }
  if (t.kind === 'person') {
    const h = 1.7 * s
    return (
      <g data-person opacity={t.unlit ? 0.08 : 1}>
        <circle cx={p.x} cy={p.y - h * 0.88} r={0.16 * s} className="fill-ignition-200" />
        <rect x={p.x - 0.16 * s} y={p.y - h * 0.72} width={0.32 * s} height={0.4 * s} rx={0.08 * s} className="fill-ignition-400" />
        <rect x={p.x - 0.12 * s} y={p.y - h * 0.32} width={0.1 * s} height={0.32 * s} rx={0.04 * s} className="fill-ink-muted" />
        <rect x={p.x + 0.02 * s} y={p.y - h * 0.32} width={0.1 * s} height={0.32 * s} rx={0.04 * s} className="fill-ink-muted" />
      </g>
    )
  }
  if (t.kind === 'dog') {
    const h = 0.55 * s
    return (
      <g data-dog opacity={t.unlit ? 0.08 : 1}>
        <ellipse cx={p.x} cy={p.y - h * 0.55} rx={0.38 * s} ry={0.22 * s} className="fill-caution-400" />
        <circle cx={p.x + 0.28 * s} cy={p.y - h * 0.85} r={0.16 * s} className="fill-caution-300" />
        <rect x={p.x - 0.32 * s} y={p.y - h * 0.35} width={0.08 * s} height={0.32 * s} rx={0.03 * s} className="fill-ink-muted" />
        <rect x={p.x + 0.12 * s} y={p.y - h * 0.35} width={0.08 * s} height={0.32 * s} rx={0.03 * s} className="fill-ink-muted" />
      </g>
    )
  }
  if (t.kind === 'tree') {
    const h = (4 + t.seed * 3) * s
    return (
      <g>
        <rect x={p.x - 0.12 * s} y={p.y - h * 0.35} width={0.24 * s} height={h * 0.35} fill={W.trunk} />
        <ellipse cx={p.x} cy={p.y - h * 0.62} rx={h * 0.24} ry={h * 0.36} fill={W.leaf[Math.floor(t.seed * W.leaf.length) % W.leaf.length]} />
      </g>
    )
  }
  if (t.kind === 'sign') {
    const h = 2.2 * s
    return (
      <g>
        <rect x={p.x - 0.05 * s} y={p.y - h} width={0.1 * s} height={h} fill={W.pole} />
        <circle cx={p.x} cy={p.y - h} r={0.38 * s} fill="#f4f4f2" className="stroke-danger-400" strokeWidth={Math.max(0.6, 0.08 * s)} />
      </g>
    )
  }
  const h = 1 * s
  return (
    <g>
      <rect x={p.x - 0.06 * s} y={p.y - h} width={Math.max(1, 0.12 * s)} height={h} rx={0.03 * s} fill={W.post} />
      <rect x={p.x - 0.06 * s} y={p.y - h * 0.88} width={Math.max(1, 0.12 * s)} height={h * 0.12} fill={W.reflector} />
    </g>
  )
}

export function RoadAhead({
  motion,
  curvature: given,
  lean = 0,
  idling = false,
  scene = {},
  className,
}: {
  motion?: RoadMotion
  /** 1 / radius of the bend, m⁻¹ (positive = right). */
  curvature?: number
  /** Motorcycle lean, deg (positive = right). */
  lean?: number
  /** The engine is running: a slight vibration while standing still. */
  idling?: boolean
  scene?: RoadScene
  className?: string
}) {
  const reduce = useReducedMotion()
  const curvature = given ?? scene.curvature ?? 0
  const emptyTraffic = { behindGap: null, oncomingGap: null, personGap: null, personX: 0, personKind: 'person' as const, crossGap: null, crossX: null, carX: 0, carKind: 'car' as const }
  const read = () => ({ d: motion?.distance.get() ?? 0, psi: motion?.heading.get() ?? 0, t: motion?.time.get() ?? 0, gap: motion?.carGap?.get() ?? null, pose: motion?.pose?.get() ?? null, traffic: motion?.traffic?.get() ?? emptyTraffic })
  const [frame, setFrame] = useState(read)
  const still = useMotionValue(0)
  useMotionValueEvent(motion?.time ?? still, 'change', () => setFrame(read()))

  const { d, t, gap, pose, traffic } = frame
  const psi = pose ? pose.heading : frame.psi
  const reach = visibleLength(curvature)
  const along = SAMPLES.filter((s) => s <= reach)
  const edge = (x: number) => along.map((s) => projectRoad(s, x, curvature)).filter((p): p is Pt => !!p)
  const left = edge(LEFT_EDGE)
  const right = edge(RIGHT_EDGE)
  const pts = (ps: { x: number; y: number }[]) => ps.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const dashes = repeating(d, DASH_SPACING, reach).flatMap(({ d: a }) => {
    const b = a + DASH_LENGTH
    const w = 0.07
    const q = [projectRoad(a, CENTRE_LINE - w, curvature), projectRoad(b, CENTRE_LINE - w, curvature), projectRoad(b, CENTRE_LINE + w, curvature), projectRoad(a, CENTRE_LINE + w, curvature)]
    if (q.some((p) => !p)) return []
    const [p1, p2, p3, p4] = q as Pt[]
    return [`M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} L${p4.x},${p4.y} Z`]
  })

  const things: Thing[] = repeating(d, OBJECT_SPACING, reach).map(({ d: at, index }) => {
    const r = hash(index)
    const side = r < 0.5 ? -1 : 1
    const kind: Thing['kind'] = index % 9 === 0 ? 'sign' : r * 7 % 1 < 0.45 ? 'tree' : 'post'
    const off = kind === 'post' ? 1 : kind === 'sign' ? 1.4 : 3 + hash(index + 7) * 5
    return { d: at, kind, x: side < 0 ? LEFT_EDGE - off : RIGHT_EDGE + off, seed: hash(index + 3), unlit: scene.beam != null && at > scene.beam }
  })
  const beam = scene.beam
  const night = scene.night || beam != null
  const lit = (at: number) => beam == null || at <= beam
  if (gap != null && gap > NEAR * 0.6) things.push({ d: gap, kind: traffic.carKind, x: traffic.carX, seed: 0, unlit: !lit(gap) })
  if (scene.island) {
    const islandGap = scene.island.at - d
    if (islandGap > NEAR * 0.6) things.push({ d: islandGap, kind: 'island', x: scene.island.x, seed: 0, r: scene.island.r, unlit: !lit(islandGap) })
  }
  if (traffic.personGap != null && traffic.personGap > NEAR * 0.6) things.push({ d: traffic.personGap, kind: traffic.personKind === 'dog' ? 'dog' : 'person', x: traffic.personX, seed: 0, unlit: !lit(traffic.personGap) })
  if (traffic.oncomingGap != null && traffic.oncomingGap > NEAR * 0.6) things.push({ d: traffic.oncomingGap, kind: 'oncoming', x: LANE, seed: 0, unlit: !lit(traffic.oncomingGap) })
  if (traffic.crossGap != null && traffic.crossGap > NEAR * 0.4 && traffic.crossX != null) things.push({ d: traffic.crossGap, kind: 'cross', x: traffic.crossX, seed: 0, unlit: !lit(traffic.crossGap) })
  things.sort((a, b) => roadPoint(b.d, b.x, curvature).forward - roadPoint(a.d, a.x, curvature).forward)

  // On a gradient the rider looks along the slope, so the level horizon (hills) sits FOCAL·grade
  // below the road's vanishing point uphill (hidden behind the slope) and above it downhill.
  const grade = scene.grade ?? 0
  const surface = scene.surface ?? 'dry'
  const sigGap = scene.signal ? scene.signal.at - d : null
  const stopLine = sigGap != null && sigGap > NEAR * 0.6 ? band(sigGap, sigGap + 0.35, curvature) : null
  const bumpGap = scene.bump ? scene.bump.at - d : null
  const bump = scene.bump && bumpGap != null && bumpGap + scene.bump.length > NEAR * 0.6 ? band(Math.max(bumpGap, NEAR * 0.6), bumpGap + scene.bump.length, curvature) : null
  const grains = surface === 'gravel' ? repeating(d, 1.3, 60).flatMap(({ d: at, index }) => [0, 1, 2].map((k) => projectRoad(at, LEFT_EDGE + hash(index * 3 + k) * (RIGHT_EDGE - LEFT_EDGE), curvature))).filter((p): p is Pt => !!p) : []
  const sheen = surface === 'wet' ? repeating(d, 6, 120).map(({ d: at, index }) => ({ p: projectRoad(at, LEFT_EDGE + 0.6 + hash(index) * 2.4, curvature), s: scaleAt(at) })).filter((g): g is { p: Pt; s: number } => !!g.p) : []

  // The slope itself can't be seen from the saddle (the road rises with the rider), so it is named.
  const paintBand = scene.paint
    ? along.flatMap((at, i) => {
        if (i === 0) return []
        const a = along[i - 1]
        const q = [projectRoad(a, -0.22, curvature), projectRoad(at, -0.22, curvature), projectRoad(at, 0.22, curvature), projectRoad(a, 0.22, curvature)]
        if (q.some((p) => !p)) return []
        const [p1, p2, p3, p4] = q as Pt[]
        return [`M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} L${p4.x},${p4.y} Z`]
      })
    : []
  const badge = [grade > 0 ? `${Math.round(grade * 100)} % uphill` : grade < 0 ? `${Math.round(-grade * 100)} % downhill` : null, surface === 'wet' ? 'wet road' : surface === 'gravel' ? 'loose gravel' : null, night ? 'night' : null, Math.abs(curvature) > 1e-4 ? (scene.island ? 'roundabout' : 'bend') : null, scene.paint ? 'painted line' : null].filter(Boolean).join(' · ')

  // Over the speed breaker the rider's eye rises and falls with it (exaggerated so it reads).
  const onBump = scene.bump && bumpGap != null && bumpGap <= 0 && -bumpGap <= scene.bump.length ? Math.sin((Math.PI * -bumpGap) / scene.bump.length) : 0
  // Idling at a standstill the whole machine trembles a little with the engine's beat.
  const idle = idling && !reduce
  const shake = { x: idle ? Math.sin(t * 157) * 1.6 + Math.sin(t * 71) * 0.5 : 0, y: (idle ? Math.sin(t * 211) * 1.3 : 0) + (reduce ? 0 : onBump * 14) }
  const bikeShake = idle ? { x: Math.sin(t * 163 + 1) * 1.1, y: Math.sin(t * 197) * 1.4 } : { x: 0, y: reduce ? 0 : onBump * 6 }
  const roll = -(pose ? pose.lean : lean) * HEAD_ROLL

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice" className={cn('h-full w-full', className)} role="img" aria-label="The road ahead from the rider's seat." data-distance={d.toFixed(2)} data-heading={psi.toFixed(4)} data-car-gap={gap?.toFixed(2)} data-person={traffic.personGap?.toFixed(2)} data-oncoming={traffic.oncomingGap?.toFixed(2)} data-behind={traffic.behindGap?.toFixed(2)} data-pose={pose ? `${pose.x.toFixed(2)},${pose.y.toFixed(2)}` : undefined}>
      <defs>
        <linearGradient id="cockpit-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={W.skyTop} />
          <stop offset="0.62" stopColor={W.skyMid} />
          <stop offset="1" stopColor={W.skyLow} />
        </linearGradient>
        <linearGradient id="cockpit-verge" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={HORIZON} y2={VIEW_H}>
          <stop offset="0" stopColor={W.verge} />
          <stop offset="1" stopColor={W.vergeNear} />
        </linearGradient>
        {/* Asphalt: lighter far away where it catches the sky, darker under the wheel. */}
        <linearGradient id="cockpit-asphalt" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={HORIZON} y2={VIEW_H}>
          <stop offset="0" stopColor={W.asphaltFar} />
          <stop offset="0.35" stopColor="#202329" />
          <stop offset="1" stopColor={W.asphaltNear} />
        </linearGradient>
        <linearGradient id="cockpit-gravel" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={HORIZON} y2={VIEW_H}>
          <stop offset="0" stopColor="#5a5144" />
          <stop offset="1" stopColor={W.gravel} />
        </linearGradient>
        {/* The top of the view darkens a little, like the edge of a helmet visor. */}
        <linearGradient id="cockpit-visor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#05070b" stopOpacity="0.55" />
          <stop offset="0.22" stopColor="#05070b" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cockpit-tank" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2a2f38" />
          <stop offset="1" stopColor="#0b0d11" />
        </linearGradient>
      </defs>
      <g data-road-scene transform={`translate(${shake.x.toFixed(2)} ${shake.y.toFixed(2)}) rotate(${roll.toFixed(2)} ${VIEW_W / 2} ${VIEW_H})`}>
        <rect x={-600} y={-600} width={VIEW_W + 1200} height={HORIZON + 600} fill={night ? 'var(--color-bg)' : 'url(#cockpit-sky)'} opacity={night ? 0.92 : 1} />
        <g transform={`translate(0 ${(FOCAL * grade).toFixed(1)})`} opacity={night ? 0.35 : 1}>
          <path d={hills(psi * FOCAL * 0.6 + 700)} fill={W.hillFar} transform="translate(0 -14)" />
          <path data-hills d={hills(psi * FOCAL)} fill={W.hillNear} />
        </g>
        <rect x={-600} y={HORIZON} width={VIEW_W + 1200} height={VIEW_H + 600} fill="url(#cockpit-verge)" />
        {pose ? (
          <PoseRoad pose={pose} surfaceFill="url(#cockpit-asphalt)" />
        ) : (
          <>
            <polygon data-road data-surface={surface} data-grade={grade.toFixed(3)} points={`${pts(left)} ${pts([...right].reverse())}`} fill={surface === 'gravel' ? 'url(#cockpit-gravel)' : 'url(#cockpit-asphalt)'} />
            {sheen.map(({ p, s: k }, i) => (
              <ellipse key={`w${i}`} cx={p.x} cy={p.y} rx={0.7 * k} ry={0.07 * k} className="fill-coolant-400/15" />
            ))}
            {grains.map((p, i) => (
              <circle key={`g${i}`} cx={p.x} cy={p.y} r={Math.max(0.6, (p.y - HORIZON) / 90)} fill="#8a7d68" />
            ))}
            <polyline points={pts(left)} fill="none" strokeWidth={3} stroke={W.line} strokeOpacity={0.85} />
            <polyline points={pts(right)} fill="none" strokeWidth={3} stroke={W.line} strokeOpacity={0.85} />
            <g data-dashes fill={W.dash}>
              {dashes.map((p, i) => (
                <path key={i} d={p} />
              ))}
            </g>
            {paintBand.length > 0 && (
              <g data-paint className="fill-coolant-200/50">
                {paintBand.map((p, i) => (
                  <path key={`p${i}`} d={p} />
                ))}
              </g>
            )}
            {stopLine && <path data-stop-line d={stopLine} className="fill-ink" />}
            {bump && <path data-bump d={bump} className="fill-caution-400/70 stroke-caution-400" strokeWidth={1} />}
            {/* The signal head stands a few metres beyond its stop line, so it stays in view while waiting at the line. */}
            {sigGap != null && sigGap + SIGNAL_BEYOND > NEAR && scene.signal && <Signal gap={sigGap + SIGNAL_BEYOND} colour={scene.signal.colour} curvature={curvature} />}
            {things.map((th, i) => (
              <Object3D key={`${th.kind}-${i}`} t={th} curvature={curvature} />
            ))}
          </>
        )}
        {night && (
          <g data-night pointerEvents="none">
            <rect x={-600} y={HORIZON} width={VIEW_W + 1200} height={VIEW_H + 600} className="fill-bg" opacity={0.28} />
            {beam != null && <polygon points={`${VIEW_W / 2},${VIEW_H * 0.78} ${VIEW_W / 2 - 220},${HORIZON} ${VIEW_W / 2 + 220},${HORIZON}`} className="fill-caution-400" opacity={0.1} />}
          </g>
        )}
      </g>
      {/* The motorcycle under the rider: handlebar across the top, tank and fork tops at the bottom. Faint, so the road reads first. */}
      <g data-bike pointerEvents="none" transform={`translate(${bikeShake.x.toFixed(2)} ${bikeShake.y.toFixed(2)})`}>
        <rect x={-600} y={-600} width={VIEW_W + 1200} height={VIEW_H + 600} fill="url(#cockpit-visor)" />
        <g data-handlebar opacity={0.55}>
          <path d={`M-40,124 C120,116 250,92 ${VIEW_W / 2 - 40},84 L${VIEW_W / 2 + 40},84 C550,92 680,116 ${VIEW_W + 40},124`} fill="none" stroke="#07090c" strokeWidth={9} strokeLinecap="round" />
          <path d={`M-40,120.5 C120,112.5 250,88.5 ${VIEW_W / 2 - 40},80.5 M${VIEW_W / 2 + 40},80.5 C550,88.5 680,112.5 ${VIEW_W + 40},120.5`} fill="none" stroke="#8b95a3" strokeOpacity={0.35} strokeWidth={1.2} />
          <rect x={VIEW_W / 2 - 30} y={73} width={60} height={22} rx={7} fill="#0a0c10" stroke="#8b95a3" strokeOpacity={0.3} />
        </g>
        <g data-tank opacity={0.92}>
          <path
            d={`M${VIEW_W / 2 - 250},${VIEW_H + 4} C${VIEW_W / 2 - 230},${VIEW_H - 46} ${VIEW_W / 2 - 150},${VIEW_H - 70} ${VIEW_W / 2},${VIEW_H - 72} C${VIEW_W / 2 + 150},${VIEW_H - 70} ${VIEW_W / 2 + 230},${VIEW_H - 46} ${VIEW_W / 2 + 250},${VIEW_H + 4} Z`}
            fill="url(#cockpit-tank)"
          />
          <path d={`M${VIEW_W / 2 - 236},${VIEW_H - 18} C${VIEW_W / 2 - 200},${VIEW_H - 54} ${VIEW_W / 2 - 120},${VIEW_H - 68} ${VIEW_W / 2},${VIEW_H - 69} C${VIEW_W / 2 + 120},${VIEW_H - 68} ${VIEW_W / 2 + 200},${VIEW_H - 54} ${VIEW_W / 2 + 236},${VIEW_H - 18}`} fill="none" stroke="#9aa4b2" strokeOpacity={0.28} strokeWidth={1.5} />
        </g>
      </g>
      {scene.pillion && (
        <g data-pillion transform={`translate(${VIEW_W / 2 + 36}, ${VIEW_H - 58})`}>
          <ellipse cx="0" cy="18" rx="16" ry="10" className="fill-ignition-400" />
          <circle cx="0" cy="0" r="14" className="fill-ignition-200 stroke-line-strong" />
          <path d="M-10,-2 Q0,8 10,-2" fill="none" className="stroke-ink-muted" strokeWidth="2" />
        </g>
      )}
      {traffic.behindGap != null && (
        <g data-mirror transform="translate(340, 10)">
          <rect width="120" height="52" rx="10" className="fill-bg/85 stroke-line-strong" />
          <text x="60" y="12" textAnchor="middle" className="fill-ink-subtle font-mono text-[9px]">
            mirror
          </text>
          {traffic.behindGap > 0.5 && traffic.behindGap < 80 && (
            <rect
              data-behind
              x={60 - Math.min(28, 220 / traffic.behindGap)}
              y={18}
              width={Math.min(56, 440 / traffic.behindGap)}
              height={Math.min(28, 200 / traffic.behindGap)}
              rx="3"
              className="fill-surface-overlay stroke-danger-400"
            />
          )}
        </g>
      )}
      {badge && (
        <g data-road-badge>
          <rect x={VIEW_W / 2 - badge.length * 4.4 - 14} y={14} width={badge.length * 8.8 + 28} height={26} rx={13} className="fill-bg/80 stroke-line" />
          <text x={VIEW_W / 2} y={31.5} textAnchor="middle" className="fill-ink font-mono text-[13px]">
            {badge}
          </text>
        </g>
      )}
    </svg>
  )
}
