import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { LeanForces, RearView } from '@/components/handling/RearView'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { GRIP } from '@/lib/mechanics/braking'
import { CLEARANCE_LEAN, combinedCg, gripLean, lateralG, leanFor, ms, radiusFor } from '@/lib/mechanics/cornering'

/*
 * Handling lesson 2: why a motorcycle leans, seen from behind.
 *
 * In a steady turn the tyres push the motorcycle towards the centre of the turn. Leaning
 * puts the combined centre of mass inside the contact patch, so its weight balances that
 * push: tan(lean) = v² / (g R). The lean depends only on speed and radius, not on mass.
 */

const CORNERS = [
  { label: 'Roundabout', r: 12 },
  { label: 'Town corner', r: 25 },
  { label: 'Country bend', r: 80 },
]
const SCALE = 150
const GROUND = { x: 270, y: 300 }

export default function LeanAngle() {
  const [kmh, setKmh] = useState(30)
  const [r, setR] = useState(25)
  const [wet, setWet] = useState(false)
  const v = ms(kmh)
  const need = leanFor(v, r)
  const mu = wet ? GRIP.wet : GRIP.dry
  const tyreLimit = gripLean(mu)
  const limit = Math.min(tyreLimit, CLEARANCE_LEAN)
  const shown = Math.min(need, limit)
  // Whichever limit comes first applies: on a dry road the footpegs (40°) touch down before the tyres slide (42°).
  const scraping = need >= CLEARANCE_LEAN && CLEARANCE_LEAN <= tyreLimit
  const sliding = need > tyreLimit && tyreLimit < CLEARANCE_LEAN
  const cg = combinedCg(shown, 0)
  const status = sliding ? 'slide' : scraping ? 'scrape' : need > limit * 0.8 ? 'near' : 'ok'
  const maxSpeed = Math.sqrt(9.81 * r * Math.tan((limit * Math.PI) / 180)) * 3.6

  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 20 460 310" className="mx-auto w-full max-w-lg" role="img" aria-label={`Rear view: leaning ${need.toFixed(0)} degrees for a ${r} m turn at ${kmh} km/h`}>
          <line x1={40} x2={500} y1={GROUND.y} y2={GROUND.y} strokeWidth={2} className="stroke-line-strong" />
          <text x={490} y={GROUND.y + 20} textAnchor="end" className="fill-ink-subtle font-mono text-[11px]">
            centre of the turn →
          </text>
          <line x1={GROUND.x} x2={GROUND.x} y1={GROUND.y} y2={28} strokeWidth={1} strokeDasharray="3 5" className="stroke-line-strong" />
          <RearView x={GROUND.x} y={GROUND.y} scale={SCALE} lean={shown} showCg={false} scraping={scraping} />
          <line x1={GROUND.x} y1={GROUND.y} x2={GROUND.x + 268 * Math.sin((shown * Math.PI) / 180)} y2={GROUND.y - 268 * Math.cos((shown * Math.PI) / 180)} strokeWidth={1} strokeDasharray="3 5" className="stroke-ignition-400" />
          <LeanForces x={GROUND.x} y={GROUND.y} cg={cg} lean={shown} scale={SCALE} />
          <path d={`M${GROUND.x},${GROUND.y - 268} A268,268 0 0 1 ${GROUND.x + 268 * Math.sin((shown * Math.PI) / 180)},${GROUND.y - 268 * Math.cos((shown * Math.PI) / 180)}`} fill="none" strokeWidth={1.5} className="stroke-ignition-400" />
          <text x={GROUND.x - 6} y={GROUND.y - 256} textAnchor="end" className="tabular fill-ignition-300 font-mono text-[12px]">
            {shown.toFixed(0)}°
          </text>
          {sliding && (
            <text x={GROUND.x} y={GROUND.y + 22} textAnchor="middle" className="fill-danger-400 text-[12px] font-semibold">
              Tyres sliding
            </text>
          )}
        </svg>
      }
      controls={
        <>
          <div role="group" aria-label="Corner" className="flex flex-wrap gap-1.5">
            {CORNERS.map((c) => (
              <button key={c.r} type="button" aria-pressed={r === c.r} onClick={() => setR(c.r)} className={cn('h-8 rounded-lg border px-3 text-sm', r === c.r ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                {c.label} · {c.r} m
              </button>
            ))}
            <button type="button" role="switch" aria-checked={wet} onClick={() => setWet(!wet)} className={cn('h-8 rounded-lg border px-3 text-sm', wet ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
              Wet road {wet ? 'ON' : 'OFF'}
            </button>
          </div>
          <Slider label="Speed" value={kmh} onChange={setKmh} min={5} max={100} valueText={`${kmh} km/h`} tone="coolant" />
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Lean needed" value={`${need.toFixed(1)}°`} tone={status === 'ok' ? 'ink' : status === 'near' ? 'caution' : 'danger'} />
            <Readout label="Sideways push" value={`${lateralG(need).toFixed(2)} g`} />
            <Readout label="Grip used" value={`${Math.round((lateralG(scraping ? CLEARANCE_LEAN : need) / mu) * 100)} %`} tone={sliding ? 'danger' : 'ink'} />
            <Readout label="Fastest for this corner" value={`${Math.floor(maxSpeed)} km/h`} />
          </dl>
        </>
      }
      status={
        status === 'slide'
          ? `At ${kmh} km/h this ${r} m corner needs ${need.toFixed(0)}° of lean — more than the ${wet ? 'wet' : 'dry'} road can grip (about ${tyreLimit.toFixed(0)}°). The tyres would slide out. The only fix is a lower speed before the corner.`
          : status === 'scrape'
            ? `At ${kmh} km/h this corner needs ${need.toFixed(0)}° — the footpegs touch the road at about ${CLEARANCE_LEAN}°, so the motorcycle can't lean any further. It would run wide (it can only turn at about ${radiusFor(v, CLEARANCE_LEAN).toFixed(0)} m radius). Slow down before the corner.`
            : `The tyres push the motorcycle towards the centre of the turn (blue). Leaning ${need.toFixed(0)}° moves the centre of mass inside, so its weight balances that push and the motorcycle neither falls in nor stands up. Same speed and corner, same lean — for any motorcycle and any rider’s weight.${status === 'near' ? ' This is close to the limit: little grip or ground clearance is left for surprises.' : ''}`
      }
    />
  )
}
