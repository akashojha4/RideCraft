import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { buildPath, sampleAt, timeline, toPathD } from '@/components/handling/path'
import { TopBike, TopCar } from '@/components/handling/TopBike'
import { useLoopTime } from '@/components/handling/useLoopTime'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { CLEARANCE_LEAN, leanFor, ms, radiusFor } from '@/lib/mechanics/cornering'

/*
 * Handling lesson 6: a tight 90° turn into a side road, from above. The corner needs a
 * radius R; at speed v that takes tan(lean) = v²/(gR). If that is beyond the 40° the
 * motorcycle can lean, it can only turn at R = v²/(g·tan 40°) and ends up that much further
 * out — across the centre line into the oncoming lane, or off the road.
 */

const LANE = 3.5
const K = 9
const TURN_IN = 4
const CORNERS = [
  { id: 'tight', label: 'Tight corner', r: 5 },
  { id: 'wide', label: 'Wide corner', r: 9 },
] as const

export default function JunctionTurn() {
  const [corner, setCorner] = useState<(typeof CORNERS)[number]['id']>('tight')
  const [kmh, setKmh] = useState(15)
  const rc = CORNERS.find((c) => c.id === corner)!.r
  const v = ms(kmh)
  const need = leanFor(v, rc)
  const r = need > CLEARANCE_LEAN ? radiusFor(v, CLEARANCE_LEAN) : rc
  const wide = r - rc
  const where = wide <= 0.05 ? 'lane' : wide <= LANE / 2 ? 'line' : wide <= LANE * 1.5 ? 'oncoming' : 'off'

  const samples = (() => {
    const path = buildPath({ x: 0, y: 0, heading: 0 }, [
      { type: 'straight', length: TURN_IN },
      { type: 'arc', radius: r, angle: 90 },
      { type: 'straight', length: 14 },
    ])
    return timeline(path, () => v)
  })()
  const total = samples[samples.length - 1].t
  const { clock, t } = useLoopTime(total)
  const now = sampleAt(samples, t)

  // Side road: its centre line is LANE/2 beyond the target lane's centre (y = TURN_IN + rc).
  const laneY = TURN_IN + rc
  const centreY = laneY + LANE / 2
  const map = (p: { x: number; y: number }) => ({ x: 70 + p.x * K, y: 300 - p.y * K })
  const kerbR = rc - LANE / 2
  const kerbStart = map({ x: LANE / 2, y: TURN_IN })
  const kerbEnd = map({ x: rc, y: TURN_IN + kerbR })

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 420 310" className="w-full" role="img" aria-label={`Turning into a side road at ${kmh} km/h: ${where === 'lane' ? 'stays in lane' : where === 'line' ? 'drifts towards the centre line' : where === 'oncoming' ? 'runs into the oncoming lane' : 'runs off the road'}`}>
          {/* Main road (your lane and the oncoming lane) and the side road */}
          <rect x={map({ x: -LANE * 1.5, y: 0 }).x} y={0} width={LANE * 2 * K} height={310} className="fill-surface-overlay" />
          <rect x={map({ x: LANE / 2, y: 0 }).x} y={map({ x: 0, y: centreY + LANE }).y} width={420} height={LANE * 2 * K} className="fill-surface-overlay" />
          <path d={`M${kerbStart.x},${kerbStart.y} A${kerbR * K},${kerbR * K} 0 0 1 ${kerbEnd.x},${kerbEnd.y} L${kerbStart.x},${kerbEnd.y} Z`} className="fill-surface-overlay" />
          <path d={`M${kerbStart.x},310 L${kerbStart.x},${kerbStart.y} A${kerbR * K},${kerbR * K} 0 0 1 ${kerbEnd.x},${kerbEnd.y} L420,${kerbEnd.y}`} fill="none" strokeWidth={3} className="stroke-ink-subtle" />
          <line x1={map({ x: -LANE / 2, y: 0 }).x} x2={map({ x: -LANE / 2, y: 0 }).x} y1={0} y2={310} strokeWidth={2} strokeDasharray="10 10" className="stroke-line-strong" />
          <line x1={map({ x: LANE / 2, y: 0 }).x} x2={420} y1={map({ x: 0, y: centreY }).y} y2={map({ x: 0, y: centreY }).y} strokeWidth={2} strokeDasharray="10 10" className="stroke-line-strong" />
          <DiagramLabel x={414} y={map({ x: 0, y: laneY }).y + 4} anchor="end">your lane</DiagramLabel>
          <DiagramLabel x={414} y={map({ x: 0, y: centreY + LANE / 2 }).y + 4} anchor="end">oncoming lane</DiagramLabel>
          <TopCar x={map({ x: 18, y: centreY + LANE / 2 }).x} y={map({ x: 18, y: centreY + LANE / 2 }).y} scale={K} heading={-90} />
          <path d={toPathD(samples, map)} fill="none" strokeWidth={2} strokeDasharray="5 4" className={where === 'lane' ? 'stroke-coolant-400' : where === 'line' ? 'stroke-caution-400' : 'stroke-danger-400'} />
          <TopBike x={map(now).x} y={map(now).y} scale={K * 1.4} heading={now.heading} />
        </svg>
      }
      controls={
        <>
          <div role="group" aria-label="Corner" className="flex flex-wrap gap-1.5">
            {CORNERS.map((c) => (
              <button key={c.id} type="button" aria-pressed={corner === c.id} onClick={() => setCorner(c.id)} className={cn('h-8 rounded-lg border px-3 text-sm', corner === c.id ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                {c.label} · {c.r} m
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <Slider className="min-w-56 flex-1" label="Speed through the turn" value={kmh} onChange={setKmh} min={5} max={40} valueText={`${kmh} km/h`} tone="coolant" />
            <PlaybackControls clock={clock} />
          </div>
          <dl className="grid grid-cols-3 gap-4">
            <Readout label="Lean needed" value={`${need.toFixed(0)}°`} tone={need > CLEARANCE_LEAN ? 'danger' : need > 30 ? 'caution' : 'ink'} />
            <Readout label="Turn radius" value={`${r.toFixed(1)} m`} />
            <Readout label="Runs wide by" value={wide > 0.05 ? `${wide.toFixed(1)} m` : '—'} tone={where === 'lane' ? 'ok' : 'danger'} />
          </dl>
        </>
      }
      status={
        where === 'lane'
          ? `At ${kmh} km/h this ${rc} m corner needs ${need.toFixed(0)}° of lean${need > 30 ? ' — possible, but with little margin for gravel or a surprise' : ''}. The motorcycle stays in its lane. Slow down before the turn, look into the road you’re turning into, and keep a gentle throttle round it.`
          : `Too fast: the corner needs ${need.toFixed(0)}° of lean, but the footpegs touch at ${CLEARANCE_LEAN}°, so the tightest turn possible is ${r.toFixed(1)} m — ${wide.toFixed(1)} m wider than the corner. ${where === 'off' ? 'The motorcycle runs off the road.' : where === 'oncoming' ? 'It crosses into the oncoming lane, into the path of the car.' : 'It drifts onto the centre line.'} In a tight turn, speed matters most: slow down before you turn.`
      }
    />
  )
}
