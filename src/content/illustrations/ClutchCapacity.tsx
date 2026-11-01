import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { clampingForce } from '@/lib/mechanics/clutch'
import { PRIMARY_RATIO } from '@/lib/mechanics/gearbox'
import { fullThrottleTorque } from '@/lib/mechanics/powertrain'

/*
 * Mechanics lesson 6: how much torque a multi-plate clutch can carry.
 * Capacity T = n · μ · F · r — n friction surfaces (two per friction plate), μ the
 * friction coefficient of the plates in oil, F the spring clamping force and r the mean
 * radius of the friction faces. Defaults: 4 friction plates (8 surfaces), μ = 0.13,
 * F = 1,150 N, r = 50 mm → about 60 N·m at the clutch, i.e. 18 N·m at the crankshaft
 * through the 3.35 : 1 primary drive — the same clutch as in the simulators.
 */

const SPRING_FORCE = 1150
const RADIUS = 0.05
const CONDITIONS = [
  { id: 'new', label: 'Good plates, correct oil', mu: 0.13 },
  { id: 'worn', label: 'Worn plates', mu: 0.1 },
  { id: 'oil', label: 'Car oil with friction modifiers', mu: 0.07 },
] as const
const PEAK_ENGINE = Math.max(...Array.from({ length: 86 }, (_, i) => fullThrottleTorque(1000 + i * 100)))

export default function ClutchCapacity() {
  const [pull, setPull] = useState(0)
  const [plates, setPlates] = useState(4)
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number]['id']>('new')
  const mu = CONDITIONS.find((c) => c.id === condition)!.mu
  const clamp = clampingForce(pull / 100)
  const surfaces = plates * 2
  const capacity = surfaces * mu * SPRING_FORCE * clamp * RADIUS
  const engineAtClutch = PEAK_ENGINE * PRIMARY_RATIO
  const slips = capacity < engineAtClutch
  const gap = (1 - clamp) * 5
  const stack: ('f' | 's')[] = []
  for (let i = 0; i < plates; i++) stack.push('f', 's')
  stack.pop()

  let x = 120
  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 20 460 230" className="mx-auto w-full max-w-xl" role="img" aria-label={`Clutch with ${plates} friction plates, ${Math.round(clamp * 100)} percent clamping: capacity ${capacity.toFixed(0)} newton metres`}>
          <rect x={60} y={118} width={400} height={14} rx={3} className="fill-surface-overlay stroke-ink-subtle" />
          <DiagramLabel x={456} y={112} anchor="end">mainshaft</DiagramLabel>
          <rect x={100} y={40} width={10} height={170} className="fill-surface-raised stroke-ink-muted" />
          <DiagramLabel x={70} y={34}>basket</DiagramLabel>
          {stack.map((k, i) => {
            const w = k === 'f' ? 9 : 5
            const px = x
            x += w + gap
            return <rect key={i} x={px} y={k === 'f' ? 52 : 62} width={w} height={k === 'f' ? 146 : 126} rx={2} className={k === 'f' ? 'fill-ignition-500/80 stroke-ignition-300' : 'fill-ink-subtle stroke-ink-muted'} strokeWidth={1} />
          })}
          <rect x={x + 4} y={48} width={12} height={154} rx={3} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
          <DiagramLabel x={x + 10} y={34} anchor="middle">pressure plate</DiagramLabel>
          {[70, 125, 180].map((y) => (
            <path key={y} d={`M${x + 16},${y} ${Array.from({ length: 8 }, (_, i) => `L${x + 22 + i * 7},${y + (i % 2 ? -6 : 6)}`).join(' ')} L${x + 82},${y}`} fill="none" strokeWidth={2} className="stroke-coolant-400" />
          ))}
          <DiagramLabel x={x + 88} y={74} tone="coolant">{`springs ${Math.round(SPRING_FORCE * clamp)} N`}</DiagramLabel>
          <DiagramLabel x={150} y={222}>{`${surfaces} friction surfaces`}</DiagramLabel>
        </svg>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Clutch lever pull" value={pull} onChange={setPull} valueText={`${pull} %`} />
            <Slider label="Friction plates" value={plates} onChange={setPlates} min={3} max={6} valueText={`${plates} (${plates * 2} surfaces)`} tone="coolant" />
          </div>
          <div role="group" aria-label="Plate condition" className="flex flex-wrap gap-1.5">
            {CONDITIONS.map((c) => (
              <button key={c.id} type="button" aria-pressed={condition === c.id} onClick={() => setCondition(c.id)} className={cn('h-8 rounded-lg border px-3 text-sm', condition === c.id ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                {c.label} · μ {c.mu}
              </button>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Capacity at the clutch" value={`${capacity.toFixed(0)} N·m`} tone={slips ? 'danger' : 'coolant'} />
            <Readout label="Same at the crankshaft" value={`${(capacity / PRIMARY_RATIO).toFixed(1)} N·m`} />
            <Readout label="Engine’s peak torque (at clutch)" value={`${engineAtClutch.toFixed(0)} N·m`} />
            <Readout label="Margin" value={capacity > 0 ? `${(capacity / engineAtClutch).toFixed(2)} ×` : '—'} tone={slips ? 'danger' : 'ok'} />
          </dl>
        </>
      }
      status={
        clamp === 0
          ? 'Lever pulled in: the springs no longer clamp the plates, so the engine’s plates spin freely between the gearbox’s plates and no torque passes.'
          : slips
            ? `The clutch can carry only ${capacity.toFixed(0)} N·m, less than the engine’s ${engineAtClutch.toFixed(0)} N·m: it slips under full throttle. ${clamp < 1 ? 'That is what the friction zone is for when pulling away.' : condition !== 'new' ? 'With the lever released, this is a fault — worn plates or the wrong oil. Motorcycle wet clutches need oil without friction modifiers (JASO MA rating).' : ''}`
            : `Capacity = ${surfaces} surfaces × ${mu} × ${Math.round(SPRING_FORCE * clamp)} N × 0.05 m = ${capacity.toFixed(0)} N·m — ${(capacity / engineAtClutch).toFixed(2)} times the engine’s peak torque at the clutch, so it grips without slipping. More plates let a clutch carry more torque without a stiffer lever.`
      }
    />
  )
}
