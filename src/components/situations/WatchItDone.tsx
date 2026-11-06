import { CircleCheck, Pause, Play, RotateCcw, SkipBack, SkipForward, Snail } from 'lucide-react'
import { MachineSummary } from '@/components/cockpit/machine/MachineSummary'
import { RiderCockpit } from '@/components/cockpit/RiderCockpit'
import { RoadPreview } from '@/components/cockpit/road/RoadPreview'
import { roadSceneFor } from '@/components/cockpit/roadScene'
import { crossHighlight } from '@/components/cockpit/crossView'
import type { RunResult } from '@/content/scenarios/cockpit/run'
import type { CockpitScenario } from '@/content/scenarios/cockpit/types'
import { useCockpitSim } from '@/hooks/useCockpitSim'
import { useDemoPlayer } from '@/hooks/useDemoPlayer'
import { cn } from '@/lib/cn'
import { REDLINE_RPM } from '@/lib/mechanics/gearbox'
import { simulationSpeeds } from '@/lib/motion'

/*
 * The cockpit riding the scenario by itself: the same simulation and scenario as the cockpit
 * page, driven by the scenario's demonstration. The rider's view, the instruments, the machine
 * and the motorcycle on the road all follow it; a caption says what is happening and why.
 */

const FRICTION_ZONE: [number, number] = [0.12, 0.36]

export function WatchItDone({ scenario, run }: { scenario: CockpitScenario; run: RunResult }) {
  // The playback controls start it, so a scenario that waits for the rider's first touch doesn't wait here.
  const cockpit = useCockpitSim({ ...scenario.setup, paused: false }, scenario.world)
  const { sim, road, lastDownshift, signal, worldSpec } = cockpit
  const player = useDemoPlayer(cockpit, scenario, run)
  const { state: s, inputs: i, derived: d } = sim.snapshot
  const demo = scenario.demo ?? []
  const step = scenario.steps[player.index]
  const watch = demo[player.index]?.watch
  const parts = step?.highlight ?? []
  const hl = crossHighlight(parts)
  const downshiftAge = sim.clock.time.get() - lastDownshift.get()
  const playing = player.status === 'playing'

  return (
    <div className="space-y-4" data-watch data-status={player.status} data-demo-step={player.index + 1}>
      <RiderCockpit
        values={{
          kmh: Math.max(0, d.kmh),
          rpm: d.engineRpm,
          redline: REDLINE_RPM,
          engineRunning: s.running,
          clutch: i.clutch,
          throttle: i.throttle,
          frontBrake: i.front ?? 0,
          rearBrake: i.rear ?? 0,
          gear: i.gear,
          frictionZone: FRICTION_ZONE,
        }}
        road={{ motion: road, idling: s.running && Math.abs(s.speed) < 0.3, scene: roadSceneFor(i, worldSpec, signal) }}
        highlight={hl.zones}
      />

      {/* Playback */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Playback">
        <button
          type="button"
          onClick={playing ? player.pause : player.play}
          className={cn('flex min-h-11 w-32 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium', playing ? 'border border-line bg-surface text-ink' : 'bg-ignition-500 text-bg hover:bg-ignition-400')}
        >
          {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          {playing ? 'Pause' : player.status === 'paused' ? 'Resume' : player.status === 'done' ? 'Play again' : 'Play'}
        </button>
        <button type="button" onClick={player.previous} disabled={player.index === 0 && player.status === 'ready'} className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm text-ink-muted hover:text-ink disabled:opacity-40">
          <SkipBack className="size-4" aria-hidden /> Previous step
        </button>
        <button type="button" onClick={player.next} disabled={player.index === demo.length - 1} className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm text-ink-muted hover:text-ink disabled:opacity-40">
          <SkipForward className="size-4" aria-hidden /> Next step
        </button>
        <button type="button" onClick={player.replay} className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm text-ink-muted hover:text-ink">
          <RotateCcw className="size-4" aria-hidden /> Replay
        </button>
        <button
          type="button"
          aria-pressed={player.speed === 0.25}
          onClick={() => player.setSpeed(player.speed === 0.25 ? 1 : 0.25)}
          className={cn('flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-sm', player.speed === 0.25 ? 'border-coolant-500/60 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}
        >
          <Snail className="size-4" aria-hidden /> Slow motion
        </button>
        <div role="group" aria-label="Playback speed" className="flex rounded-xl border border-line bg-surface-sunken p-0.5">
          {simulationSpeeds.map((v) => (
            <button key={v} type="button" aria-pressed={player.speed === v} onClick={() => player.setSpeed(v)} className={cn('min-h-11 min-w-12 rounded-lg px-2 font-mono text-xs', player.speed === v ? 'bg-surface-overlay text-ink' : 'text-ink-muted hover:text-ink')}>
              {v}×
            </button>
          ))}
        </div>
      </div>

      {/* Caption */}
      <div className="rounded-2xl border border-coolant-500/30 bg-surface p-4" aria-live="polite" data-caption>
        <ol className="flex flex-wrap gap-1.5" aria-label="Steps of the demonstration">
          {scenario.steps.map((st, k) => (
            <li key={st.id}>
              <button
                type="button"
                onClick={() => player.goTo(k)}
                aria-current={k === player.index ? 'step' : undefined}
                aria-label={`Step ${k + 1}: ${st.title}${player.done[k] ? ' (done)' : ''}`}
                className={cn('relative flex size-9 items-center justify-center rounded-full border font-mono text-xs before:absolute before:-inset-1 before:content-[""]', k === player.index ? 'border-coolant-400 text-ink' : 'border-line text-ink-subtle hover:text-ink')}
              >
                {player.done[k] ? <CircleCheck className="size-4 text-ok-400" aria-hidden /> : k + 1}
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-3 font-mono text-xs text-ink-subtle">
          Step {player.index + 1} of {scenario.steps.length}
          {player.status === 'ready' && ' · press Play to watch'}
          {player.status === 'done' && ' · demonstration complete'}
        </p>
        <h4 className="mt-1 text-lg font-semibold text-ink">{step?.title}</h4>
        <p className="mt-1 leading-relaxed text-ink-muted">{step?.instruction}</p>
        {watch && (
          <p className="mt-2 text-sm leading-relaxed text-ink">
            <span className="font-medium text-coolant-300">Watch: </span>
            {watch}
          </p>
        )}
        {player.done[player.index] && (
          <p className="mt-3 flex gap-2 rounded-xl border border-ok-500/30 bg-ok-950/30 p-3 text-sm leading-relaxed text-ink" data-step-explained>
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok-400" aria-hidden />
            <span>{step?.explanation}</span>
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MachineSummary sim={sim} highlight={hl.stages} />
        <RoadPreview sim={sim} downshiftAge={downshiftAge} highlighted={hl.sideView} crossing={cockpit.crossing} />
      </div>
      <p className="text-xs text-ink-subtle">The same simulation and scenario as the cockpit, ridden by a careful rider. It is a simplified model: a real motorcycle will feel different.</p>
    </div>
  )
}
