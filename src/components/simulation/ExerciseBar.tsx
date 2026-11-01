import { Check, RotateCcw, Target, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { Exercise, Verdict } from '@/lib/simulation/exercises'

/** Exercise picker, the active exercise's brief, and its verdict. */
export function ExerciseBar<E extends Exercise>({
  exercises,
  active,
  verdict,
  onStart,
  onFreeRide,
  extra,
}: {
  exercises: E[]
  active: E | null
  verdict: Verdict
  onStart: (ex: E) => void
  onFreeRide: () => void
  /** Optional extra content under the brief (e.g. live metrics). */
  extra?: ReactNode
}) {
  const chip = (pressed: boolean) =>
    cn('h-8 rounded-lg border px-3 text-sm', pressed ? 'border-ignition-500/50 bg-ignition-950 text-ignition-200' : 'border-line text-ink-muted hover:text-ink')
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-ink">
          <Target className="size-4 text-ignition-400" aria-hidden /> Exercises
        </span>
        <button type="button" aria-pressed={!active} onClick={onFreeRide} className={chip(!active)}>
          Free ride
        </button>
        {exercises.map((ex, i) => (
          <button key={ex.id} type="button" aria-pressed={active?.id === ex.id} onClick={() => onStart(ex)} className={chip(active?.id === ex.id)}>
            {i + 1}. {ex.title}
          </button>
        ))}
      </div>
      {active && (
        <div className="mt-4 grid gap-4 border-t border-line pt-4 md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-ink">{active.title}</h2>
            <p className="text-ink-muted">{active.goal}</p>
            <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink-subtle">
              {active.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            {extra}
          </div>
          <div className="flex items-start gap-2 md:flex-col md:items-end">
            <Button size="sm" variant="secondary" onClick={() => onStart(active)} leadingIcon={<RotateCcw className="size-4" />}>
              Try again
            </Button>
          </div>
          <div aria-live="polite" className="md:col-span-2">
            {verdict && (
              <p className={cn('flex items-start gap-2 rounded-xl border p-3 text-sm', verdict.result === 'pass' ? 'border-ok-500/40 bg-ok-950/60 text-ok-400' : 'border-danger-500/40 bg-danger-950/60 text-danger-400')}>
                {verdict.result === 'pass' ? <Check className="mt-0.5 size-4 shrink-0" aria-hidden /> : <X className="mt-0.5 size-4 shrink-0" aria-hidden />}
                <span>
                  <span className="font-semibold">{verdict.result === 'pass' ? 'Passed. ' : 'Not this time. '}</span>
                  <span className="text-ink-muted">{verdict.text}</span>
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
