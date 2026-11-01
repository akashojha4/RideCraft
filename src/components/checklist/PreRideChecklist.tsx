import { AlertTriangle, BookOpen, Check, ChevronDown, CircleAlert, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MotorcycleSideView } from '@/components/motorcycle/MotorcycleSideView'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { checklist, checklistGroups, type ChecklistItem } from '@/content/checklist'
import { lessonPath } from '@/content/curriculum'
import { cn } from '@/lib/cn'

type Result = 'pending' | 'ok' | 'problem'

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

/**
 * Interactive pre-ride checklist. Mark each item OK or Problem; the motorcycle drawing
 * highlights the parts of the item you are working on, and the verdict updates as you go.
 * State is held for this visit only, on purpose: the checklist is meant to be run fresh before every ride.
 */
export function PreRideChecklist() {
  const [results, setResults] = useState<Record<string, Result>>(() => Object.fromEntries(checklist.map((i) => [i.id, 'pending'])))
  const [active, setActive] = useState<string>(checklist[0].id)
  const [open, setOpen] = useState<string | null>(null)

  const done = checklist.filter((i) => results[i.id] !== 'pending').length
  const problems = checklist.filter((i) => results[i.id] === 'problem')
  const stops = problems.filter((i) => i.severity === 'stop')
  const remaining = checklist.length - done
  const activeItem = checklist.find((i) => i.id === active)!

  const mark = (item: ChecklistItem, r: Result) => {
    setResults((s) => ({ ...s, [item.id]: s[item.id] === r ? 'pending' : r }))
    setActive(item.id)
  }
  const reset = () => {
    setResults(Object.fromEntries(checklist.map((i) => [i.id, 'pending'])))
    setActive(checklist[0].id)
    setOpen(null)
  }
  const jumpTo = (id: string) => {
    setActive(id)
    document.getElementById(`check-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const verdict =
    stops.length > 0
      ? { tone: 'danger', icon: AlertTriangle, title: 'Don’t ride yet', text: `${stops.length} problem${stops.length > 1 ? 's' : ''} must be fixed before you ride.` }
      : remaining > 0
        ? { tone: 'pending', icon: CircleAlert, title: `${remaining} check${remaining > 1 ? 's' : ''} to go`, text: 'Work through every item before riding.' }
        : problems.length > 0
          ? { tone: 'caution', icon: CircleAlert, title: 'Ride with care', text: `Nothing stops you riding, but fix ${problems.length > 1 ? 'these' : 'this'} soon.` }
          : { tone: 'ok', icon: ShieldCheck, title: 'Ready to ride', text: 'Every check passed. Ride safely.' }

  return (
    // Container queries: one column inside a lesson, two columns when given more room.
    <div className="@container">
      <div className="grid gap-6 rounded-2xl border border-line bg-surface-sunken p-4 sm:p-5 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="space-y-4 self-start @4xl:sticky @4xl:top-20">
          <div className="bg-blueprint rounded-xl border border-line p-2">
            <MotorcycleSideView highlighted={activeItem.parts} title={`Motorcycle — ${activeItem.title}`} />
          </div>
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-ink">{activeItem.title}.</span> {activeItem.how}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">
                <span className="tabular font-mono text-ink">{done}</span> of {checklist.length} checked
              </span>
              <Button size="sm" variant="ghost" onClick={reset} leadingIcon={<RotateCcw className="size-4" />}>
                Reset
              </Button>
            </div>
            <ProgressBar value={done} max={checklist.length} tone={stops.length ? 'ignition' : 'ok'} label="Checklist progress" />
          </div>

          <div
            aria-live="polite"
            className={cn(
              'rounded-xl border p-4',
              verdict.tone === 'ok' && 'border-ok-500/40 bg-ok-950/60',
              verdict.tone === 'danger' && 'border-danger-500/40 bg-danger-950/60',
              verdict.tone === 'caution' && 'border-caution-500/40 bg-caution-950/60',
              verdict.tone === 'pending' && 'border-line bg-surface',
            )}
          >
            <p
              className={cn(
                'flex items-center gap-2 font-display text-lg font-semibold',
                verdict.tone === 'ok' && 'text-ok-400',
                verdict.tone === 'danger' && 'text-danger-400',
                verdict.tone === 'caution' && 'text-caution-400',
                verdict.tone === 'pending' && 'text-ink',
              )}
            >
              <verdict.icon className="size-5" aria-hidden /> {verdict.title}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{verdict.text}</p>
            {problems.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm">
                {problems.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => jumpTo(p.id)} className="text-left underline-offset-2 hover:underline">
                      <span className={p.severity === 'stop' ? 'text-danger-400' : 'text-caution-400'}>{p.severity === 'stop' ? 'Fix before riding' : 'Fix soon'}:</span>{' '}
                      <span className="text-ink">{p.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {checklistGroups.map((group) => (
            <section key={group} aria-labelledby={`group-${slug(group)}`}>
              <h3 id={`group-${slug(group)}`} className="mb-2 font-mono text-xs tracking-[0.16em] text-ink-subtle uppercase">
                {group}
              </h3>
              <ul className="space-y-2">
                {checklist
                  .filter((i) => i.group === group)
                  .map((item) => {
                    const r = results[item.id]
                    const expanded = open === item.id
                    return (
                      <li
                        key={item.id}
                        id={`check-${item.id}`}
                        onPointerEnter={() => setActive(item.id)}
                        onFocusCapture={() => setActive(item.id)}
                        className={cn(
                          'scroll-mt-24 rounded-xl border bg-surface p-3 transition-colors',
                          r === 'ok' && 'border-ok-500/40',
                          r === 'problem' && (item.severity === 'stop' ? 'border-danger-500/50' : 'border-caution-500/50'),
                          r === 'pending' && (active === item.id ? 'border-line-strong' : 'border-line'),
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-ink">{item.title}</p>
                            <p className="mt-0.5 text-sm text-ink-muted">{item.how}</p>
                          </div>
                          <div role="group" aria-label={item.title} className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              aria-pressed={r === 'ok'}
                              onClick={() => mark(item, 'ok')}
                              className={cn('flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors', r === 'ok' ? 'border-ok-500 bg-ok-500 text-bg' : 'border-line text-ink-muted hover:border-ok-500/60 hover:text-ok-400')}
                            >
                              <Check className="size-3.5" aria-hidden /> OK
                            </button>
                            <button
                              type="button"
                              aria-pressed={r === 'problem'}
                              onClick={() => mark(item, 'problem')}
                              className={cn('flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors', r === 'problem' ? 'border-danger-500 bg-danger-500 text-bg' : 'border-line text-ink-muted hover:border-danger-500/60 hover:text-danger-400')}
                            >
                              <AlertTriangle className="size-3.5" aria-hidden /> Problem
                            </button>
                          </div>
                        </div>

                        {r === 'problem' && (
                          <p className={cn('mt-2 rounded-lg px-3 py-2 text-sm', item.severity === 'stop' ? 'bg-danger-950/70 text-danger-400' : 'bg-caution-950/70 text-caution-400')}>
                            <span className="font-medium">{item.severity === 'stop' ? 'Don’t ride until fixed. ' : 'Fix soon. '}</span>
                            <span className="text-ink-muted">{item.ifProblem}</span>
                          </p>
                        )}

                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={`why-${item.id}`}
                          onClick={() => setOpen(expanded ? null : item.id)}
                          className="mt-2 flex items-center gap-1 text-xs text-ink-subtle hover:text-ink"
                        >
                          <ChevronDown className={cn('size-3.5 transition-transform', expanded && 'rotate-180')} aria-hidden /> Why it matters
                        </button>
                        {expanded && (
                          <div id={`why-${item.id}`} className="mt-1.5 space-y-1.5 text-sm text-ink-muted">
                            <p>{item.why}</p>
                            {item.lesson && (
                              <Link to={lessonPath('pre-ride', item.lesson)} className="inline-flex items-center gap-1 text-coolant-300 hover:text-coolant-200">
                                <BookOpen className="size-3.5" aria-hidden /> Learn how to check this
                              </Link>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
