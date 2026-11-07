import { ChevronLeft, ChevronRight, Table2 } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import type { RunResult, RunSample } from '@/content/scenarios/cockpit/run'
import type { CockpitScenario } from '@/content/scenarios/cockpit/types'
import { cn } from '@/lib/cn'
import { AXIS_CONTROLS, CONTROLS, clutchState, gearLabel, pct, steerLabel, type ControlId } from './controls'

/*
 * The whole manoeuvre on one time axis: every control's position and the motorcycle's
 * response, drawn from a run of the scenario's demonstration on the shared model — the same
 * run "Watch it done" plays — so the timeline cannot disagree with the cockpit. Stages are
 * the scenario's guided steps.
 */

/** A 0–1 trace for one row (viewBox 1000 × 100, stretched to the row). */
function area(samples: RunSample[], T: number, value: (x: RunSample) => number) {
  const pts = samples.map((x) => `${((x.t / T) * 1000).toFixed(1)},${(100 - value(x) * 92).toFixed(1)}`)
  return { line: `M${pts.join(' L')}`, fill: `M0,100 L${pts.join(' L')} L1000,100 Z` }
}

/** Spans where a test holds, as [from, to] times. */
function spans(samples: RunSample[], test: (x: RunSample) => boolean) {
  const out: [number, number][] = []
  let from: number | null = null
  samples.forEach((x, k) => {
    if (test(x) && from === null) from = x.t
    if ((!test(x) || k === samples.length - 1) && from !== null) {
      out.push([from, x.t])
      from = null
    }
  })
  return out
}

/** One control's trace on its own, for a control card. */
export function ControlTrace({ run, control, className }: { run: RunResult; control: (typeof AXIS_CONTROLS)[number]; className?: string }) {
  const T = run.samples.at(-1)?.t || 1
  const a = area(run.samples, T, (x) => x[control])
  const c = CONTROLS[control]
  return (
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className={cn('h-10 w-full rounded-md bg-surface-sunken', className)} aria-hidden>
      <path d={a.fill} className={c.fill} />
      <path d={a.line} fill="none" strokeWidth={2} vectorEffect="non-scaling-stroke" className={c.stroke} />
    </svg>
  )
}

/** `focusStage`: the stage the narration is describing (chosen stages are ignored meanwhile). */
export function ControlTimeline({ scenario, run, controls = ['clutch', 'throttle', 'front', 'rear', 'gear'], focusStage }: { scenario: CockpitScenario; run: RunResult; controls?: ControlId[]; focusStage?: number }) {
  const samples = run.samples
  const T = samples.at(-1)?.t || 1
  const [chosenStage, setStage] = useState(0)
  const stage = focusStage ?? chosenStage
  const [hover, setHover] = useState<RunSample | null>(null)
  const [table, setTable] = useState(false)
  const steps = scenario.steps
  const starts = run.stepStarts.map((s) => s.t)
  const ends = run.stepEnds
  const atEnd = (k: number) => [...samples].reverse().find((x) => x.step === k) ?? samples[0]
  const sel = atEnd(stage)
  const x = (t: number) => `${(t / T) * 100}%`
  const maxRpm = Math.max(...samples.map((s) => s.engineRpm), 1)
  const maxKmh = Math.max(...samples.map((s) => s.kmh), 1)
  const gearSpans: { gear: number; from: number; to: number }[] = []
  for (const s of samples) {
    const last = gearSpans.at(-1)
    if (last && last.gear === s.gear) last.to = s.t
    else gearSpans.push({ gear: s.gear, from: last ? s.t : 0, to: s.t })
  }
  const axisRows = AXIS_CONTROLS.filter((c) => controls.includes(c))
  const steers = controls.includes('steer')
  // The control rows, then gear (and the handlebar, when it steers), engine speed and road speed.
  const rows = axisRows.length + 3 + (steers ? 1 : 0)
  const steerSpans: { steer: number; from: number; to: number }[] = []
  for (const s of samples) {
    const last = steerSpans.at(-1)
    if (last && last.steer === s.steer) last.to = s.t
    else steerSpans.push({ steer: s.steer, from: last ? s.t : 0, to: s.t })
  }

  const pick = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const t = ((e.clientX - r.left) / r.width) * T
    return samples.reduce((a, b) => (Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a))
  }
  const go = (k: number) => setStage(Math.max(0, Math.min(steps.length - 1, k)))

  return (
    <div className="space-y-4" data-timeline>
      <div className="space-y-2">
        <ol className="flex flex-wrap gap-1.5" aria-label="Stages">
          {steps.map((s, k) => (
            <li key={s.id}>
              <button
                type="button"
                aria-pressed={stage === k}
                aria-label={`Stage ${k + 1}: ${s.title}`}
                onClick={() => setStage(k)}
                className={cn('flex size-11 items-center justify-center rounded-xl border font-mono text-sm', stage === k ? 'border-coolant-400 bg-coolant-950 text-ink' : 'border-line text-ink-muted hover:text-ink')}
              >
                {k + 1}
              </button>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => go(stage - 1)} disabled={stage === 0} aria-label="Previous stage" className="flex size-11 items-center justify-center rounded-xl border border-line text-ink-muted hover:text-ink disabled:opacity-40">
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => go(stage + 1)} disabled={stage === steps.length - 1} aria-label="Next stage" className="flex size-11 items-center justify-center rounded-xl border border-line text-ink-muted hover:text-ink disabled:opacity-40">
            <ChevronRight className="size-4" aria-hidden />
          </button>
          <button type="button" aria-pressed={table} onClick={() => setTable((v) => !v)} className="ml-auto flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm text-ink-muted hover:text-ink">
            <Table2 className="size-4" aria-hidden /> {table ? 'Show chart' : 'Show as table'}
          </button>
        </div>
      </div>

      {table ? (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[36rem] text-left text-sm" data-timeline-table>
            <caption className="sr-only">Every control and the motorcycle’s response at the end of each stage</caption>
            <thead className="bg-surface-sunken text-xs text-ink-subtle">
              <tr>
                <th className="p-2">Stage</th>
                {axisRows.map((c) => (
                  <th key={c} className="p-2">
                    {CONTROLS[c].label}
                  </th>
                ))}
                <th className="p-2">Gear</th>
                {steers && <th className="p-2">Handlebar</th>}
                <th className="p-2">Engine</th>
                <th className="p-2">Speed</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s, k) => {
                const v = atEnd(k)
                return (
                  <tr key={s.id} className="border-t border-line">
                    <th className="p-2 font-medium text-ink">
                      {k + 1}. {s.title}
                    </th>
                    {axisRows.map((c) => (
                      <td key={c} className="p-2 font-mono text-ink-muted">
                        {pct(v[c])}
                      </td>
                    ))}
                    <td className="p-2 font-mono text-ink-muted">{gearLabel(v.gear)}</td>
                    {steers && <td className="p-2 text-ink-muted">{steerLabel(v.steer)}</td>}
                    <td className="p-2 font-mono text-ink-muted">{v.running ? `${Math.round(v.engineRpm)} RPM` : 'off'}</td>
                    <td className="p-2 font-mono text-ink-muted">{v.kmh.toFixed(0)} km/h</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
          {/* Labels */}
          <div className="contents">
            {[...axisRows.map((c) => ({ key: c, label: CONTROLS[c].label, cls: CONTROLS[c].text })), { key: 'gear', label: 'Gear', cls: CONTROLS.gear.text }, ...(steers ? [{ key: 'steer', label: 'Handlebar', cls: CONTROLS.steer.text }] : []), { key: 'rpm', label: 'Engine RPM', cls: 'text-ink-muted' }, { key: 'kmh', label: 'Road speed', cls: 'text-ink-muted' }].map((r, k) => (
              <p key={r.key} className={cn('flex h-10 items-center text-xs font-medium sm:text-sm', r.cls)} style={{ gridRow: k + 1, gridColumn: 1 }}>
                {r.label}
              </p>
            ))}
          </div>
          {/* Traces, with stage boundaries, the chosen stage and a hover read-out laid over them */}
          <div
            className="relative col-start-2 grid gap-y-1.5 touch-none"
            style={{ gridRow: `1 / span ${rows}`, gridTemplateRows: `repeat(${rows}, 2.5rem)` }}
            onPointerMove={(e) => setHover(pick(e))}
            onPointerLeave={() => setHover(null)}
            onClick={(e) => go(pick(e).step)}
            role="img"
            aria-label={`Timeline of ${steps.length} stages over ${T.toFixed(0)} seconds: ${steps.map((s, k) => `${k + 1} ${s.title}`).join(', ')}. Use “Show as table” for the values.`}
          >
            <div className="pointer-events-none absolute inset-y-0 rounded-md bg-coolant-400/10 ring-1 ring-coolant-400/40" style={{ left: x(starts[stage]), width: `${((ends[stage] - starts[stage]) / T) * 100}%` }} data-stage-band />
            {ends.slice(0, -1).map((t, k) => (
              <div key={k} className="pointer-events-none absolute inset-y-0 border-l border-dashed border-line-strong" style={{ left: x(t) }} />
            ))}
            {axisRows.map((c) => {
              const a = area(samples, T, (s) => s[c])
              return (
                <svg key={c} viewBox="0 0 1000 100" preserveAspectRatio="none" className="h-10 w-full rounded-md bg-surface-sunken" aria-hidden data-trace={c}>
                  {c === 'clutch' && spans(samples, (s) => s.slipping).map(([a0, b0], k) => <rect key={k} x={(a0 / T) * 1000} width={((b0 - a0) / T) * 1000} y={0} height={100} className="fill-ignition-400/15" data-friction-zone />)}
                  <path d={a.fill} className={CONTROLS[c].fill} />
                  <path d={a.line} fill="none" strokeWidth={2} vectorEffect="non-scaling-stroke" className={CONTROLS[c].stroke} />
                </svg>
              )
            })}
            <div className="relative h-10 rounded-md bg-surface-sunken" data-trace="gear">
              {gearSpans.map((g, k) => (
                <span key={k} className={cn('absolute inset-y-1 flex items-center justify-center rounded font-mono text-xs', g.gear === 0 ? 'text-ink-subtle' : cn(CONTROLS.gear.text, 'bg-coolant-400/15'), k > 0 && 'border-l-2 border-coolant-400')} style={{ left: x(g.from), width: `${((g.to - g.from) / T) * 100}%` }}>
                  {gearLabel(g.gear)}
                </span>
              ))}
            </div>
            {steers && (
              <div className="relative h-10 rounded-md bg-surface-sunken" data-trace="steer">
                {steerSpans.map((g, k) => (
                  <span key={k} className={cn('absolute inset-y-1 flex items-center justify-center overflow-hidden rounded text-[11px] whitespace-nowrap', g.steer === 0 ? 'text-ink-subtle' : 'bg-ink-muted/15 text-ink', k > 0 && 'border-l-2 border-ink-muted')} style={{ left: x(g.from), width: `${((g.to - g.from) / T) * 100}%` }}>
                    {steerLabel(g.steer)}
                  </span>
                ))}
              </div>
            )}
            {(['engineRpm', 'kmh'] as const).map((k) => {
              const a = area(samples, T, (s) => s[k] / (k === 'engineRpm' ? maxRpm : maxKmh))
              return (
                <svg key={k} viewBox="0 0 1000 100" preserveAspectRatio="none" className="h-10 w-full rounded-md bg-surface-sunken" aria-hidden data-trace={k}>
                  <path d={a.line} fill="none" strokeWidth={2} vectorEffect="non-scaling-stroke" className="stroke-ink-muted" />
                </svg>
              )
            })}
            {hover && (
              <>
                <div className="pointer-events-none absolute inset-y-0 border-l border-ink" style={{ left: x(hover.t) }} />
                <div className={cn('pointer-events-none absolute top-0 z-10 w-48 rounded-lg border border-line bg-surface-overlay p-2 font-mono text-[11px] leading-relaxed text-ink shadow-lg', hover.t / T > 0.55 ? '-translate-x-full -ml-2' : 'ml-2')} style={{ left: x(hover.t) }}>
                  <p className="text-ink-subtle">
                    {hover.t.toFixed(1)} s · stage {hover.step + 1}
                  </p>
                  {axisRows.map((c) => (
                    <p key={c} className={CONTROLS[c].text}>
                      {CONTROLS[c].label} {pct(hover[c])}
                    </p>
                  ))}
                  <p className={CONTROLS.gear.text}>Gear {gearLabel(hover.gear)}</p>
                  <p>{hover.running ? `${Math.round(hover.engineRpm)} RPM` : 'Engine off'} · {hover.kmh.toFixed(0)} km/h</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* The chosen stage, as the simulation left it */}
      <div className="grid gap-4 rounded-2xl border border-coolant-500/30 bg-surface p-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" aria-live="polite" data-stage={stage + 1}>
        <div>
          <p className="font-mono text-xs text-ink-subtle">
            Stage {stage + 1} of {steps.length} · {(ends[stage] - starts[stage]).toFixed(1)} s
          </p>
          <h4 className="mt-1 font-semibold text-ink">{steps[stage].title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{steps[stage].instruction}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">{steps[stage].explanation}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 self-start font-mono text-xs" data-stage-values>
          {axisRows.map((c) => (
            <div key={c} className="contents">
              <dt className={CONTROLS[c].text}>{CONTROLS[c].label}</dt>
              <dd className="text-ink">{pct(sel[c])}</dd>
            </div>
          ))}
          <dt className={CONTROLS.gear.text}>Gear</dt>
          <dd className="text-ink">{gearLabel(sel.gear)}</dd>
          {steers && (
            <>
              <dt className={CONTROLS.steer.text}>Handlebar</dt>
              <dd className="text-ink">{steerLabel(sel.steer)}</dd>
            </>
          )}
          <dt className="text-ink-muted">Engine</dt>
          <dd className="text-ink">{sel.running ? `${Math.round(sel.engineRpm)} RPM` : 'off'}</dd>
          <dt className="text-ink-muted">Road speed</dt>
          <dd className="text-ink">{sel.kmh.toFixed(0)} km/h</dd>
          <dd className="col-span-2 mt-1 font-sans text-xs leading-relaxed text-ink-muted">{clutchState(sel)}</dd>
        </dl>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-subtle" aria-label="Key">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-ignition-400/40" aria-hidden /> Filled: control in use (higher = further applied)
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-ignition-400/15" aria-hidden /> Shaded clutch: friction zone (plates slipping)
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-0.5 bg-coolant-400" aria-hidden /> Gear change
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-0 border-l border-dashed border-line-strong" aria-hidden /> Stage boundary
        </li>
      </ul>
      <p className="text-xs text-ink-subtle">Drawn from a run of this scenario on the cockpit’s simulation — a simplified model; a real motorcycle’s numbers will differ.</p>
    </div>
  )
}
