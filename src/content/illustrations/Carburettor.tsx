import { useAnimationFrame, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { carburettor } from '@/lib/mechanics/engineSystems'

/*
 * Mechanics lesson 9: a slide carburettor in cross-section. Air speeds up through the
 * narrow venturi under the slide and its pressure drops (Bernoulli). That suction pulls
 * fuel up from the float bowl through the main jet, past a tapered needle that rises with
 * the slide. Because the fuel flow and the air flow both grow with the same suction, the
 * mixture stays roughly constant — but thinner air at altitude makes it richer.
 * Air particles move at a speed proportional to the venturi air speed.
 */

const ALTITUDES = [0, 1500, 3000]

export default function Carburettor() {
  const [slide, setSlide] = useState(40)
  const [rpm, setRpm] = useState(5000)
  const [altitude, setAltitude] = useState(0)
  const [choke, setChoke] = useState(false)
  const c = carburettor(rpm, slide / 100, altitude, choke)
  const reduce = useReducedMotion()
  const [t, setT] = useState(0)
  useAnimationFrame((ms) => !reduce && setT(ms / 1000))
  const slideBottom = 70 + (1 - slide / 100) * 48
  const mixture = c.afr < 12 ? 'Rich' : c.afr > 15.5 ? 'Lean' : 'About right'
  const particles = Array.from({ length: 14 }, (_, i) => {
    const x = 40 + (((i * 37 + t * c.velocity * 18) % 330) + 330) % 330
    const inVenturi = x > 150 && x < 250
    return { x, y: 104 + ((i * 13) % 26) * (inVenturi ? 0.45 : 1) - (inVenturi ? 0 : 6) }
  })

  return (
    <DiagramFrame
      stage={
        <svg viewBox="20 10 400 250" className="mx-auto w-full max-w-xl" role="img" aria-label={`Carburettor: slide ${slide} percent open, air ${c.velocity.toFixed(0)} metres per second, mixture ${c.afr.toFixed(1)} to 1`}>
          {/* Body with venturi */}
          <path d="M30,80 L150,80 L180,96 L220,96 L250,80 L390,80 L390,140 L250,140 L220,126 L180,126 L150,140 L30,140 Z" className="fill-surface-overlay stroke-ink-muted" strokeWidth={1.5} />
          {choke && <rect x={60} y={80} width={10} height={36} className="fill-caution-400/70" />}
          {/* Slide and needle */}
          <rect x={185} y={30} width={30} height={slideBottom - 30} rx={3} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
          <path d={`M197,${slideBottom} L203,${slideBottom} L201,${slideBottom + 58} L199,${slideBottom + 58} Z`} className="fill-ink-muted" />
          {/* Jet and float bowl */}
          <rect x={194} y={140} width={12} height={46} className="fill-surface-sunken stroke-ink-muted" strokeWidth={1.5} />
          <rect x={196} y={186 - Math.min(44, 6 + c.dp / 4)} width={8} height={Math.min(44, 6 + c.dp / 4)} className="fill-caution-400/70" />
          <rect x={150} y={186} width={100} height={56} rx={6} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
          <rect x={153} y={206} width={94} height={33} rx={3} className="fill-caution-400/40" />
          <rect x={210} y={196} width={22} height={12} rx={3} className="fill-ink-subtle" />
          {particles.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.2} className="fill-coolant-300" />
          ))}
          {c.dp > 15 && Array.from({ length: 4 }, (_, i) => <circle key={i} cx={200 + ((i * 11 + t * 40) % 40)} cy={110 - (i % 2) * 6} r={1.6} className="fill-caution-300" />)}
          <DiagramLabel x={34} y={74}>air in</DiagramLabel>
          <DiagramLabel x={330} y={74}>to engine</DiagramLabel>
          <DiagramLabel x={222} y={44}>slide</DiagramLabel>
          <DiagramLabel x={255} y={226}>float bowl</DiagramLabel>
          <DiagramLabel x={150} y={166} anchor="end">main jet</DiagramLabel>
          <DiagramLabel x={200} y={155} anchor="middle" tone="coolant">venturi</DiagramLabel>
        </svg>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Throttle slide" value={slide} onChange={setSlide} min={5} max={100} valueText={`${slide} %`} />
            <Slider label="Engine speed" value={rpm} onChange={setRpm} min={1400} max={9000} step={100} valueText={`${rpm.toLocaleString('en')} RPM`} tone="coolant" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <div role="group" aria-label="Altitude" className="flex gap-1.5">
              {ALTITUDES.map((a) => (
                <button key={a} type="button" aria-pressed={altitude === a} onClick={() => setAltitude(a)} className={cn('h-8 rounded-lg border px-3 text-sm', altitude === a ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                  {a === 0 ? 'Sea level' : `${a.toLocaleString('en')} m`}
                </button>
              ))}
            </div>
            <button type="button" role="switch" aria-checked={choke} onClick={() => setChoke(!choke)} className={cn('h-8 rounded-lg border px-3 text-sm', choke ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
              Choke {choke ? 'ON' : 'OFF'}
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Air speed in venturi" value={`${c.velocity.toFixed(0)} m/s`} tone="coolant" />
            <Readout label="Pressure drop" value={`${c.dp.toFixed(0)} Pa`} />
            <Readout label="Air–fuel ratio" value={`${c.afr.toFixed(1)} : 1`} tone={mixture === 'About right' ? 'ok' : 'caution'} />
            <Readout label="Mixture" value={mixture} tone={mixture === 'About right' ? 'ok' : 'caution'} />
          </dl>
        </>
      }
      status={
        choke
          ? `Choke on: a plate restricts the air entering, so the same suction pulls proportionally more fuel — ${c.afr.toFixed(1)} : 1, rich enough to start a cold engine where much of the fuel condenses on cold metal. Turn it off once the engine warms up.`
          : altitude > 0
            ? `At ${altitude.toLocaleString('en')} m the air is ${Math.round((1 - Math.exp(-altitude / 8500)) * 100)} % thinner. The carburettor measures air by volume, not mass, so it still delivers nearly the same fuel: the mixture goes rich (${c.afr.toFixed(1)} : 1) — a fuel-injection system corrects for this with its pressure sensors.`
            : `Air accelerates to ${c.velocity.toFixed(0)} m/s (on average) through the venturi and its pressure drops by ${c.dp.toFixed(0)} Pa. That suction lifts fuel through the jet. Open the slide and the needle rises with it, so the mixture stays near ${c.afr.toFixed(1)} : 1 across the range.`
      }
    />
  )
}
