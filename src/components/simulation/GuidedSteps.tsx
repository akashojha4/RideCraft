import { ArrowLeft, ArrowRight, CircleCheck, CircleDashed, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { GuidedProgress } from '@/lib/simulation/guided'

interface StepText {
  id: string
  title: string
  instruction: string
  explanation: string
}

/** Step list, the current instruction, and — once the step is done — why it happened. */
export function GuidedSteps({
  steps,
  progress,
  onGoTo,
  onExit,
  children,
  className,
}: {
  steps: readonly StepText[]
  progress: GuidedProgress
  onGoTo: (index: number) => void
  onExit: () => void
  /** Extra feedback under the instruction (e.g. a mistake explained). */
  children?: ReactNode
  className?: string
}) {
  const i = progress.index
  const step = steps[i]
  const done = progress.done[i]
  const last = i === steps.length - 1
  return (
    <section aria-label="Guided steps" className={cn('rounded-2xl border border-coolant-500/30 bg-surface p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Step {i + 1} of {steps.length}
        </p>
        <Button size="sm" variant="ghost" className="h-11" onClick={onExit} leadingIcon={<X className="size-4" />}>
          Exit guide
        </Button>
      </div>
      <ol className="mt-3 flex flex-wrap gap-2" aria-label="Steps">
        {steps.map((s, n) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onGoTo(n)}
              aria-current={n === i ? 'step' : undefined}
              aria-label={`Step ${n + 1}: ${s.title}${progress.done[n] ? ' (done)' : ''}`}
              className={cn(
                'relative flex size-9 items-center justify-center rounded-full border text-xs before:absolute before:-inset-1 before:content-[""]',
                n === i ? 'border-coolant-400 text-ink' : 'border-line text-ink-subtle hover:text-ink',
              )}
            >
              {progress.done[n] ? <CircleCheck className="size-4 text-ok-400" aria-hidden /> : n + 1}
            </button>
          </li>
        ))}
      </ol>
      <h2 className="mt-4 text-lg font-semibold text-ink">{step.title}</h2>
      <p className="mt-1 leading-relaxed text-ink-muted">{step.instruction}</p>
      {children}
      <div aria-live="polite" className="mt-3">
        {done ? (
          <p className="flex gap-2 rounded-xl border border-ok-500/30 bg-ok-950/30 p-3 text-sm leading-relaxed text-ink">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok-400" aria-hidden />
            <span>{step.explanation}</span>
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-ink-subtle">
            <CircleDashed className="size-4" aria-hidden /> Waiting for you to do this step…
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" className="h-11" onClick={() => onGoTo(i - 1)} disabled={i === 0} leadingIcon={<ArrowLeft className="size-4" />}>
          Back
        </Button>
        <Button size="sm" variant={done ? 'primary' : 'secondary'} className="h-11" onClick={() => (last ? onExit() : onGoTo(i + 1))} leadingIcon={<ArrowRight className="size-4" />}>
          {last ? 'Finish' : done ? 'Next step' : 'Skip'}
        </Button>
      </div>
    </section>
  )
}
