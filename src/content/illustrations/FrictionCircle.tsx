import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { lateralG } from '@/lib/mechanics/cornering'

/*
 * Handling lesson 9: the friction circle. A tyre can push on the road in any direction, but
 * the total — braking or driving force combined with cornering force — can't exceed
 * μ × the load on it: √(ax² + ay²) ≤ μ·g. Cornering at a lean uses ay = g·tan(lean); whatever
 * is left of the circle is all that remains for braking or accelerating.
 */

const SURFACES = [
  { id: 'dry', label: 'Dry asphalt', mu: 0.9 },
  { id: 'wet', label: 'Wet asphalt', mu: 0.5 },
  { id: 'gravel', label: 'Loose gravel', mu: 0.35 },
  { id: 'paint', label: 'Wet road paint', mu: 0.25 },
] as const
const R = 120
const C = { x: 160, y: 150 }
const SCALE = R / 1

export default function FrictionCircle() {
  const [surface, setSurface] = useState<(typeof SURFACES)[number]['id']>('dry')
  const [lean, setLean] = useState(25)
  const [brake, setBrake] = useState(20)
  const mu = SURFACES.find((s) => s.id === surface)!.mu
  const ay = lateralG(lean)
  const ax = brake / 100
  const used = Math.hypot(ax, ay)
  const share = used / mu
  const sliding = share > 1
  const spare = Math.sqrt(Math.max(0, mu * mu - ay * ay))
  const dot = { x: C.x + ay * SCALE, y: C.y + ax * SCALE }

  return (
    <DiagramFrame
      stage={
        <div className="grid items-center gap-4 sm:grid-cols-[3fr_2fr]">
          <svg viewBox="0 0 320 300" className="w-full" role="img" aria-label={`Friction circle: ${Math.round(share * 100)} percent of the grip used`}>
            {/* Grip available on this surface, and the dry-road circle for comparison */}
            <circle cx={C.x} cy={C.y} r={0.9 * SCALE} fill="none" strokeWidth={1} strokeDasharray="3 4" className="stroke-line-strong" />
            <circle cx={C.x} cy={C.y} r={mu * SCALE} strokeWidth={2} className={cn(sliding ? 'fill-danger-500/10 stroke-danger-400' : 'fill-ok-500/10 stroke-ok-400')} />
            <line x1={C.x - R - 10} x2={C.x + R + 10} y1={C.y} y2={C.y} strokeWidth={1} className="stroke-line-strong" />
            <line x1={C.x} x2={C.x} y1={C.y - R - 10} y2={C.y + R + 10} strokeWidth={1} className="stroke-line-strong" />
            <text x={C.x + R + 8} y={C.y - 6} textAnchor="end" className="fill-ink-subtle text-[10px]">
              cornering →
            </text>
            <text x={C.x + 6} y={C.y + R + 8} className="fill-ink-subtle text-[10px]">
              braking ↓
            </text>
            <text x={C.x + 6} y={C.y - R - 2} className="fill-ink-subtle text-[10px]">
              accelerating ↑
            </text>
            {surface !== 'dry' && (
              <text x={C.x - 0.64 * SCALE} y={C.y - 0.64 * SCALE - 4} textAnchor="end" className="fill-ink-subtle text-[9px]">
                dry road
              </text>
            )}
            {/* Components and the total */}
            <line x1={C.x} y1={C.y} x2={dot.x} y2={C.y} strokeWidth={3} className="stroke-coolant-400" />
            <line x1={dot.x} y1={C.y} x2={dot.x} y2={dot.y} strokeWidth={3} className="stroke-ignition-400" />
            <line x1={C.x} y1={C.y} x2={dot.x} y2={dot.y} strokeWidth={2} strokeDasharray="4 3" className="stroke-ink" />
            <circle cx={Math.min(310, dot.x)} cy={Math.min(290, dot.y)} r={7} strokeWidth={2.5} className={sliding ? 'fill-danger-400 stroke-bg' : 'fill-ink stroke-bg'} />
          </svg>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-1">
            <Readout label="Cornering" value={`${ay.toFixed(2)} g`} tone="coolant" />
            <Readout label="Braking" value={`${ax.toFixed(2)} g`} />
            <Readout label="Total asked of the tyres" value={`${used.toFixed(2)} g`} />
            <Readout label="Grip used" value={`${Math.round(share * 100)} %`} tone={sliding ? 'danger' : share > 0.8 ? 'caution' : 'ok'} />
            <Readout label="Braking still available" value={`${spare.toFixed(2)} g`} />
          </dl>
        </div>
      }
      controls={
        <>
          <div role="group" aria-label="Road surface" className="flex flex-wrap gap-1.5">
            {SURFACES.map((s) => (
              <button key={s.id} type="button" aria-pressed={surface === s.id} onClick={() => setSurface(s.id)} className={cn('h-8 rounded-lg border px-3 text-sm', surface === s.id ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                {s.label} · μ {s.mu}
              </button>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Lean angle" value={lean} onChange={setLean} min={0} max={45} valueText={`${lean}°`} tone="coolant" />
            <Slider label="Braking" value={brake} onChange={setBrake} min={0} max={100} valueText={`${(brake / 100).toFixed(2)} g`} />
          </div>
        </>
      }
      status={
        sliding
          ? `Outside the circle: the tyres are asked for ${used.toFixed(2)} g but this surface can only give ${mu} g. They slide. Leaned over, there is only ${spare.toFixed(2)} g left for braking — brake before the corner, or stand the motorcycle up before braking hard.`
          : `Inside the circle: ${Math.round(share * 100)} % of the grip is in use. Cornering at ${lean}° takes ${ay.toFixed(2)} g on its own, leaving ${spare.toFixed(2)} g for braking. ${surface !== 'dry' ? 'On this surface the circle is much smaller — the same lean leaves far less margin.' : 'The more you lean, the less you can brake, and the other way round.'}`
      }
    />
  )
}
