import type { PartId } from '@/components/motorcycle/parts'
import { BrakingView } from '@/components/simulators/ride/BrakingView'
import type { BumpCrossing } from '@/hooks/useCockpitSim'
import type { PowertrainSim } from '@/hooks/usePowertrainSim'
import { G } from '@/lib/mechanics/braking'
import { MASS } from '@/lib/mechanics/powertrain'
import { situation } from '@/lib/simulation/roadResponse'

/** The compact "Road Response": the motorcycle from the side and the situation in one line. */
export function RoadPreview({ sim, downshiftAge, highlighted, onExpand, crossing }: { sim: PowertrainSim; downshiftAge: number; highlighted?: readonly PartId[]; onExpand?: () => void; crossing?: BumpCrossing | null }) {
  const { state: s, inputs: i, derived: d } = sim.snapshot
  const now = situation(s, i, d, downshiftAge)
  return (
    <section aria-label="Road Response (preview)" data-panel="road-preview" className="space-y-2 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold text-ink">Road Response</h2>
        {onExpand && (
          <button type="button" onClick={onExpand} className="text-sm text-ignition-400 hover:text-ignition-300">
            Open full view
          </button>
        )}
      </div>
      <div className="bg-blueprint overflow-hidden rounded-xl">
        {/* On a gradient the whole scene tilts: travel is to the right, so uphill lifts the front. */}
        <div data-slope={i.grade.toFixed(3)} style={{ transform: `rotate(${(-Math.atan(i.grade) * 180) / Math.PI}deg) scale(${i.grade ? 0.94 : 1})` }}>
          <BrakingView state={s} weight={MASS * G} frontWheel={sim.angles.frontWheel} rearWheel={sim.angles.rearWheel} road={sim.angles.wheel} highlighted={highlighted} />
        </div>
      </div>
      <p className="text-sm" data-situation={now.id}>
        <span className="font-medium text-ink">{now.title}.</span> <span className="text-ink-muted">{Math.max(0, d.kmh).toFixed(0)} km/h · {(s.acceleration / G).toFixed(2)} g</span>
      </p>
      {crossing && (
        <p data-crossing className={crossing.peakG >= 1 || crossing.airborne ? 'text-sm text-danger-400' : 'text-sm text-ink-muted'}>
          Speed breaker at {Math.round(crossing.kmh)} km/h: jolt {crossing.peakG.toFixed(2)} g{crossing.airborne ? ', front tyre off the road' : ''}.
        </p>
      )}
    </section>
  )
}
