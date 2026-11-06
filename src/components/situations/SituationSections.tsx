import { ChevronDown, CircleAlert, Cog, Gauge, MapPin, Route, Target, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { RoadAhead } from '@/components/cockpit/RoadAhead'
import { roadSceneFor } from '@/components/cockpit/roadScene'
import { ClutchControl, ThrottleBrakeControl } from '@/components/cockpit/HandControls'
import { GearLadder, GearSelector, RearBrakeControl } from '@/components/cockpit/FootControls'
import { LessonBlock } from '@/components/lesson/LessonBlock'
import type { RunResult } from '@/content/scenarios/cockpit/run'
import type { CockpitScenario } from '@/content/scenarios/cockpit/types'
import type { ControlGuide, SituationTeaching } from '@/content/situations/types'
import { cn } from '@/lib/cn'
import { ControlTrace } from './ControlTimeline'
import { CONTROLS, gearLabel, pct, type ControlId } from './controls'

/*
 * The sections of a Riding Situations lesson that are plain teaching: the situation, the
 * controls one by one, and the common mistakes. (The timeline and the demonstration are their
 * own components.) Detail sits behind disclosures so one idea is in view at a time.
 */

// ---- Section 1 ----

export function SituationSection({ teaching, scenario, run }: { teaching: SituationTeaching; scenario: CockpitScenario; run: RunResult }) {
  const t = teaching.situation
  const first = run.stepStarts[0]
  const cards = [
    { icon: MapPin, title: 'Where you are', text: t.where },
    { icon: Route, title: 'What is happening', text: t.happening },
    { icon: Target, title: 'What you want to achieve', text: t.goal },
    { icon: TriangleAlert, title: 'The main challenge', text: t.challenge },
  ]
  return (
    <div className="space-y-6">
      <figure className="overflow-hidden rounded-2xl border border-line">
        <div className="aspect-[16/9]">
          <RoadAhead scene={roadSceneFor(first.inputs, scenario.world, first.world.signal)} idling={first.state.running && first.state.speed < 0.3} />
        </div>
        <figcaption className="border-t border-line bg-surface p-3 text-sm text-ink-muted">
          The road ahead from the rider’s seat, as the cockpit scenario begins: {scenario.situation}
        </figcaption>
      </figure>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="flex items-center gap-2 font-semibold text-ink">
              <c.icon className="size-4 text-ignition-400" aria-hidden /> {c.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{c.text}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-coolant-500/30 bg-coolant-950/20 p-4">
        <h3 className="font-semibold text-ink">Understand this before you act</h3>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-muted marker:text-coolant-400">
          {t.before.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ---- Section 2 ----

function ControlDrawing({ guide }: { guide: ControlGuide }) {
  const v = guide.shownAt ?? 0
  switch (guide.control) {
    case 'clutch':
      return <ClutchControl pull={v} />
    case 'throttle':
      return <ThrottleBrakeControl throttle={v} brake={0} />
    case 'front':
      return <ThrottleBrakeControl throttle={0} brake={v} />
    case 'rear':
      return <RearBrakeControl pressure={v} />
    case 'gear':
      return (
        <div className="flex items-center gap-2">
          <GearSelector gear={v} className="min-w-0 flex-1" />
          <GearLadder gear={v} />
        </div>
      )
    default:
      return null
  }
}

/** The stages (guided steps) in which the rider works a control — moves it, or holds it applied — from the run. */
function stagesUsing(run: RunResult, control: ControlId) {
  const used = new Set<number>()
  const value = (x: RunResult['samples'][number]) => (control === 'steer' ? x.steer : x[control])
  run.samples.forEach((x, k) => {
    const prev = run.samples[k - 1]
    const moved = prev !== undefined && Math.abs(value(x) - value(prev)) > 0.005
    if (moved || (control !== 'gear' && Math.abs(value(x)) > 0.01)) used.add(x.step)
  })
  return [...used].sort((a, b) => a - b)
}

export function ControlsSection({ teaching, scenario, run }: { teaching: SituationTeaching; scenario: CockpitScenario; run: RunResult }) {
  const [active, setActive] = useState<ControlId>(teaching.controls[0].control)
  const [open, setOpen] = useState(false)
  const g = teaching.controls.find((c) => c.control === active) ?? teaching.controls[0]
  const style = CONTROLS[g.control]
  const stages = stagesUsing(run, g.control)
  const rows: [string, string][] = [
    ['What', g.what],
    ['When', g.when],
    ['How', g.how],
    ['How much', g.howMuch],
    ['Why', g.why],
  ]
  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Controls" className="flex flex-wrap gap-2">
        {teaching.controls.map((c) => (
          <button
            key={c.control}
            type="button"
            role="tab"
            aria-selected={c.control === active}
            aria-controls="control-panel"
            onClick={() => {
              setActive(c.control)
              setOpen(false)
            }}
            className={cn('flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm', c.control === active ? cn(CONTROLS[c.control].border, 'bg-surface-raised text-ink') : 'border-line text-ink-muted hover:text-ink')}
          >
            <span className={cn('size-2.5 rounded-full', CONTROLS[c.control].bg)} aria-hidden /> {CONTROLS[c.control].label}
          </button>
        ))}
      </div>

      <div id="control-panel" role="tabpanel" aria-label={style.label} className={cn('rounded-2xl border bg-surface p-5', style.border)} data-control={g.control}>
        <div className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="space-y-3">
            <p className={cn('font-mono text-xs tracking-wide uppercase', style.text)}>
              {style.label} · {style.where}
            </p>
            <div className="rounded-xl bg-bg p-2">
              <ControlDrawing guide={g} />
            </div>
            <p className="text-xs text-ink-subtle">
              Drawn {g.control === 'gear' ? `in ${gearLabel(g.shownAt ?? 0)}` : `at ${pct(g.shownAt ?? 0)}`} — the position that matters most in this situation.
            </p>
            {g.control !== 'gear' && g.control !== 'steer' && (
              <div>
                <p className="mb-1 text-xs text-ink-subtle">Through the whole manoeuvre (from the simulation):</p>
                <ControlTrace run={run} control={g.control} />
              </div>
            )}
            <p className="text-xs text-ink-muted" data-control-stages>
              {stages.length ? `Used in stage${stages.length > 1 ? 's' : ''} ${stages.map((k) => k + 1).join(', ')}: ${stages.map((k) => scenario.steps[k].title).join(' · ')}` : 'Not used in this manoeuvre.'}
            </p>
          </div>
          <dl className="space-y-3">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className={cn('text-xs font-semibold tracking-wide uppercase', style.text)}>{k}</dt>
                <dd className="mt-0.5 leading-relaxed text-ink-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <button type="button" aria-expanded={open} aria-controls="control-mechanics" onClick={() => setOpen((o) => !o)} className="mt-5 flex min-h-11 w-full items-center justify-between rounded-xl border border-line px-4 text-left text-sm font-medium text-ink hover:border-line-strong">
          <span className="flex items-center gap-2">
            <Cog className="size-4 text-coolant-400" aria-hidden /> Inside the motorcycle, and on the road
          </span>
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
        {open && (
          <div id="control-mechanics" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Cog className="size-4 text-coolant-400" aria-hidden /> Mechanics
                </h4>
                <p className="mt-1 leading-relaxed text-ink-muted">{g.mechanics}</p>
              </div>
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Gauge className="size-4 text-coolant-400" aria-hidden /> Result on the road
                </h4>
                <p className="mt-1 leading-relaxed text-ink-muted">{g.result}</p>
              </div>
            </div>
            {g.illustration && <LessonBlock block={{ type: 'illustration', illustration: g.illustration, caption: 'Try it: the mechanism up close.' }} />}
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Section 5 ----

export function MistakesSection({ teaching, scenario }: { teaching: SituationTeaching; scenario: CockpitScenario }) {
  const [open, setOpen] = useState<number | null>(0)
  const spotted = new Set(scenario.mistakes.map((m) => m.id))
  return (
    <ol className="space-y-3">
      {teaching.mistakes.map((m, k) => {
        const isOpen = open === k
        const rows: [string, string][] = [
          ['What the rider does', m.does],
          ['What it feels like', m.feels],
          ['What happens mechanically', m.mechanics],
          ['What the motorcycle does', m.motorcycle],
          ['Why it happens', m.cause],
        ]
        return (
          <li key={m.title} className="rounded-2xl border border-line bg-surface" data-mistake-guide>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : k)} className="flex min-h-11 w-full items-center justify-between gap-3 p-4 text-left">
              <span className="flex items-center gap-2 font-semibold text-ink">
                <CircleAlert className="size-4 shrink-0 text-caution-400" aria-hidden /> {m.title}
              </span>
              <ChevronDown className={cn('size-4 shrink-0 text-ink-muted transition-transform', isOpen && 'rotate-180')} aria-hidden />
            </button>
            {isOpen && (
              <div className="space-y-3 border-t border-line p-4">
                <dl className="grid gap-3 sm:grid-cols-2">
                  {rows.map(([t, v]) => (
                    <div key={t}>
                      <dt className="text-xs font-semibold tracking-wide text-ink-subtle uppercase">{t}</dt>
                      <dd className="mt-0.5 text-sm leading-relaxed text-ink-muted">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="rounded-xl border border-ok-500/30 bg-ok-950/30 p-3 text-sm leading-relaxed text-ink">
                  <span className="font-semibold text-ok-400">How to correct it: </span>
                  {m.fix}
                </p>
                {m.cockpit && spotted.has(m.cockpit) && <p className="text-xs text-ink-subtle">The cockpit spots this one: if it happens when you practise, it stops to explain.</p>}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
