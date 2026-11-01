import { useAnimationFrame, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { cn } from '@/lib/cn'
import { engineTemp } from '@/lib/mechanics/engineSystems'

/*
 * Mechanics lesson 10: cooling. An engine turns only about a third of its fuel’s energy
 * into work; roughly as much again must leave through the cooling system. An air-cooled
 * engine sheds it from fins into the passing air, so its temperature follows riding speed
 * and load. A liquid-cooled engine pumps coolant through a radiator, and a thermostat holds
 * it at about 85 °C — the fan takes over when the motorcycle is standing still.
 */

const SITUATIONS = [
  { id: 'idle', label: 'Idling in traffic', power: 0.6, speed: 0 },
  { id: 'cruise', label: 'Cruising at 60 km/h', power: 2.5, speed: 60 },
  { id: 'hard', label: 'Full throttle at 90 km/h', power: 8, speed: 90 },
  { id: 'climb', label: 'Climbing slowly, heavily loaded', power: 5, speed: 25 },
] as const

export default function Cooling() {
  const [situation, setSituation] = useState<(typeof SITUATIONS)[number]['id']>('cruise')
  const [liquid, setLiquid] = useState(false)
  const s = SITUATIONS.find((x) => x.id === situation)!
  const r = engineTemp(s.power, s.speed, liquid)
  const reduce = useReducedMotion()
  const [t, setT] = useState(0)
  useAnimationFrame((ms) => !reduce && setT(ms / 1000))
  const hot = liquid ? r.temp > 105 : r.temp > 220
  const flow = liquid ? r.thermostat : 0
  const pct = Math.min(1, (r.temp - 30) / (liquid ? 100 : 250))

  return (
    <DiagramFrame
      stage={
        <svg viewBox="20 10 420 230" className="mx-auto w-full max-w-xl" role="img" aria-label={`${liquid ? 'Liquid' : 'Air'}-cooled engine at ${r.temp.toFixed(0)} degrees`}>
          {/* Cylinder */}
          <rect x={150} y={60} width={90} height={130} rx={6} className={cn(hot ? 'fill-danger-500/30' : 'fill-surface-raised', 'stroke-ink-muted')} strokeWidth={1.5} />
          {!liquid &&
            Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={128} y={66 + i * 13} width={134} height={5} rx={2} className="fill-surface-overlay stroke-ink-subtle" strokeWidth={1} />
            ))}
          {liquid && <rect x={158} y={68} width={74} height={114} rx={4} fill="none" strokeWidth={3} strokeDasharray="6 4" className="stroke-coolant-400" style={{ strokeDashoffset: -t * 40 * flow }} />}
          <rect x={170} y={100} width={50} height={70} rx={3} className="fill-surface-sunken stroke-ink-muted" />
          <DiagramLabel x={195} y={205} anchor="middle">cylinder</DiagramLabel>
          {/* Passing air */}
          {Array.from({ length: 8 }, (_, i) => {
            const x = 30 + ((i * 53 + t * (8 + s.speed * 2)) % 380)
            return <line key={i} x1={x} x2={x + 14} y1={40 + (i % 4) * 50} y2={40 + (i % 4) * 50} strokeWidth={1.5} className="stroke-coolant-200/40" />
          })}
          {liquid && (
            <g>
              <path d="M232,90 L330,90 L330,170 L232,170" fill="none" strokeWidth={4} strokeDasharray="8 6" className="stroke-coolant-400" style={{ strokeDashoffset: -t * 50 * flow }} />
              <rect x={320} y={70} width={60} height={120} rx={4} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1={324} x2={376} y1={80 + i * 14} y2={80 + i * 14} strokeWidth={1} className="stroke-line-strong" />
              ))}
              <circle cx={350} cy={130} r={20} fill="none" strokeWidth={1.5} className={r.fan ? 'stroke-ignition-400' : 'stroke-line-strong'} />
              <g transform={`translate(350,130) rotate(${r.fan ? t * 720 : 0})`}>
                <line x1={-16} x2={16} y1={0} y2={0} strokeWidth={3} className={r.fan ? 'stroke-ignition-400' : 'stroke-line-strong'} />
                <line x1={0} x2={0} y1={-16} y2={16} strokeWidth={3} className={r.fan ? 'stroke-ignition-400' : 'stroke-line-strong'} />
              </g>
              <rect x={268} y={82} width={16} height={16} rx={3} className={cn('stroke-ink-muted', r.thermostat > 0.2 ? 'fill-ok-500/40' : 'fill-surface-overlay')} />
              <DiagramLabel x={276} y={74} anchor="middle">thermostat</DiagramLabel>
              <DiagramLabel x={350} y={206} anchor="middle">{r.fan ? 'radiator + fan on' : 'radiator'}</DiagramLabel>
            </g>
          )}
          {/* Temperature gauge */}
          <rect x={40} y={70} width={14} height={120} rx={7} className="fill-surface-sunken stroke-line-strong" />
          <rect x={42} y={70 + 118 * (1 - pct)} width={10} height={118 * pct} rx={5} className={hot ? 'fill-danger-500' : 'fill-ignition-500'} />
          <DiagramLabel x={30} y={205}>{`${r.temp.toFixed(0)} °C`}</DiagramLabel>
        </svg>
      }
      controls={
        <>
          <div role="group" aria-label="Riding situation" className="flex flex-wrap gap-1.5">
            {SITUATIONS.map((x) => (
              <button key={x.id} type="button" aria-pressed={situation === x.id} onClick={() => setSituation(x.id)} className={cn('h-8 rounded-lg border px-3 text-sm', situation === x.id ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                {x.label}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Cooling type" className="flex w-fit rounded-lg border border-line bg-surface-sunken p-0.5">
            {[false, true].map((l) => (
              <button key={String(l)} type="button" aria-pressed={liquid === l} onClick={() => setLiquid(l)} className={cn('h-7 rounded-md px-3 text-xs', liquid === l ? 'bg-surface-overlay text-ink' : 'text-ink-subtle hover:text-ink')}>
                {l ? 'Liquid-cooled' : 'Air-cooled'}
              </button>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label={liquid ? 'Coolant temperature' : 'Cylinder-head temperature'} value={`${r.temp.toFixed(0)} °C`} tone={hot ? 'danger' : 'ink'} />
            <Readout label="Heat to shed" value={`${(Math.max(0.5, s.power)).toFixed(1)} kW`} />
            <Readout label="Cooling air speed" value={`${s.speed} km/h`} />
            <Readout label={liquid ? 'Thermostat · fan' : 'Fins'} value={liquid ? `${Math.round(r.thermostat * 100)} % open · ${r.fan ? 'on' : 'off'}` : 'Air only'} />
          </dl>
        </>
      }
      status={
        liquid
          ? `The thermostat keeps the coolant at about 85 °C${r.thermostat <= 0.1 ? ', staying almost closed so the engine warms up quickly' : ''}. ${r.fan ? 'Standing still there is no airflow, so the fan switches on to pull air through the radiator.' : 'The radiator sheds the heat into the passing air.'} The engine runs at the same temperature whatever you do — good for tight tolerances and power.`
          : hot
            ? `The fins can’t shed ${s.power} kW fast enough at ${s.speed} km/h: the cylinder head reaches about ${r.temp.toFixed(0)} °C. Air-cooled engines are built for this, but long periods of hard work at low speed cause oil to thin and power to fade.`
            : `Air flowing over the fins carries the heat away. At ${s.speed} km/h with ${s.power} kW of heat, the cylinder head settles at about ${r.temp.toFixed(0)} °C. Simple and light — but the temperature depends on speed and load.`
      }
    />
  )
}
