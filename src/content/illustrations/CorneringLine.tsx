import { useMemo, useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { buildPath, sampleAt, timeline, toPathD, type PathSample } from '@/components/handling/path'
import { RearView } from '@/components/handling/RearView'
import { TopBike } from '@/components/handling/TopBike'
import { useLoopTime } from '@/components/handling/useLoopTime'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { G } from '@/lib/mechanics/braking'
import { lateralG, leanFor, ms } from '@/lib/mechanics/cornering'

/*
 * Handling lesson 1: taking a bend, from above. A 25 m-radius right-hand bend. The rider
 * approaches at 50 km/h, brakes upright on the straight (0.35 g) to the chosen corner speed,
 * looks through the bend, presses the inside bar to lean in, holds a steady throttle round the
 * arc (lean from tan = v²/gR) and accelerates out (0.15 g) as the road straightens.
 */

const R = 25
const APPROACH = 55
const EXIT = 35
const V0 = ms(50)
const BRAKE = 0.35 * G
const DRIVE = 0.15 * G
const LANE = 4
const K = 3.6
const ORIGIN = { x: 60, y: 332 }
const map = (p: { x: number; y: number }) => ({ x: ORIGIN.x + p.x * K, y: ORIGIN.y - p.y * K })

const PHASES = [
  { id: 'slow', title: 'Slow', text: 'Brake and change down on the straight, while upright — reach your corner speed before the bend.' },
  { id: 'look', title: 'Look', text: 'Turn your head and look through the bend, as far round as you can see. The motorcycle follows your eyes.' },
  { id: 'press', title: 'Press', text: 'Press the inside handlebar (right bar for a right bend). The motorcycle leans and starts to turn.' },
  { id: 'roll', title: 'Roll', text: 'Hold a gentle, steady throttle round the bend — it keeps the motorcycle balanced and settled.' },
  { id: 'exit', title: 'Exit', text: 'As the bend opens out, roll the throttle on: the motorcycle stands up and accelerates away.' },
] as const

export default function CorneringLine() {
  const [kmh, setKmh] = useState(35)
  const vc = ms(kmh)
  const brakeDist = (V0 * V0 - vc * vc) / (2 * BRAKE)
  const turnIn = APPROACH
  const brakeStart = turnIn - 10 - brakeDist

  const samples = useMemo(() => {
    const path = buildPath({ x: 0, y: 0, heading: 0 }, [
      { type: 'straight', length: APPROACH, tag: 'straight' },
      { type: 'arc', radius: R, angle: 90, tag: 'arc' },
      { type: 'straight', length: EXIT, tag: 'exit' },
    ])
    const arcEnd = APPROACH + (Math.PI * R) / 2
    const speed = (p: PathSample) => {
      if (p.s < brakeStart) return V0
      if (p.s < turnIn - 10) return Math.sqrt(Math.max(vc * vc, V0 * V0 - 2 * BRAKE * (p.s - brakeStart)))
      if (p.s <= arcEnd) return vc
      return Math.min(V0, Math.sqrt(vc * vc + 2 * DRIVE * (p.s - arcEnd)))
    }
    return timeline(path, speed)
  }, [vc, brakeStart, turnIn])

  const total = samples[samples.length - 1].t
  const { clock, t } = useLoopTime(total)
  const now = sampleAt(samples, t)
  const phase = now.s < brakeStart ? null : now.s < turnIn - 8 ? 'slow' : now.s < turnIn ? 'look' : now.s < turnIn + 5 ? 'press' : now.tag === 'arc' ? 'roll' : 'exit'
  const lookAhead = samples.find((p) => p.s >= now.s + 18) ?? samples[samples.length - 1]
  const lean = leanFor(vc, R)
  const pos = map(now)
  const roadD = toPathD(samples, map)

  return (
    <DiagramFrame
      stage={
        <div className="relative">
          <svg viewBox="0 0 440 340" className="w-full" role="img" aria-label={`Top view of a right-hand bend; the motorcycle is ${phase ? `in the “${phase}” phase` : 'approaching'} at ${Math.round(now.v * 3.6)} km/h`}>
            <path d={roadD} fill="none" strokeWidth={LANE * K + 6} strokeLinejoin="round" className="stroke-surface-raised" />
            <path d={roadD} fill="none" strokeWidth={LANE * K} strokeLinejoin="round" className="stroke-surface-overlay" />
            {/* Braking zone, turn-in point */}
            <line x1={map({ x: -LANE / 2, y: brakeStart }).x} x2={map({ x: LANE / 2, y: brakeStart }).x} y1={map({ x: 0, y: brakeStart }).y} y2={map({ x: 0, y: brakeStart }).y} strokeWidth={2} className="stroke-caution-400" />
            <text x={map({ x: LANE / 2 + 1, y: brakeStart }).x} y={map({ x: 0, y: brakeStart }).y + 4} className="fill-ink-muted text-[10px]">
              start braking
            </text>
            <line x1={map({ x: -LANE / 2, y: turnIn }).x} x2={map({ x: LANE / 2, y: turnIn }).x} y1={map({ x: 0, y: turnIn }).y} y2={map({ x: 0, y: turnIn }).y} strokeWidth={2} className="stroke-ignition-400" />
            <text x={map({ x: -LANE / 2 - 1, y: turnIn }).x} y={map({ x: 0, y: turnIn }).y + 4} textAnchor="end" className="fill-ink-muted text-[10px]">
              turn in
            </text>
            {/* Where the rider is looking */}
            {phase && phase !== 'slow' && <line x1={pos.x} y1={pos.y} x2={map(lookAhead).x} y2={map(lookAhead).y} strokeWidth={1.5} strokeDasharray="3 4" className="stroke-coolant-300" />}
            <TopBike x={pos.x} y={pos.y} scale={K * 3.2} heading={now.heading} />
            <DiagramLabel x={430} y={20} anchor="end">{`Bend radius ${R} m · motorcycle drawn larger than scale`}</DiagramLabel>
          </svg>
          <svg viewBox="0 0 120 130" className="absolute right-2 bottom-2 w-28 rounded-xl border border-line bg-surface/80 sm:w-32" role="img" aria-label={`Rear view: leaning ${now.lean.toFixed(0)} degrees`}>
            <line x1={0} x2={120} y1={118} y2={118} strokeWidth={1} className="stroke-line-strong" />
            <RearView x={60} y={118} scale={62} lean={now.lean} />
            <text x={6} y={14} className="tabular fill-ink-muted font-mono text-[10px]">{`${Math.abs(now.lean).toFixed(0)}° lean`}</text>
          </svg>
        </div>
      }
      controls={
        <>
          <ol aria-label="Cornering phases" className="grid gap-2 sm:grid-cols-5">
            {PHASES.map((p) => (
              <li key={p.id} aria-current={phase === p.id ? 'step' : undefined} className={cn('rounded-lg border p-2 text-xs transition-colors', phase === p.id ? 'border-ignition-500/60 bg-ignition-950 text-ink' : 'border-line text-ink-subtle')}>
                <span className="block font-semibold">{p.title}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-end gap-4">
            <Slider className="min-w-56 flex-1" label="Corner speed" value={kmh} onChange={setKmh} min={20} max={45} valueText={`${kmh} km/h`} tone="coolant" />
            <PlaybackControls clock={clock} />
          </div>
          <dl className="grid grid-cols-3 gap-4">
            <Readout label="Speed now" value={`${Math.round(now.v * 3.6)} km/h`} tone="coolant" />
            <Readout label="Lean in the bend" value={`${lean.toFixed(0)}°`} />
            <Readout label="Sideways push" value={`${lateralG(lean).toFixed(2)} g`} />
          </dl>
        </>
      }
      status={phase ? PHASES.find((p) => p.id === phase)!.text : `Approaching at 50 km/h. Braking starts ${Math.round(turnIn - brakeStart)} m before the bend, so all the slowing is done upright, in a straight line.`}
    />
  )
}
