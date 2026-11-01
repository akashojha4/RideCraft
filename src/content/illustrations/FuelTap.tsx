import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'

/*
 * Pre-ride lesson 8: fuel. On carburettor motorcycles a fuel tap draws from a standpipe
 * (ON) or from a lower outlet (RES); when the level falls below the standpipe the engine
 * starves, and switching to RES releases the reserve. Example: 11-litre tank with the
 * standpipe at 12 % (≈1.3 L of reserve). Fuel-injected motorcycles have a pump, a gauge
 * and a low-fuel light instead.
 */

const CAPACITY = 11
const STANDPIPE = 0.12
const LOW_LIGHT = 0.15
const TANK = { x: 140, y: 30, w: 200, h: 120 }

type Tap = 'OFF' | 'ON' | 'RES'
const tapAngle: Record<Tap, number> = { OFF: -90, ON: 0, RES: 90 }

export default function FuelTap() {
  const [system, setSystem] = useState<'carb' | 'fi'>('carb')
  const [level, setLevel] = useState(10)
  const [tap, setTap] = useState<Tap>('ON')
  const reduceMotion = useReducedMotion()
  const flowOffset = useMotionValue(0)
  const clipId = useId()

  const f = level / 100
  const litres = f * CAPACITY
  const flowing = system === 'fi' ? f > 0.01 : tap === 'ON' ? f > STANDPIPE : tap === 'RES' ? f > 0.01 : false

  useAnimationFrame((_, delta) => {
    if (flowing && !reduceMotion) flowOffset.set(flowOffset.get() - (Math.min(delta, 100) / 1000) * 40)
  })

  const fuelTop = TANK.y + TANK.h * (1 - f)
  const pipeTop = TANK.y + TANK.h * (1 - STANDPIPE)

  let text: string
  let tone: 'ok' | 'caution' | 'danger'
  if (system === 'fi') {
    tone = f <= 0.01 ? 'danger' : f <= LOW_LIGHT ? 'caution' : 'ok'
    text =
      f <= 0.01
        ? 'Empty: the pump is drawing air and the engine stops. Running the tank dry can also damage the fuel pump.'
        : f <= LOW_LIGHT
          ? `The low-fuel light is on: about ${litres.toFixed(1)} litres left. Refuel soon.`
          : 'Fuel-injected motorcycles have no tap: an electric pump feeds the injector and the gauge shows the level.'
  } else if (tap === 'OFF') {
    tone = 'caution'
    text = 'OFF: no fuel can leave the tank. The engine would run briefly on the fuel already in the carburettor, then stop. Turn the tap to ON before riding.'
  } else if (tap === 'ON') {
    tone = f > STANDPIPE ? 'ok' : 'danger'
    text =
      f > STANDPIPE
        ? `ON: fuel flows from the top of the standpipe. About ${litres.toFixed(1)} litres in the tank.`
        : 'The level is below the standpipe, so no fuel flows on ON and the engine splutters to a stop. Switch to RES — the reserve is still there.'
  } else {
    tone = f > 0.01 ? 'caution' : 'danger'
    text =
      f > 0.01
        ? `RES: drawing the reserve from the bottom outlet — about ${litres.toFixed(1)} litres, enough for roughly 40–60 km on a small commuter. Refuel now, then switch back to ON.`
        : 'Even the reserve is empty. Push to a fuel station — and next time, refuel when you switch to reserve.'
  }

  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 10 400 232" className="w-full" role="img" aria-label={`Fuel tank ${level} percent full`}>
          <g strokeLinejoin="round" strokeLinecap="round">
            <defs>
              <clipPath id={clipId}>
                <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={30} />
              </clipPath>
            </defs>
            <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={30} className="fill-surface-sunken" />
            <rect x={TANK.x} y={fuelTop} width={TANK.w} height={TANK.h} className="fill-caution-400" opacity={0.35} clipPath={`url(#${clipId})`} />
            <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={30} fill="none" strokeWidth={2.5} className="stroke-line-strong" />

            {system === 'carb' ? (
              <>
                {/* Standpipe (ON) and reserve outlet (RES) */}
                <line x1={250} x2={250} y1={TANK.y + TANK.h} y2={pipeTop} strokeWidth={6} className={tap === 'ON' ? 'stroke-coolant-400' : 'stroke-ink-subtle'} />
                <line x1={226} x2={226} y1={TANK.y + TANK.h} y2={TANK.y + TANK.h - 3} strokeWidth={8} className={tap === 'RES' ? 'stroke-coolant-400' : 'stroke-ink-subtle'} />
                <line x1={TANK.x} x2={TANK.x + TANK.w} y1={pipeTop} y2={pipeTop} strokeDasharray="3 4" className="stroke-ink-subtle" />
                <DiagramLabel x={TANK.x + TANK.w + 8} y={pipeTop + 4}>Reserve level</DiagramLabel>
                {/* Tap */}
                <rect x={216} y={TANK.y + TANK.h + 4} width={48} height={34} rx={8} className="fill-surface-raised stroke-ink-subtle" strokeWidth={1.5} />
                <g transform={`rotate(${tapAngle[tap]} 240 ${TANK.y + TANK.h + 21})`}>
                  <line x1={240} x2={240} y1={TANK.y + TANK.h + 21} y2={TANK.y + TANK.h + 4} strokeWidth={6} className="stroke-ignition-400" />
                </g>
                <DiagramLabel x={204} y={TANK.y + TANK.h + 26} anchor="end">OFF</DiagramLabel>
                <DiagramLabel x={240} y={TANK.y + TANK.h + 1} anchor="middle">ON</DiagramLabel>
                <DiagramLabel x={276} y={TANK.y + TANK.h + 26}>RES</DiagramLabel>
              </>
            ) : (
              <>
                <rect x={232} y={TANK.y + TANK.h - 30} width={16} height={26} rx={3} className="fill-surface-raised stroke-ink-subtle" />
                <DiagramLabel x={256} y={TANK.y + TANK.h - 14}>Pump</DiagramLabel>
                <g transform="translate(380 70)">
                  <path d="M-34,0 A34,34 0 0 1 34,0" fill="none" strokeWidth={4} className="stroke-line-strong" />
                  <line x1={0} y1={0} x2={-30 * Math.cos(Math.PI * f)} y2={-30 * Math.sin(Math.PI * f)} strokeWidth={3} className="stroke-ignition-500" />
                  <DiagramLabel x={-34} y={16} anchor="middle">E</DiagramLabel>
                  <DiagramLabel x={34} y={16} anchor="middle">F</DiagramLabel>
                  <circle cx={0} cy={34} r={7} className={f <= LOW_LIGHT ? 'fill-caution-400' : 'fill-surface-overlay'} />
                </g>
              </>
            )}

            {/* Fuel line to the engine */}
            <path d={`M240,${TANK.y + TANK.h + 38} L240,214 L400,214`} fill="none" strokeWidth={6} className="stroke-surface-overlay" />
            <motion.path d={`M240,${TANK.y + TANK.h + 38} L240,214 L400,214`} fill="none" strokeWidth={3} strokeDasharray="8 8" className="stroke-caution-400" style={{ strokeDashoffset: flowOffset, opacity: flowing ? 1 : 0 }} />
            <DiagramLabel x={400} y={234} anchor="end">{system === 'carb' ? 'To carburettor' : 'To injector'}</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Fuel system" className="flex rounded-lg border border-line bg-surface-sunken p-0.5">
              {(
                [
                  ['carb', 'Carburettor (tap)'],
                  ['fi', 'Fuel-injected'],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" aria-pressed={system === id} onClick={() => setSystem(id)} className={cn('h-7 rounded-md px-3 text-xs', system === id ? 'bg-surface-overlay text-ink' : 'text-ink-subtle hover:text-ink')}>
                  {label}
                </button>
              ))}
            </div>
            {system === 'carb' && (
              <div role="group" aria-label="Fuel tap" className="flex gap-1">
                {(['OFF', 'ON', 'RES'] as const).map((t) => (
                  <button key={t} type="button" aria-pressed={tap === t} onClick={() => setTap(t)} className={cn('h-8 w-12 rounded-lg border font-mono text-xs', tap === t ? 'border-ignition-500/50 bg-ignition-950 text-ignition-200' : 'border-line text-ink-muted hover:text-ink')}>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Slider label="Fuel in the tank" value={level} onChange={setLevel} valueText={`${litres.toFixed(1)} of ${CAPACITY} L`} tone="coolant" />
          <dl className="grid grid-cols-2 gap-4">
            <Readout label="Fuel reaching engine" value={flowing ? 'Yes' : 'No'} tone={flowing ? 'ok' : 'danger'} />
            <Readout label="Status" value={tone === 'ok' ? 'OK' : tone === 'caution' ? 'Attention' : 'Engine will stop'} tone={tone} />
          </dl>
        </>
      }
      status={text}
    />
  )
}
