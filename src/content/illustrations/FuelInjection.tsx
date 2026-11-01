import { useAnimationFrame, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { injection, manifoldPressure } from '@/lib/mechanics/engineSystems'

/*
 * Mechanics lesson 8: electronic fuel injection. Every cycle the ECU works out how much air
 * the cylinder is drawing in (from engine speed, throttle position and manifold pressure),
 * divides by the air–fuel ratio it wants, and opens the injector for just long enough to
 * spray that much fuel. The bar shows one engine cycle (720°) with the injector's open time.
 * The animation runs 40× slower than real.
 */

const SLOW = 40

export default function FuelInjection() {
  const [rpm, setRpm] = useState(4000)
  const [throttle, setThrottle] = useState(30)
  const [coolant, setCoolant] = useState(90)
  const r = injection(rpm, throttle / 100, coolant)
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState(0)
  useAnimationFrame((t) => {
    if (reduce) return
    setPhase(((t / 1000) * (rpm / 120)) / SLOW % 1)
  })
  const spraying = phase < r.duty
  const sensors = [
    { name: 'Throttle position', value: `${throttle} %` },
    { name: 'Manifold pressure', value: `${manifoldPressure(throttle / 100).toFixed(2)} bar` },
    { name: 'Engine speed', value: `${rpm.toLocaleString('en')} RPM` },
    { name: 'Coolant temperature', value: `${coolant} °C` },
    { name: 'Oxygen sensor', value: r.closedLoop ? 'In control' : 'Ignored' },
  ]

  return (
    <DiagramFrame
      stage={
        <div className="grid items-center gap-4 sm:grid-cols-[3fr_2fr]">
          <svg viewBox="20 10 360 230" className="w-full" role="img" aria-label={`Injector ${spraying ? 'spraying' : 'closed'}; pulse ${r.pulse.toFixed(1)} milliseconds`}>
            {/* Intake port into the cylinder head */}
            <path d="M30,120 L230,120 L290,170 L290,220 L250,220 L250,180 L210,150 L30,150 Z" className="fill-surface-overlay stroke-ink-muted" strokeWidth={1.5} />
            <rect x={60} y={112} width={30} height={46} rx={4} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
            <line x1={75} y1={118} x2={75 + 12 * Math.cos(((90 - throttle * 0.9) * Math.PI) / 180)} y2={135 - 15 * Math.sin(((90 - throttle * 0.9) * Math.PI) / 180)} strokeWidth={3} className="stroke-ink" />
            <DiagramLabel x={75} y={175} anchor="middle">throttle</DiagramLabel>
            {/* Injector */}
            <rect x={168} y={40} width={22} height={70} rx={5} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
            <rect x={174} y={108} width={10} height={12} className={spraying ? 'fill-ignition-400' : 'fill-ink-subtle'} />
            {spraying && <path d="M179,120 L160,165 L198,165 Z" className="fill-coolant-400/40" />}
            <DiagramLabel x={200} y={60}>injector</DiagramLabel>
            <path d="M260,215 L280,215 L280,230 L260,230 Z" className="fill-ink-subtle" />
            <DiagramLabel x={300} y={200}>to the</DiagramLabel>
            <DiagramLabel x={300} y={213}>cylinder</DiagramLabel>
            {/* One engine cycle with the injection pulse */}
            <rect x={30} y={190} width={200} height={14} rx={3} className="fill-surface-sunken stroke-line-strong" />
            <rect x={30} y={190} width={Math.max(2, 200 * r.duty)} height={14} rx={3} className="fill-ignition-500" />
            <line x1={30 + 200 * phase} x2={30 + 200 * phase} y1={186} y2={208} strokeWidth={2} className="stroke-ink" />
            <DiagramLabel x={30} y={222}>{`one cycle: ${r.cycleMs.toFixed(1)} ms`}</DiagramLabel>
          </svg>
          <ul className="space-y-1.5 text-sm" aria-label="Sensors the ECU reads">
            {sensors.map((s) => (
              <li key={s.name} className="flex justify-between gap-3 rounded-lg border border-line px-3 py-1.5">
                <span className="text-ink-muted">{s.name}</span>
                <span className={cn('tabular font-mono', s.name === 'Oxygen sensor' && !r.closedLoop ? 'text-caution-400' : 'text-ink')}>{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-3">
            <Slider label="Engine speed" value={rpm} onChange={setRpm} min={1400} max={9000} step={100} valueText={`${rpm.toLocaleString('en')} RPM`} tone="coolant" />
            <Slider label="Throttle" value={throttle} onChange={setThrottle} min={2} max={100} valueText={`${throttle} %`} />
            <Slider label="Coolant temperature" value={coolant} onChange={setCoolant} min={0} max={100} valueText={`${coolant} °C`} tone="coolant" />
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Readout label="Air per cycle" value={`${r.air.toFixed(0)} mg`} />
            <Readout label="Target air–fuel ratio" value={`${r.afr.toFixed(1)} : 1`} tone="coolant" />
            <Readout label="Fuel per cycle" value={`${r.fuel.toFixed(1)} mg`} />
            <Readout label="Injector open" value={`${r.pulse.toFixed(2)} ms`} />
            <Readout label="Duty cycle" value={`${Math.round(r.duty * 100)} %`} />
          </dl>
        </>
      }
      status={
        coolant < 40
          ? `Cold engine: fuel condenses on cold metal, so the ECU enriches the mixture to ${r.afr.toFixed(1)} : 1 and keeps the injector open longer (${r.pulse.toFixed(2)} ms). The oxygen sensor is ignored until the engine warms up.`
          : throttle > 85
            ? `Full throttle: the ECU richens to ${r.afr} : 1 for maximum power and to keep the combustion chamber cool. The injector is open ${Math.round(r.duty * 100)} % of the time.`
            : `The cylinder draws in ${r.air.toFixed(0)} mg of air per cycle. For the chemically correct 14.7 : 1 the ECU needs ${r.fuel.toFixed(1)} mg of fuel, so it opens the injector for ${r.pulse.toFixed(2)} ms (including 0.6 ms for the valve to open). The oxygen sensor in the exhaust checks the result and the ECU trims the next pulse.`
      }
    />
  )
}
