import { useMotionValueEvent } from 'motion/react'
import { CircleAlert, CircleCheck, Lightbulb, OctagonX, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { Button } from '@/components/ui/Button'
import { useSimulationClock } from '@/hooks/useSimulationClock'
import { cn } from '@/lib/cn'
import { seededOrder } from '@/lib/shuffle'
import { progress } from '@/lib/progress/store'
import type { Frame, Outcome, Scenario, Verdict } from '@/lib/scenarios/types'
import { SideSceneView } from './SideSceneView'
import { TopSceneView } from './TopSceneView'

const VERDICT: Record<Verdict, { label: string; Icon: typeof CircleCheck; cls: string }> = {
  safe: { label: 'Safe', Icon: CircleCheck, cls: 'border-ok-500/40 bg-ok-950/50 text-ok-400' },
  risky: { label: 'Risky', Icon: CircleAlert, cls: 'border-caution-500/40 bg-caution-950/40 text-caution-400' },
  crash: { label: 'Crash', Icon: OctagonX, cls: 'border-danger-500/40 bg-danger-950/50 text-danger-400' },
}

function frameAt(frames: Frame[], t: number) {
  let lo = 0
  let hi = frames.length - 1
  if (t <= frames[0].t) return frames[0]
  if (t >= frames[hi].t) return frames[hi]
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (frames[mid].t <= t) lo = mid
    else hi = mid
  }
  return frames[lo]
}

/** Plays one scenario: the situation, the decision, and the computed outcome of the choice. */
export function ScenarioPlayer({ scenario, onChoose }: { scenario: Scenario; onChoose?: (choiceId: string) => void }) {
  const clock = useSimulationClock({ autoPlay: true })
  const [time, setTime] = useState(0)
  useMotionValueEvent(clock.time, 'change', setTime)
  const [choice, setChoice] = useState<string | null>(null)
  const [tried, setTried] = useState<Record<string, Verdict>>({})
  const outcome: Outcome | null = useMemo(() => (choice ? scenario.run(choice) : null), [scenario, choice])
  const idle = useMemo(() => {
    if (scenario.intro.length) return scenario.intro
    // First choice is the situation as described, not the recommended outcome.
    return [scenario.run(scenario.choices[0].id).frames[0]]
  }, [scenario])
  const frames = outcome ? outcome.frames : idle
  const t0 = frames[0].t
  const duration = frames[frames.length - 1].t - t0
  // Before a decision the situation loops; after one, the outcome plays once and holds.
  const local = outcome ? Math.min(time, duration) : duration > 0 ? time % (duration + 1) : 0
  const frame = frameAt(frames, t0 + local)
  const finished = outcome !== null && time >= duration

  const choose = (id: string) => {
    onChoose?.(id)
    setChoice(id)
    clock.reset()
    clock.play()
    const verdict = scenario.run(id).verdict
    setTried((x) => ({ ...x, [id]: verdict }))
    progress.recordPractice({ kind: 'scenario', source: scenario.id, item: id, title: scenario.title, result: verdict })
  }
  const replay = () => {
    clock.reset()
    clock.play()
  }

  const v = VERDICT[outcome?.verdict ?? 'safe']

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface-sunken p-2">
          {scenario.scene.view === 'top' ? <TopSceneView scene={scenario.scene} frame={frame} /> : <SideSceneView scene={scenario.scene} frame={frame} />}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <dl className="flex gap-6">
            <Readout label="Speed" value={`${Math.round(frame.bike.v * 3.6)} km/h`} tone="coolant" />
            <Readout label="Time" value={`${local.toFixed(1)} s`} />
          </dl>
          <div className="flex items-center gap-2">
            {outcome && (
              <Button size="sm" variant="secondary" onClick={replay} leadingIcon={<RotateCcw className="size-4" />}>
                Replay
              </Button>
            )}
            <PlaybackControls clock={clock} onReset={replay} showPlay={!finished} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <section aria-labelledby="situation-heading" className="space-y-2 rounded-2xl border border-line bg-surface p-5">
          <h2 id="situation-heading" className="font-mono text-[11px] tracking-[0.16em] text-ink-subtle uppercase">
            The situation
          </h2>
          <p className="leading-relaxed text-ink">{scenario.situation}</p>
          <p className="font-medium text-ink">{scenario.question}</p>
          <div role="group" aria-label="Your decision" className="mt-3 flex flex-col gap-2">
            {/* A stable mixed order, so the safe choice isn't always first. */}
            {seededOrder(scenario.choices, scenario.id).map((c) => {
              const result = tried[c.id]
              return (
                <button
                  key={c.id}
                  type="button"
                  data-choice-index={scenario.choices.indexOf(c)}
                  aria-pressed={choice === c.id}
                  onClick={() => choose(c.id)}
                  className={cn(
                    'flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                    choice === c.id ? 'border-ignition-500/60 bg-ignition-950 text-ink' : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  <span>{c.label}</span>
                  {result && <span className={cn('shrink-0 text-xs font-medium', VERDICT[result].cls.split(' ').at(-1))}>{VERDICT[result].label}</span>}
                </button>
              )
            })}
          </div>
        </section>

        {outcome && (
          <section aria-live="polite" aria-label="Outcome" className="space-y-4 rounded-2xl border border-line bg-surface p-5">
            <p className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold', v.cls)} data-verdict={outcome.verdict}>
              <v.Icon className="size-4" aria-hidden /> {v.label}
            </p>
            <dl className="grid gap-3 sm:grid-cols-3">
              {outcome.metrics.map((m) => (
                <Readout key={m.label} label={m.label} value={m.value} tone={m.tone ?? 'ink'} />
              ))}
            </dl>
            {(
              [
                ['The rider', outcome.rider],
                ['The motorcycle', outcome.motorcycle],
                ['Why', outcome.explanation],
                ['Consequence', outcome.consequence],
              ] as const
            ).map(([h, text]) => (
              <div key={h}>
                <h3 className="text-sm font-semibold text-ink">{h}</h3>
                <p className="mt-0.5 leading-relaxed text-ink-muted">{text}</p>
              </div>
            ))}
            {outcome.verdict !== 'safe' && <p className="text-sm text-ink-subtle">Try another decision to find the safe one.</p>}
          </section>
        )}

        {outcome?.verdict === 'safe' && (
          <p className="flex items-start gap-2 rounded-2xl border border-coolant-500/30 bg-coolant-950/40 p-4 text-sm text-ink">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-coolant-300" aria-hidden /> {scenario.takeaway}
          </p>
        )}
      </div>
    </div>
  )
}
