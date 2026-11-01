import { useAnimationFrame, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { oilSystem } from '@/lib/mechanics/engineSystems'

/*
 * Mechanics lesson 11: wet-sump lubrication. A gear pump driven by the engine draws oil from
 * the sump through a strainer and pushes it through the filter to the crankshaft bearings,
 * camshaft and gearbox, from where it drains back. Oil pressure comes from pushing oil
 * through the bearings' tiny clearances: it rises with engine speed and with viscosity
 * (thicker when cold). A relief valve caps it at 5 bar. What protects the bearings is the
 * oil film between the surfaces — thicker with more viscous oil and faster rotation.
 * Oil flow on the diagram moves in proportion to the pump's flow.
 */

const PATH = 'M60,200 L60,150 L120,150 L120,90 L210,90 L210,60 L330,60 L330,120 L380,120 L380,200 Z'

export default function Lubrication() {
  const [rpm, setRpm] = useState(4000)
  const [temp, setTemp] = useState(90)
  const [lowLevel, setLowLevel] = useState(false)
  const o = oilSystem(rpm, temp, !lowLevel)
  const reduce = useReducedMotion()
  const [t, setT] = useState(0)
  useAnimationFrame((ms) => !reduce && setT(ms / 1000))
  const lowPressure = o.pressure < 0.8
  const thinFilm = o.film < 0.5

  return (
    <DiagramFrame
      stage={
        <svg viewBox="20 30 420 212" className="mx-auto w-full max-w-xl" role="img" aria-label={`Oil pressure ${o.pressure.toFixed(1)} bar, film ${Math.round(o.film * 100)} percent of normal`}>
          <rect x={40} y={180} width={360} height={40} rx={6} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
          <rect x={44} y={lowLevel ? 205 : 192} width={352} height={lowLevel ? 12 : 25} rx={4} className="fill-caution-400/40" />
          <DiagramLabel x={330} y={232}>sump</DiagramLabel>
          <path d={PATH} fill="none" strokeWidth={5} className="stroke-surface-overlay" />
          <path d={PATH} fill="none" strokeWidth={4} strokeDasharray="8 8" className="stroke-caution-400" style={{ strokeDashoffset: -t * o.flow * 12 }} />
          <circle cx={60} cy={150} r={14} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
          <DiagramLabel x={44} y={130}>pump</DiagramLabel>
          <rect x={108} y={100} width={24} height={36} rx={4} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
          <DiagramLabel x={102} y={112} anchor="end">filter</DiagramLabel>
          <circle cx={210} cy={75} r={12} className={cn('stroke-ink-muted', thinFilm ? 'fill-danger-500/40' : 'fill-surface-raised')} strokeWidth={1.5} />
          <DiagramLabel x={200} y={52} anchor="end">crank bearings</DiagramLabel>
          <circle cx={290} cy={60} r={10} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
          <DiagramLabel x={290} y={44} anchor="middle">camshaft</DiagramLabel>
          <rect x={366} y={128} width={28} height={28} rx={4} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
          <DiagramLabel x={360} y={168} anchor="end">gearbox</DiagramLabel>
          {/* Bearing close-up: the oil film */}
          <g transform="translate(160,114)">
            <rect x={0} y={0} width={110} height={10} className="fill-ink-subtle" />
            <rect x={0} y={10} width={110} height={Math.max(1, Math.min(14, o.film * 5))} className={thinFilm ? 'fill-danger-400/60' : 'fill-caution-400/60'} />
            <rect x={0} y={10 + Math.max(1, Math.min(14, o.film * 5))} width={110} height={10} className="fill-ink-subtle" />
            <text x={0} y={-4} className="fill-ink-muted text-[10px]">
              oil film (magnified)
            </text>
          </g>
        </svg>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Engine speed" value={rpm} onChange={setRpm} min={1400} max={9000} step={100} valueText={`${rpm.toLocaleString('en')} RPM`} tone="coolant" />
            <Slider label="Oil temperature" value={temp} onChange={setTemp} min={0} max={140} valueText={`${temp} °C`} />
          </div>
          <button type="button" role="switch" aria-checked={lowLevel} onClick={() => setLowLevel(!lowLevel)} className={cn('h-8 w-fit rounded-lg border px-3 text-sm', lowLevel ? 'border-caution-500/50 bg-caution-950 text-caution-300' : 'border-line text-ink-muted hover:text-ink')}>
            Oil level low {lowLevel ? 'ON' : 'OFF'}
          </button>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Viscosity (10W-30)" value={`${o.viscosity.toFixed(0)} cSt`} />
            <Readout label="Pump flow" value={`${o.flow.toFixed(1)} L/min`} />
            <Readout label="Oil pressure" value={`${o.pressure.toFixed(1)} bar${o.relief ? ' (relief open)' : ''}`} tone={lowPressure ? 'danger' : 'ink'} />
            <Readout label="Bearing oil film" value={`${Math.round(o.film * 100)} % of normal`} tone={thinFilm ? 'danger' : 'ok'} />
          </dl>
        </>
      }
      status={
        lowLevel
          ? `Low oil: the pump starts to suck air at the strainer, flow drops and the film thins (${Math.round(o.film * 100)} %). Check the level on the sight glass or dipstick regularly — with the motorcycle upright on level ground.`
          : temp < 30
            ? `Cold oil is thick (${o.viscosity.toFixed(0)} cSt): pressure hits the relief valve, but the thick oil takes longer to reach the top of the engine. Most engine wear happens in the first moments after a cold start — let it idle briefly and ride gently until warm.`
            : lowPressure
              ? `Hot, thin oil at low revs: pressure falls to ${o.pressure.toFixed(1)} bar and the bearing film is only ${Math.round(o.film * 100)} % of normal. If the oil warning light comes on, stop the engine — running without pressure destroys the bearings in seconds.`
              : `At ${temp} °C the oil is ${o.viscosity.toFixed(0)} cSt. The pump pushes ${o.flow.toFixed(1)} L/min through the bearings at ${o.pressure.toFixed(1)} bar, and a film of oil keeps the metal surfaces apart — they never actually touch.`
      }
    />
  )
}
