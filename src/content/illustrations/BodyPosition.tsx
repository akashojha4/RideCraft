import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { LeanForces, RearView } from '@/components/handling/RearView'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { CLEARANCE_LEAN, bikeLeanFor, combinedCg, lateralG, leanFor, ms } from '@/lib/mechanics/cornering'

/*
 * Handling lesson 4: body position. The turn needs the *combined* centre of mass of
 * motorcycle and rider at the cornering lean (tan = v²/gR). Moving the rider's mass to the
 * inside lets the motorcycle lean less for the same turn (more ground clearance, more tyre
 * left to use if something changes); leaning the body out — used at walking pace — keeps
 * the rider upright while the motorcycle leans more.
 */

const SITUATIONS = [
  { id: 'bend', label: 'Bend · 50 km/h, 40 m', kmh: 50, r: 40 },
  { id: 'corner', label: 'Corner · 30 km/h, 15 m', kmh: 30, r: 15 },
  { id: 'uturn', label: 'U-turn · 8 km/h, 2.5 m', kmh: 8, r: 2.5 },
] as const
const POSITIONS = [
  { label: 'Lean out', shift: -0.15 },
  { label: 'In line', shift: 0 },
  { label: 'Lean in', shift: 0.12 },
]
const SCALE = 150
const GROUND = { x: 270, y: 300 }

export default function BodyPosition() {
  const [situation, setSituation] = useState<(typeof SITUATIONS)[number]['id']>('corner')
  const [shift, setShift] = useState(0)
  const s = SITUATIONS.find((x) => x.id === situation)!
  const lean = leanFor(ms(s.kmh), s.r)
  const bike = bikeLeanFor(lean, shift)
  const cg = combinedCg(bike, shift)
  const label = shift > 0.02 ? 'leaning in' : shift < -0.02 ? 'leaning out' : 'in line with the motorcycle'

  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 20 460 310" className="mx-auto w-full max-w-lg" role="img" aria-label={`Rear view: rider ${label}; motorcycle leans ${bike.toFixed(0)} degrees, combined lean ${lean.toFixed(0)} degrees`}>
          <line x1={40} x2={500} y1={GROUND.y} y2={GROUND.y} strokeWidth={2} className="stroke-line-strong" />
          <line x1={GROUND.x} x2={GROUND.x} y1={GROUND.y} y2={60} strokeWidth={1} strokeDasharray="3 5" className="stroke-line-strong" />
          <RearView x={GROUND.x} y={GROUND.y} scale={SCALE} lean={bike} riderShift={shift} showCg scraping={bike >= CLEARANCE_LEAN} />
          <LeanForces x={GROUND.x} y={GROUND.y} cg={cg} lean={lean} scale={SCALE} label={false} />
          <text x={490} y={GROUND.y + 20} textAnchor="end" className="fill-ink-subtle font-mono text-[11px]">
            centre of the turn →
          </text>
        </svg>
      }
      controls={
        <>
          <div role="group" aria-label="Situation" className="flex flex-wrap gap-1.5">
            {SITUATIONS.map((x) => (
              <button key={x.id} type="button" aria-pressed={situation === x.id} onClick={() => setSituation(x.id)} className={cn('h-8 rounded-lg border px-3 text-sm', situation === x.id ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                {x.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <Slider className="min-w-56 flex-1" label="Rider’s weight, sideways" value={Math.round(shift * 100)} onChange={(v) => setShift(v / 100)} min={-20} max={20} valueText={`${Math.abs(Math.round(shift * 100))} cm ${shift > 0 ? 'in' : shift < 0 ? 'out' : ''}`} />
            <div role="group" aria-label="Body position presets" className="flex gap-1.5">
              {POSITIONS.map((p) => (
                <button key={p.label} type="button" aria-pressed={Math.abs(shift - p.shift) < 0.005} onClick={() => setShift(p.shift)} className={cn('h-8 rounded-lg border px-3 text-sm', Math.abs(shift - p.shift) < 0.005 ? 'border-ignition-500/50 bg-ignition-950 text-ignition-200' : 'border-line text-ink-muted hover:text-ink')}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Motorcycle lean" value={`${bike.toFixed(1)}°`} tone={bike >= CLEARANCE_LEAN ? 'danger' : 'ink'} />
            <Readout label="Combined lean" value={`${lean.toFixed(1)}°`} tone="coolant" />
            <Readout label="Ground clearance left" value={`${Math.max(0, CLEARANCE_LEAN - bike).toFixed(0)}°`} tone={bike >= CLEARANCE_LEAN - 5 ? 'caution' : 'ink'} />
            <Readout label="Sideways push on tyres" value={`${lateralG(lean).toFixed(2)} g`} />
          </dl>
        </>
      }
      status={
        situation === 'uturn'
          ? shift < -0.02
            ? `Leaning out: the motorcycle leans ${bike.toFixed(0)}° while you stay upright, keeping the combined centre of mass (●) almost over the tyres. At walking pace this is the stable way to turn tightly — the leaned motorcycle turns sharper, and your weight isn’t hanging over the inside where a stall would tip you over.`
            : `At walking pace the turn needs only ${lean.toFixed(0)}° of combined lean. Leaning in with the motorcycle puts your weight over the inside — if the engine stalls or you brake, there is nothing to stop the motorcycle falling in. Try leaning out.`
          : shift > 0.02
            ? `Leaning in: your weight (orange ●) is inside the motorcycle’s centre line, so the motorcycle needs only ${bike.toFixed(0)}° for the ${lean.toFixed(0)}° the turn requires. That leaves more ground clearance and more lean in reserve if the bend tightens. The push on the tyres is the same — it depends only on speed and radius.`
            : shift < -0.02
              ? `Leaning out at speed makes the motorcycle lean further (${bike.toFixed(0)}°) for the same turn — using up ground clearance and lean reserve. Save this for walking-pace turns.`
              : `Sitting in line with the motorcycle: rider and motorcycle lean together at ${bike.toFixed(0)}°. This is the normal position for everyday riding; leaning in slightly helps in faster bends.`
      }
    />
  )
}
