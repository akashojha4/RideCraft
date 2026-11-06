import { useMotionValue, useMotionValueEvent, useReducedMotion, type MotionValue } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { ROAD_HALF, type SignalColour, type Surface, type WorldPose } from '@/lib/simulation/cockpitWorld'
import { CENTRE_LINE, FAR, FOCAL, HEAD_ROLL, HORIZON, LEFT_EDGE, NEAR, RIGHT_EDGE, VIEW_H, VIEW_W, hash, project, projectRoad, repeating, roadPoint, scaleAt, visibleLength } from './roadGeometry'

/*
 * The road ahead from the rider's eye (geometry in roadGeometry.ts). Lane markings and
 * roadside objects stream towards the rider at road speed; in a bend the road curves away,
 * the hills slide across as the heading changes and the view rolls with the lean. Standing
 * still, nothing moves — except a slight vibration when the engine idles.
 *
 * Without `motion` it is the same scene, stationary.
 */

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
}

/** How far beyond its stop line the signal head stands, m. */
const SIGNAL_BEYOND = 4

const LIGHT_CLASS: Record<SignalColour, string> = { red: 'fill-danger-400', amber: 'fill-caution-400', green: 'fill-ok-400' }

function Signal({ gap, colour, curvature }: { gap: number; colour: SignalColour; curvature: number }) {
  const p = projectRoad(gap, LEFT_EDGE - 0.8, curvature)
  if (!p) return null
  const s = scaleAt(roadPoint(gap, LEFT_EDGE - 0.8, curvature).forward)
  const h = 3.2 * s
  const lamps: SignalColour[] = ['red', 'amber', 'green']
  return (
    <g data-signal={colour}>
      <rect x={p.x - 0.06 * s} y={p.y - h} width={0.12 * s} height={h} className="fill-ink-subtle" />
      <rect x={p.x - 0.22 * s} y={p.y - h - 0.95 * s} width={0.44 * s} height={1.05 * s} rx={0.08 * s} className="fill-bg stroke-line-strong" strokeWidth={Math.max(0.5, 0.03 * s)} />
      {lamps.map((c, i) => (
        <circle key={c} cx={p.x} cy={p.y - h - 0.78 * s + i * 0.32 * s} r={0.12 * s} className={c === colour ? LIGHT_CLASS[c] : 'fill-surface-overlay'} />
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
function PoseRoad({ pose, surfaceClass }: { pose: WorldPose; surfaceClass: string }) {
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
      {road && <polygon data-road-pose points={road} className={surfaceClass} />}
      {edges.map((l, i) => l && <line key={i} {...l} strokeWidth={3} className="stroke-ink-subtle" />)}
      <g className="fill-ink-muted">
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

type Thing = { d: number; kind: 'post' | 'tree' | 'sign' | 'car'; x: number; seed: number; at?: { forward: number; side: number } }
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
  if (t.kind === 'car') {
    const w = 1.8 * s
    const h = 1.35 * s
    return (
      <g data-car>
        <rect x={p.x - w / 2} y={p.y - h} width={w} height={h} rx={0.18 * s} className="fill-surface-overlay stroke-line-strong" strokeWidth={Math.max(0.5, 0.03 * s)} />
        <rect x={p.x - w * 0.36} y={p.y - h * 0.92} width={w * 0.72} height={h * 0.34} rx={0.08 * s} className="fill-surface-sunken" />
        <rect x={p.x - w * 0.47} y={p.y - h * 0.48} width={w * 0.16} height={h * 0.12} className="fill-danger-400" />
        <rect x={p.x + w * 0.31} y={p.y - h * 0.48} width={w * 0.16} height={h * 0.12} className="fill-danger-400" />
        <rect x={p.x - w * 0.5} y={p.y - h * 0.05} width={w} height={h * 0.1} className="fill-bg" />
      </g>
    )
  }
  if (t.kind === 'tree') {
    const h = (4 + t.seed * 3) * s
    return (
      <g>
        <rect x={p.x - 0.12 * s} y={p.y - h * 0.35} width={0.24 * s} height={h * 0.35} className="fill-ink-subtle" />
        <ellipse cx={p.x} cy={p.y - h * 0.62} rx={h * 0.24} ry={h * 0.36} className="fill-surface-overlay" />
      </g>
    )
  }
  if (t.kind === 'sign') {
    const h = 2.2 * s
    return (
      <g>
        <rect x={p.x - 0.05 * s} y={p.y - h} width={0.1 * s} height={h} className="fill-ink-subtle" />
        <circle cx={p.x} cy={p.y - h} r={0.38 * s} className="fill-bg stroke-danger-400" strokeWidth={Math.max(0.6, 0.08 * s)} />
      </g>
    )
  }
  const h = 1 * s
  return <rect x={p.x - 0.06 * s} y={p.y - h} width={Math.max(1, 0.12 * s)} height={h} rx={0.03 * s} className="fill-ink-muted" />
}

export function RoadAhead({
  motion,
  curvature = 0,
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
  const read = () => ({ d: motion?.distance.get() ?? 0, psi: motion?.heading.get() ?? 0, t: motion?.time.get() ?? 0, gap: motion?.carGap?.get() ?? null, pose: motion?.pose?.get() ?? null })
  const [frame, setFrame] = useState(read)
  const still = useMotionValue(0)
  useMotionValueEvent(motion?.time ?? still, 'change', () => setFrame(read()))

  const { d, t, gap, pose } = frame
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
    return { d: at, kind, x: side < 0 ? LEFT_EDGE - off : RIGHT_EDGE + off, seed: hash(index + 3) }
  })
  if (gap != null && gap > NEAR * 0.6) things.push({ d: gap, kind: 'car', x: 0, seed: 0 })
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
  const badge = [grade > 0 ? `${Math.round(grade * 100)} % uphill` : grade < 0 ? `${Math.round(-grade * 100)} % downhill` : null, surface === 'wet' ? 'wet road' : surface === 'gravel' ? 'loose gravel' : null].filter(Boolean).join(' · ')

  // Over the speed breaker the rider's eye rises and falls with it (exaggerated so it reads).
  const onBump = scene.bump && bumpGap != null && bumpGap <= 0 && -bumpGap <= scene.bump.length ? Math.sin((Math.PI * -bumpGap) / scene.bump.length) : 0
  const shake = { x: idling && !reduce ? Math.sin(t * 157) * 0.9 : 0, y: (idling && !reduce ? Math.sin(t * 211) * 0.7 : 0) + (reduce ? 0 : onBump * 14) }
  const roll = -(pose ? pose.lean : lean) * HEAD_ROLL

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice" className={cn('h-full w-full', className)} role="img" aria-label="The road ahead from the rider's seat." data-distance={d.toFixed(2)} data-heading={psi.toFixed(4)} data-car-gap={gap?.toFixed(2)} data-pose={pose ? `${pose.x.toFixed(2)},${pose.y.toFixed(2)}` : undefined}>
      <defs>
        <linearGradient id="cockpit-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-surface-sunken)" />
          <stop offset="1" stopColor="var(--color-surface-raised)" />
        </linearGradient>
      </defs>
      <g data-road-scene transform={`translate(${shake.x.toFixed(2)} ${shake.y.toFixed(2)}) rotate(${roll.toFixed(2)} ${VIEW_W / 2} ${VIEW_H})`}>
        <rect x={-600} y={-600} width={VIEW_W + 1200} height={HORIZON + 600} fill="url(#cockpit-sky)" />
        <g transform={`translate(0 ${(FOCAL * grade).toFixed(1)})`}>
          <path data-hills d={hills(psi * FOCAL)} className="fill-surface-overlay" />
        </g>
        <rect x={-600} y={HORIZON} width={VIEW_W + 1200} height={VIEW_H + 600} className="fill-surface" />
        {pose ? (
          <PoseRoad pose={pose} surfaceClass="fill-surface-sunken" />
        ) : (
          <>
            <polygon data-road data-surface={surface} data-grade={grade.toFixed(3)} points={`${pts(left)} ${pts([...right].reverse())}`} className={surface === 'gravel' ? 'fill-surface-overlay' : 'fill-surface-sunken'} />
            {sheen.map(({ p, s: k }, i) => (
              <ellipse key={`w${i}`} cx={p.x} cy={p.y} rx={0.7 * k} ry={0.07 * k} className="fill-coolant-400/15" />
            ))}
            {grains.map((p, i) => (
              <circle key={`g${i}`} cx={p.x} cy={p.y} r={Math.max(0.6, (p.y - HORIZON) / 90)} className="fill-ink-subtle" />
            ))}
            <polyline points={pts(left)} fill="none" strokeWidth={3} className="stroke-ink-subtle" />
            <polyline points={pts(right)} fill="none" strokeWidth={3} className="stroke-ink-subtle" />
            <g data-dashes className="fill-ink-muted">
              {dashes.map((p, i) => (
                <path key={i} d={p} />
              ))}
            </g>
            {stopLine && <path data-stop-line d={stopLine} className="fill-ink" />}
            {bump && <path data-bump d={bump} className="fill-caution-400/70 stroke-caution-400" strokeWidth={1} />}
            {/* The signal head stands a few metres beyond its stop line, so it stays in view while waiting at the line. */}
            {sigGap != null && sigGap + SIGNAL_BEYOND > NEAR && scene.signal && <Signal gap={sigGap + SIGNAL_BEYOND} colour={scene.signal.colour} curvature={curvature} />}
            {things.map((th, i) => (
              <Object3D key={`${th.kind}-${i}`} t={th} curvature={curvature} />
            ))}
          </>
        )}
        <line x1={-600} y1={HORIZON} x2={VIEW_W + 600} y2={HORIZON} strokeWidth={1} className="stroke-line" />
      </g>
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
