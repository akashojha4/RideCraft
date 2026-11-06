import { ArrowDown, ArrowRight } from 'lucide-react'
import { Fragment } from 'react'
import { cn } from '@/lib/cn'
import { STAGES, chainComponents, stageLabels, type CausalLink, type Stage } from '@/lib/simulation/model'

/**
 * Rider input → mechanism → power transfer → vehicle response, with live values. Pointing
 * at or focusing a stage reports the components it involves, so the diagram can highlight
 * them. Stacks vertically on narrow screens.
 */
export function CauseEffectChain<C extends string>({
  chain,
  active,
  onActiveChange,
  className,
}: {
  chain: readonly CausalLink<C>[]
  /** The stage currently highlighted, if any. */
  active?: Stage | null
  /** Called with the stage (and its components) the learner points at, or null. */
  onActiveChange?: (stage: Stage | null, components: C[]) => void
  className?: string
}) {
  const set = (stage: Stage | null) => onActiveChange?.(stage, stage ? chainComponents(chain, stage) : [])
  return (
    <ol aria-label="Cause and effect" className={cn('flex flex-col gap-2 md:flex-row md:items-stretch', className)}>
      {STAGES.map((stage, i) => {
        const links = chain.filter((l) => l.stage === stage)
        return (
          <Fragment key={stage}>
            {i > 0 && (
              <li aria-hidden className="flex items-center justify-center text-ink-subtle">
                <ArrowDown className="size-4 md:hidden" />
                <ArrowRight className="hidden size-4 md:block" />
              </li>
            )}
            <li className="min-w-0 md:flex-1">
              <button
                type="button"
                aria-pressed={active === stage}
                onMouseEnter={() => set(stage)}
                onMouseLeave={() => set(null)}
                onFocus={() => set(stage)}
                onBlur={() => set(null)}
                onClick={() => set(active === stage ? null : stage)}
                className={cn(
                  'h-full w-full rounded-xl border p-3 text-left transition-colors',
                  active === stage ? 'border-ignition-500/60 bg-ignition-950/40' : 'border-line bg-surface-sunken hover:border-line-strong',
                )}
              >
                <span className="block text-xs font-medium tracking-wide text-ink-subtle uppercase">{stageLabels[stage]}</span>
                <dl className="mt-1.5 space-y-1">
                  {links.map((l) => (
                    <div key={l.label} className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
                      <dt className="text-ink-muted">{l.label}</dt>
                      <dd className="tabular font-mono text-ink">{l.value}</dd>
                    </div>
                  ))}
                </dl>
              </button>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
