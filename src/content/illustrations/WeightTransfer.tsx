import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { MotorcycleSideView } from '@/components/motorcycle/MotorcycleSideView'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { G, STATIC_FRONT, frontShare } from '@/lib/mechanics/braking'

/*
 * Lesson 10: load transfer under braking.
 *
 * Front share of the weight = static share + (h / L) × (deceleration / g), from taking
 * moments about the rear contact patch — the same model as the ride-and-stop simulator
 * (lib/mechanics/braking.ts). (At about 1.2 g the rear would lift — beyond the range shown.) Each tyre can
 * only provide braking force in proportion to the load on it.
 *
 * The overlay shares the drawing's viewBox, so arrows sit at the real axle positions.
 */

const VIEWBOX = '60 60 690 394'
const GROUND_Y = 440
const FRONT_X = 180
const REAR_X = 600
const CG = { x: 411, y: 246 }

const presets = [
  { label: 'Rolling', g: 0 },
  { label: 'Gentle', g: 0.3 },
  { label: 'Firm', g: 0.6 },
  { label: 'Emergency', g: 0.9 },
]

function Arrow({ x, share, label }: { x: number; share: number; label: string }) {
  const len = 40 + share * 210
  return (
    <g>
      <line x1={x} y1={GROUND_Y} x2={x} y2={GROUND_Y - len} strokeWidth={6} className="stroke-coolant-400" />
      <path d={`M${x - 12},${GROUND_Y - len + 14} L${x},${GROUND_Y - len} L${x + 12},${GROUND_Y - len + 14}`} fill="none" strokeWidth={6} className="stroke-coolant-400" />
      <text x={x + 16} y={GROUND_Y - len + 10} className="tabular fill-ink font-mono text-[22px]">
        {label}
      </text>
    </g>
  )
}

export default function WeightTransfer() {
  const [decel, setDecel] = useState(0)
  const g = decel / 100
  const front = frontShare(-g * G)
  const rear = 1 - front
  const stopping = g > 0 ? (50 / 3.6) ** 2 / (2 * g * G) : null

  return (
    <DiagramFrame
      stage={
        <div className="relative">
          <div style={{ transform: `rotate(${-g * 2.5}deg)`, transformOrigin: `${((FRONT_X - 60) / 690) * 100}% ${((GROUND_Y - 60) / 394) * 100}%` }} className="transition-transform duration-300">
            <MotorcycleSideView title="Motorcycle braking" className="opacity-60" />
          </div>
          <svg viewBox={VIEWBOX} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <Arrow x={FRONT_X} share={front} label={`${Math.round(front * 100)} %`} />
            <Arrow x={REAR_X} share={rear} label={`${Math.round(rear * 100)} %`} />
            <circle cx={CG.x} cy={CG.y} r={12} className="fill-bg stroke-ink" strokeWidth={3} />
            <path d={`M${CG.x},${CG.y - 12} A12,12 0 0 1 ${CG.x + 12},${CG.y} L${CG.x},${CG.y} Z M${CG.x},${CG.y + 12} A12,12 0 0 1 ${CG.x - 12},${CG.y} L${CG.x},${CG.y} Z`} className="fill-ink" />
            {g > 0 && (
              <g>
                <line x1={CG.x - 16} y1={CG.y} x2={CG.x - 16 - g * 160} y2={CG.y} strokeWidth={5} className="stroke-ink-muted" />
                <path d={`M${CG.x - 4 - g * 160},${CG.y - 10} L${CG.x - 16 - g * 160},${CG.y} L${CG.x - 4 - g * 160},${CG.y + 10}`} fill="none" strokeWidth={5} className="stroke-ink-muted" />
              </g>
            )}
          </svg>
        </div>
      }
      controls={
        <>
          <div role="group" aria-label="Braking" className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                aria-pressed={Math.round(g * 100) === Math.round(p.g * 100)}
                onClick={() => setDecel(Math.round(p.g * 100))}
                className={cn(
                  'h-8 rounded-lg border px-3 text-sm transition-colors',
                  Math.round(g * 100) === Math.round(p.g * 100) ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Slider label="Deceleration" value={decel} onChange={setDecel} max={100} valueText={`${g.toFixed(2)} g`} tone="coolant" />
          <dl className="grid grid-cols-3 gap-4">
            <Readout label="Front tyre load" value={`${Math.round(front * 100)} %`} tone="coolant" />
            <Readout label="Rear tyre load" value={`${Math.round(rear * 100)} %`} />
            <Readout label="Stop from 50 km/h" value={stopping ? `${stopping.toFixed(1)} m` : '—'} />
          </dl>
        </>
      }
      status={
        g === 0
          ? `Rolling: the weight is split about ${Math.round(STATIC_FRONT * 100)} % front, ${Math.round((1 - STATIC_FRONT) * 100)} % rear. The ● marks the combined centre of mass of motorcycle and rider.`
          : `Braking at ${g.toFixed(2)} g: the centre of mass sits above the tyres, so its momentum pitches the motorcycle forward and moves load onto the front tyre — about ${Math.round(front * 100)} % now. A tyre can only provide braking force in proportion to its load, so the front brake does most of the work while the lightly loaded rear locks easily.` +
            (stopping ? ` Braking distance alone from 50 km/h: about ${stopping.toFixed(0)} m (plus the distance covered while you react).` : '')
      }
    />
  )
}
