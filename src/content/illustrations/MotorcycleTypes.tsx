import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { cn } from '@/lib/cn'
import { BikeSilhouette } from '@/components/mechanics/BikeSilhouette'
import { polyline as line, solveRider } from '@/lib/mechanics/rider'
import { GROUND, motoTypes as types } from './motorcycleTypes.data'

/*
 * Lesson 2: motorcycle types, compared by their "rider triangle" — the positions of the
 * seat, footpegs and handlebar. The rider's posture is not drawn by hand: legs and arms
 * are solved with two-bone inverse kinematics, and the torso lean is chosen so the hands
 * reach the bars with slightly bent arms. Different triangles produce the different
 * riding positions automatically. Bikes face left; ground at y = 228.
 */


export default function MotorcycleTypes() {
  const [id, setId] = useState('standard')
  const t = types.find((x) => x.id === id)!
  const body = solveRider(t)
  const posture = body.lean > 25 ? 'Leaning forward' : body.lean < 0 ? 'Leaning back' : 'Upright'

  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 -12 400 254" className="w-full" role="img" aria-label={`${t.name} motorcycle with rider posture`}>
          <g strokeLinejoin="round" strokeLinecap="round">
            <line x1={40} x2={440} y1={GROUND} y2={GROUND} strokeWidth={2} className="stroke-line-strong" />
            <BikeSilhouette type={t} />

            {/* Rider triangle */}
            <path d={`${line(t.hip, t.hand, t.foot)} Z`} fill="none" strokeWidth={1.5} strokeDasharray="5 4" className="stroke-ignition-400" />

            {/* Rider */}
            <g className="stroke-ink-muted" fill="none" strokeWidth={6}>
              <path d={line(t.hip, body.knee, t.foot)} />
              <path d={line(t.hip, body.shoulder)} strokeWidth={9} />
              <path d={line(body.shoulder, body.elbow, t.hand)} />
            </g>
            <circle cx={body.head.x} cy={body.head.y} r={14} className="fill-surface-overlay stroke-ink-muted" strokeWidth={2} />

            {[t.hip, t.hand, t.foot].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} className="fill-ignition-400" />
            ))}
            <DiagramLabel x={t.hand.x + 8} y={t.hand.y - 6} tone="ignition">Bars</DiagramLabel>
            <DiagramLabel x={t.hip.x + 8} y={t.hip.y - 6} tone="ignition">Seat</DiagramLabel>
            <DiagramLabel x={t.foot.x + 8} y={t.foot.y + 14} tone="ignition">
              {t.id === 'scooter' ? 'Floorboard' : 'Pegs'}
            </DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <div role="group" aria-label="Motorcycle type" className="flex flex-wrap gap-1.5">
            {types.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={id === x.id}
                onClick={() => setId(x.id)}
                className={cn(
                  'h-9 rounded-lg border px-3 text-sm font-medium transition-colors',
                  id === x.id ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                )}
              >
                {x.name}
              </button>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Readout label="Posture" value={`${posture} (${Math.round(body.lean)}°)`} />
            <Readout label="Controls" value={t.controls} tone={t.controls === 'Geared' ? 'coolant' : 'caution'} />
          </dl>
        </>
      }
      status={
        <>
          <span className="font-medium text-ink">{t.name}.</span> {t.posture} {t.use}{' '}
          <span className="text-ink-subtle">{t.note}</span>
        </>
      }
    />
  )
}
