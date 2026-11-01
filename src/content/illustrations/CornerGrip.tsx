import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { MotorcycleSideView } from '@/components/motorcycle/MotorcycleSideView'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { GRIP, STATIC_FRONT, frontShare } from '@/lib/mechanics/braking'
import { lateralG } from '@/lib/mechanics/cornering'

/*
 * Handling lesson 10: weight transfer in a corner, tyre by tyre.
 *
 * Load: braking moves load to the front, accelerating to the rear (frontShare, braking.ts).
 * Cornering force: in a steady turn each tyre carries its *static* share of it (moments
 * about the centre of mass), whatever the braking or throttle — 45 % front, 55 % rear.
 * Braking force is shared in proportion to load (both brakes used well); drive force is
 * all at the rear. Each tyre's grip used = √(cornering² + braking/drive²) / (μ × its load).
 */

function tyre(lean: number, accel: number, mu: number) {
  const ay = lateralG(lean)
  const share = frontShare(accel * 9.81)
  const brakeG = Math.max(0, -accel)
  const driveG = Math.max(0, accel)
  const front = Math.hypot(ay * STATIC_FRONT, brakeG * share) / (mu * share)
  const rear = Math.hypot(ay * (1 - STATIC_FRONT), brakeG * (1 - share) + driveG) / (mu * (1 - share))
  return { share, front, rear }
}

function Circle({ x, used, label, load }: { x: number; used: number; label: string; load: number }) {
  const r = 56
  const over = used > 1
  return (
    <g data-tyre={label.toLowerCase()}>
      <circle cx={x} cy={80} r={r} strokeWidth={2} className={over ? 'fill-danger-500/10 stroke-danger-400' : 'fill-ok-500/10 stroke-ok-400'} />
      <circle cx={x} cy={80} r={Math.min(1.25, used) * r} className={over ? 'fill-danger-500/50' : used > 0.85 ? 'fill-caution-500/50' : 'fill-ignition-500/50'} />
      <text x={x} y={84} textAnchor="middle" className="tabular fill-ink font-mono text-[14px] font-semibold">
        {Math.round(used * 100)} %
      </text>
      <text x={x} y={158} textAnchor="middle" className="fill-ink text-[12px]">
        {label} tyre
      </text>
      <text x={x} y={174} textAnchor="middle" className="tabular fill-ink-muted font-mono text-[11px]">
        {Math.round(load * 100)} % of the weight
      </text>
    </g>
  )
}

export default function CornerGrip() {
  const [lean, setLean] = useState(30)
  const [accel, setAccel] = useState(0)
  const [wet, setWet] = useState(false)
  const g = accel / 100
  const { share, front, rear } = tyre(lean, g, wet ? GRIP.wet : GRIP.dry)
  const worst = front > rear ? 'front' : 'rear'
  const sliding = Math.max(front, rear) > 1
  const action = g < -0.02 ? `braking at ${(-g).toFixed(2)} g` : g > 0.02 ? `accelerating at ${g.toFixed(2)} g` : 'holding a steady throttle'

  return (
    <DiagramFrame
      stage={
        <div className="grid items-center gap-4 sm:grid-cols-2">
          <div style={{ transform: `rotate(${(-g * 4).toFixed(2)}deg)`, transformOrigin: '50% 95%' }} className="transition-transform duration-300">
            <MotorcycleSideView mode="rider" title={`Motorcycle ${action} in a corner`} className="opacity-80" />
          </div>
          <svg viewBox="0 0 320 184" className="w-full" role="img" aria-label={`Grip used: front ${Math.round(front * 100)} percent, rear ${Math.round(rear * 100)} percent`}>
            <Circle x={80} used={front} label="Front" load={share} />
            <Circle x={240} used={rear} label="Rear" load={1 - share} />
          </svg>
        </div>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Lean angle" value={lean} onChange={setLean} min={0} max={40} valueText={`${lean}°`} tone="coolant" />
            <Slider label="Brake ← throttle →" value={accel} onChange={setAccel} min={-50} max={30} valueText={g < 0 ? `brake ${(-g).toFixed(2)} g` : g > 0 ? `throttle ${g.toFixed(2)} g` : 'steady'} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" role="switch" aria-checked={wet} onClick={() => setWet(!wet)} className={cn('h-8 rounded-lg border px-3 text-sm', wet ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
              Wet road {wet ? 'ON' : 'OFF'}
            </button>
            <dl className="flex flex-wrap gap-6">
              <Readout label="Front load" value={`${Math.round(share * 100)} %`} tone="coolant" />
              <Readout label="Closest to sliding" value={`${worst === 'front' ? 'Front' : 'Rear'} tyre`} tone={sliding ? 'danger' : 'ink'} />
            </dl>
          </div>
        </>
      }
      status={
        sliding
          ? worst === 'front'
            ? `The front tyre is asked for more than it can give and slides — the front “washes out”, which almost always means a fall. Hard acceleration while leaned takes load off the front: roll the throttle on progressively as the motorcycle stands up.`
            : `The rear tyre slides. ${g < 0 ? 'Braking in the corner moved load off the rear while it still had to carry its share of the cornering force.' : 'It is carrying the cornering force and the drive force at once.'} Brake before the corner, upright; open the throttle as you stand up.`
          : Math.abs(g) <= 0.02
            ? `Steady throttle: the load stays close to its ${Math.round(STATIC_FRONT * 100)}/${Math.round((1 - STATIC_FRONT) * 100)} split and both tyres use the same share of their grip (${Math.round(front * 100)} %). This balance is why riders hold a gentle, constant throttle through a bend.`
            : `${action.charAt(0).toUpperCase() + action.slice(1)} shifts load to the ${g < 0 ? 'front' : 'rear'}: ${Math.round(share * 100)} % is now on the front. The ${worst} tyre is working hardest (${Math.round(Math.max(front, rear) * 100)} %) — ${g < 0 ? 'the rear has lost load but still carries its share of the cornering force' : 'the front has lost load and the rear carries the drive force too'}.`
      }
    />
  )
}
