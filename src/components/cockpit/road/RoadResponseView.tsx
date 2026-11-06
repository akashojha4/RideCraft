import type { PartId } from '@/components/motorcycle/parts'
import { Readout } from '@/components/simulation/Readouts'
import { SimCard } from '@/components/simulation/SimCard'
import { BrakingView } from '@/components/simulators/ride/BrakingView'
import { deriveExplorer } from '@/content/simulators/clutchExplorer'
import type { BumpCrossing } from '@/hooks/useCockpitSim'
import { VISUAL_SLOWDOWN, type PowertrainSim } from '@/hooks/usePowertrainSim'
import { cn } from '@/lib/cn'
import { G, GRIP, frontShare } from '@/lib/mechanics/braking'
import { MASS } from '@/lib/mechanics/powertrain'
import { FORK_TRAVEL, REAR_TRAVEL, SAG, situation, suspension, type SituationId } from '@/lib/simulation/roadResponse'

/*
 * "Road Response": what the motorcycle physically does, from the cockpit's own simulation —
 * the motorcycle and rider from the side (pitching with the load transfer, load and brake
 * arrows at each tyre, wheels turning or locked), the suspension at each end, and the riding
 * situation explained.
 */

const WEIGHT = MASS * G
const SOURCE: Record<string, string> = { engine: 'Engine', 'engine-braking': 'Wheel → engine', momentum: 'Momentum', stopped: '—' }
const TONE: Partial<Record<SituationId, string>> = {
  'front-brake': 'border-danger-500/40 bg-danger-950/30',
  'rear-brake': 'border-danger-500/40 bg-danger-950/30',
  'both-brakes': 'border-danger-500/40 bg-danger-950/30',
  stalled: 'border-danger-500/40 bg-danger-950/30',
  momentum: 'border-caution-500/30 bg-caution-950/20',
  downshift: 'border-caution-500/30 bg-caution-950/20',
  'engine-braking': 'border-caution-500/30 bg-caution-950/20',
  'pulling-in-first': 'border-coolant-500/40 bg-coolant-950/30',
  accelerating: 'border-coolant-500/40 bg-coolant-950/30',
}

/** One end's suspension: its travel, the sag mark at rest, and where it is now. */
function Gauge({ label, position, change, travel, word }: { label: string; position: number; change: number; travel: number; word: [string, string] }) {
  return (
    <div data-suspension={label.toLowerCase()} className="flex items-end gap-3">
      <div className="relative h-32 w-5 overflow-hidden rounded-md border border-line bg-surface-sunken" role="img" aria-label={`${label}: ${Math.abs(Math.round(change))} mm ${change >= 0 ? word[0] : word[1]}, ${Math.round(position * 100)} % of its ${Math.round(travel * 1000)} mm travel`}>
        <div className={cn('absolute inset-x-0 bottom-0', position >= 1 ? 'bg-danger-400' : 'bg-coolant-500/70')} style={{ height: `${position * 100}%` }} />
        <div className="absolute inset-x-0 border-t border-dashed border-ink" style={{ bottom: `${SAG * 100}%` }} />
      </div>
      <div className="font-mono text-xs">
        <p className="text-ink">{label}</p>
        <p className="text-ink-muted">
          {Math.abs(Math.round(change))} mm {change >= 0 ? word[0] : word[1]}
        </p>
        {position >= 1 && <p className="text-danger-400">bottomed out</p>}
        <p className="text-ink-subtle">dashed: at rest</p>
      </div>
    </div>
  )
}

export function RoadResponseView({ sim, downshiftAge, highlighted, crossing }: { sim: PowertrainSim; downshiftAge: number; highlighted?: readonly PartId[]; crossing?: BumpCrossing | null }) {
  const { state: s, inputs: i, derived: d } = sim.snapshot
  const sus = suspension(s)
  const share = frontShare(s.loadAccel)
  const now = situation(s, i, d, downshiftAge)
  const source = deriveExplorer(s, i).source
  const a = Math.abs(s.acceleration) < 0.05 ? 0 : s.acceleration

  return (
    <section aria-labelledby="road-response" className="space-y-4">
      <div>
        <h2 id="road-response" className="text-xl font-semibold text-ink">
          Road Response
        </h2>
        <p className="mt-1 text-sm text-ink-muted">What the motorcycle does on the road as a result. The pitch is drawn slightly exaggerated; wheels turn {VISUAL_SLOWDOWN}× slower than real.</p>
      </div>

      <div aria-live="polite" data-situation={now.id} className={cn('rounded-2xl border p-4', TONE[now.id] ?? 'border-line bg-surface')}>
        <h3 className="font-semibold text-ink">{now.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{now.text}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <SimCard title="The motorcycle on the road">
          <div className="bg-blueprint overflow-hidden rounded-xl">
            {/* On a gradient the whole scene tilts: travel is to the right, so uphill lifts the front. */}
            <div data-slope={i.grade.toFixed(3)} style={{ transform: `rotate(${(-Math.atan(i.grade) * 180) / Math.PI}deg) scale(${i.grade ? 0.94 : 1})` }}>
              <BrakingView state={s} weight={WEIGHT} frontWheel={sim.angles.frontWheel} rearWheel={sim.angles.rearWheel} road={sim.angles.wheel} highlighted={highlighted} />
            </div>
      </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Speed" value={`${Math.max(0, d.kmh).toFixed(1)} km/h`} />
            <Readout label={a < 0 ? 'Slowing' : 'Accelerating'} value={`${Math.abs(a / G).toFixed(2)} g`} tone={a < -0.5 ? 'danger' : a > 0.2 ? 'coolant' : 'ink'} />
            <Readout label="Load front / rear" value={`${Math.round(share * 100)} / ${Math.round((1 - share) * 100)} %`} />
            <Readout label="Driven by" value={SOURCE[source]} />
            <Readout label="Front wheel" value={s.brakes.front.locked ? 'locked' : `${Math.round(Math.max(0, d.wheelRpm))} RPM`} tone={s.brakes.front.locked ? 'danger' : 'ink'} />
            <Readout label="Rear wheel" value={s.brakes.rear.locked ? 'locked' : `${Math.round(Math.max(0, d.wheelRpm))} RPM`} tone={s.brakes.rear.locked ? 'danger' : 'ink'} />
            <Readout label="Front brake" value={`${Math.round(s.brakes.front.force)} N`} />
            <Readout label="Rear brake" value={`${Math.round(s.brakes.rear.force)} N`} />
            <Readout label="Lean" value="0° (upright)" />
            <Readout label="Road" value={`${i.grade > 0 ? `${Math.round(i.grade * 100)} % up` : i.grade < 0 ? `${Math.round(-i.grade * 100)} % down` : 'level'}, ${(i.grip ?? GRIP.dry) >= GRIP.dry ? 'dry' : (i.grip ?? GRIP.dry) >= GRIP.wet ? 'wet' : 'gravel'}`} />
          </dl>
        </SimCard>
        <SimCard title="Suspension">
          <div className="flex flex-wrap gap-6 lg:flex-col">
            <Gauge label="Front fork" position={sus.front} change={sus.dive} travel={FORK_TRAVEL} word={['compressed', 'extended']} />
            <Gauge label="Rear shocks" position={sus.rear} change={sus.squat} travel={REAR_TRAVEL} word={['compressed', 'extended']} />
          </div>
          <p className="mt-3 text-xs text-ink-subtle">Movement from the load transfer alone, at representative spring rates; damping isn’t shown here.</p>
          {crossing && (
            <div data-crossing className={cn('mt-3 rounded-xl border p-3 text-sm', crossing.peakG >= 1 || crossing.airborne ? 'border-danger-500/40 bg-danger-950/30' : 'border-line bg-surface-sunken')}>
              <p className="font-medium text-ink">Speed breaker at {Math.round(crossing.kmh)} km/h</p>
              <p className="mt-1 text-ink-muted">
                Jolt {crossing.peakG.toFixed(2)} g · fork used {Math.round(crossing.travelUsed * 1000)} of {Math.round(FORK_TRAVEL * 1000)} mm
                {crossing.preload > 0.002 && <> ({Math.round(crossing.preload * 1000)} mm already taken by braking)</>}
                {crossing.airborne && <> · the front tyre left the road</>}
              </p>
            </div>
          )}
        </SimCard>
      </div>
    </section>
  )
}
