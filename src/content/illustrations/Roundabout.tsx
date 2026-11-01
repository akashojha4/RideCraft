import { useMemo, useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { buildPath, sampleAt, timeline, toPathD, type PathSample, type TimedSample } from '@/components/handling/path'
import { TopBike, TopCar } from '@/components/handling/TopBike'
import { useLoopTime } from '@/components/handling/useLoopTime'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { cn } from '@/lib/cn'
import { deg, leanFor, ms } from '@/lib/mechanics/cornering'

/*
 * Handling lesson 7: a single-lane roundabout, from above, entered from the south.
 *
 * Geometry (keep-left; keep-right is the mirror image): the approach lane is 1.75 m left of
 * the road's centre; the entry curve (radius 8 m, turning left) is tangent to the
 * circulating path (radius 10 m, clockwise round a 7 m island), and each exit curve is the
 * mirror of the entry. Traffic already on the roundabout has priority, so the rider gives
 * way to the car coming from the right, then joins. Signals follow the usual rule: signal
 * the way you will leave on approach (none for straight on), and signal to leave once you
 * pass the exit before yours.
 */

type Side = 'left' | 'right'
const ISLAND = 7
const RING = 10
const RING_EDGE = 13
const ENTRY_R = 8
const LANE_X = -1.75
const START = 32
const EXIT_LEN = 22
const K = 5.1
const C = 170
const V_APPROACH = ms(30)
const V_RING = ms(20)
const WAIT = 2.2
const EXITS = [
  { n: 1, label: '1st exit', arm: 270 },
  { n: 2, label: '2nd exit · straight on', arm: 360 },
  { n: 3, label: '3rd exit', arm: 450 },
  { n: 4, label: 'Full circle (U-turn)', arm: 540 },
] as const

const bearing = (x: number, y: number) => (deg(Math.atan2(x, y)) + 360) % 360

// Entry-curve geometry (keep-left), from tangency between the entry curve and the ring path.
const CE = { x: LANE_X - ENTRY_R, y: -Math.sqrt((ENTRY_R + RING) ** 2 - (LANE_X - ENTRY_R) ** 2) }
const T = { x: (CE.x * RING) / (ENTRY_R + RING), y: (CE.y * RING) / (ENTRY_R + RING) }
const ENTRY_ANGLE = 90 - bearing(T.x - CE.x, T.y - CE.y)
const T_BEARING = bearing(T.x, T.y)

function buildRoute(exitArm: number, side: Side) {
  const xBearing = 360 - T_BEARING + (exitArm - 180)
  const ringAngle = (((xBearing - T_BEARING) % 360) + 360) % 360
  const path = buildPath({ x: LANE_X, y: -START, heading: 0 }, [
    { type: 'straight', length: START + CE.y, tag: 'approach' },
    { type: 'arc', radius: ENTRY_R, angle: -ENTRY_ANGLE, tag: 'enter' },
    { type: 'arc', radius: RING, angle: ringAngle, tag: 'ring' },
    { type: 'arc', radius: ENTRY_R, angle: -ENTRY_ANGLE, tag: 'leave' },
    { type: 'straight', length: EXIT_LEN, tag: 'leave' },
  ])
  const mirrored = side === 'left' ? path : path.map((p) => ({ ...p, x: -p.x, heading: -p.heading, curvature: -p.curvature }))
  const stopAt = START + CE.y - 1.5
  const speed = (p: PathSample) => {
    if (p.s <= stopAt) return Math.max(0.5, Math.min(V_APPROACH, Math.sqrt(2 * 2 * Math.max(0, stopAt - p.s)) + 0.5))
    if (p.tag === 'leave') return Math.min(V_APPROACH, V_RING + 0.08 * (p.s - stopAt))
    return Math.min(V_RING, 0.5 + Math.sqrt(2 * 1.5 * (p.s - stopAt)))
  }
  const samples = timeline(mirrored, speed, [{ s: stopAt, seconds: WAIT }])
  const waitT = samples.find((p) => p.s >= stopAt)!.t
  return { samples, waitT, ringAngle }
}

/** Unwrapped bearing round the island travelled since joining (deg). */
function progressRound(p: TimedSample, side: Side) {
  const b = bearing(p.x * (side === 'left' ? 1 : -1), p.y)
  const r = (b - T_BEARING + 360) % 360
  return r > 350 ? r - 360 : r
}

export default function Roundabout() {
  const [side, setSide] = useState<Side>('left')
  const [exitN, setExitN] = useState<1 | 2 | 3 | 4>(2)
  const exit = EXITS[exitN - 1]
  const { samples, waitT, ringAngle } = useMemo(() => buildRoute(exit.arm, side), [exit.arm, side])
  const total = samples[samples.length - 1].t
  const { clock, t } = useLoopTime(total)
  const now = sampleAt(samples, t)
  const m = side === 'left' ? 1 : -1
  const map = (p: { x: number; y: number }) => ({ x: C + p.x * K, y: C - p.y * K })

  // Signals: the way you will leave on approach (none for straight on); the exit side once past the exit before yours.
  const leaveSide = side // leaving is a turn towards the kerb side
  const turnSide: Side = side === 'left' ? 'right' : 'left'
  const round = now.tag === 'ring' ? progressRound(now, side) : now.tag === 'leave' ? 999 : -1
  const prevExitAt = exit.n === 1 ? -1 : (exit.arm - 90 - T_BEARING + 360) % 360
  const passedPrevious = round > prevExitAt + 4
  const indicator: Side | null = now.tag === 'leave' && now.s > samples[samples.length - 1].s - EXIT_LEN + 4 ? null : passedPrevious || exit.n === 1 ? leaveSide : exit.n >= 3 ? turnSide : null
  const blink = Math.floor(t * 2.6) % 2 === 0

  // The circulating car passes the entry while the rider waits.
  const carSpeed = V_RING
  const carBearing = T_BEARING + deg(carSpeed / RING) * (t - (waitT + 1))
  const car = { x: m * RING * Math.sin((carBearing * Math.PI) / 180), y: RING * Math.cos((carBearing * Math.PI) / 180) }
  const carHeading = m * (carBearing + 90)

  const stage =
    now.tag === 'approach'
      ? t < waitT - 0.05
        ? 'approach'
        : t < waitT + WAIT
          ? 'giveway'
          : 'join'
      : now.tag === 'enter'
        ? 'join'
        : now.tag === 'ring'
          ? passedPrevious || exit.n === 1
            ? 'signal-out'
            : 'circulate'
          : 'leave'
  const left = side === 'left'
  const text = {
    approach: `Approach at a steady speed, slowing in good time. ${exit.n === 1 ? `Signal ${leaveSide} — you’re taking the first exit.` : exit.n === 2 ? 'Going straight on: no signal yet.' : `Signal ${turnSide} — you’re going past the straight-on exit.`} Look ${left ? 'right' : 'left'}: traffic already on the roundabout comes from that side and has priority.`,
    giveway: `Give way: a car is already on the roundabout, coming from your ${left ? 'right' : 'left'}. Stop at the line with the clutch in, first gear selected, and wait until it has passed.`,
    join: `Join behind the car. Lean into the ${left ? 'clockwise' : 'anticlockwise'} circle — at ${Math.round(V_RING * 3.6)} km/h the ${RING} m circle needs about ${leanFor(V_RING, RING).toFixed(0)}° of lean.`,
    circulate: `Keep a steady speed and a gentle throttle round the island${exit.n >= 3 ? `, still signalling ${turnSide}` : ''}. Watch for vehicles about to join.`,
    'signal-out': `${exit.n === 1 ? 'Keep signalling' : `You have passed the exit before yours: signal ${leaveSide}`}. Check your ${leaveSide} mirror and blind spot for cyclists and other motorcycles before leaving.`,
    leave: 'Leave the roundabout, cancel the signal, and accelerate smoothly as the motorcycle stands up.',
  }[stage]

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 340 340" className="mx-auto w-full max-w-md" role="img" aria-label={`Roundabout, ${left ? 'keep-left' : 'keep-right'} traffic, taking the ${exit.label}; ${stage}`}>
          {[0, 90, 180, 270].map((a) => (
            <rect key={a} x={C - 3.5 * K} y={C - 34 * K} width={7 * K} height={34 * K} transform={`rotate(${a} ${C} ${C})`} className="fill-surface-overlay" />
          ))}
          <circle cx={C} cy={C} r={RING_EDGE * K} className="fill-surface-overlay" />
          <circle cx={C} cy={C} r={ISLAND * K} className="fill-ok-500/15 stroke-ok-500/40" strokeWidth={1.5} />
          {[0, 90, 180, 270].map((a) => (
            <g key={a} transform={`rotate(${a} ${C} ${C})`}>
              <line x1={C} x2={C} y1={C - 34 * K} y2={C - (RING_EDGE + 1) * K} strokeWidth={1.5} strokeDasharray="6 6" className="stroke-line-strong" />
              {/* Give-way line across the entry lane of each arm */}
              <line x1={C} x2={C + m * 3.5 * K} y1={C - (RING_EDGE + 1.2) * K} y2={C - (RING_EDGE + 1.2) * K} strokeWidth={2} strokeDasharray="3 3" className="stroke-ink-muted" />
            </g>
          ))}
          <path d={toPathD(samples, map)} fill="none" strokeWidth={1.5} strokeDasharray="4 4" className="stroke-coolant-400" />
          <TopCar x={map(car).x} y={map(car).y} scale={K} heading={carHeading} />
          <TopBike x={map(now).x} y={map(now).y} scale={K * 2} heading={now.heading} indicator={indicator} blink={blink} />
        </svg>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-4">
            <div role="group" aria-label="Traffic drives on the" className="flex rounded-lg border border-line bg-surface-sunken p-0.5">
              {(['left', 'right'] as const).map((s) => (
                <button key={s} type="button" aria-pressed={side === s} onClick={() => setSide(s)} className={cn('h-7 rounded-md px-3 text-xs', side === s ? 'bg-surface-overlay text-ink' : 'text-ink-subtle hover:text-ink')}>
                  Keep {s}
                </button>
              ))}
            </div>
            <div role="group" aria-label="Exit" className="flex flex-wrap gap-1.5">
              {EXITS.map((e) => (
                <button key={e.n} type="button" aria-pressed={exitN === e.n} onClick={() => setExitN(e.n)} className={cn('h-8 rounded-lg border px-3 text-sm', exitN === e.n ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <dl className="flex flex-wrap gap-6">
              <Readout label="Signal" value={indicator ? `${indicator === 'left' ? '← Left' : 'Right →'}` : 'None'} tone={indicator ? 'caution' : 'ink'} />
              <Readout label="Speed" value={`${Math.round(now.v * 3.6)} km/h`} tone="coolant" />
              <Readout label="Lean" value={`${Math.abs(now.lean).toFixed(0)}°`} />
              <Readout label="Round the island" value={`${Math.round(ringAngle)}°`} />
            </dl>
            <PlaybackControls clock={clock} />
          </div>
        </>
      }
      status={text}
    />
  )
}
