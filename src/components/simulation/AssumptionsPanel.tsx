import { ChevronDown, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Assumption } from '@/lib/simulation/model'

/**
 * "Model limits": what the simulation simplifies. Collapsed by default; the one-line notice
 * that it is a simplified model is always visible.
 */
export function AssumptionsPanel({ assumptions, className }: { assumptions: readonly Assumption[]; className?: string }) {
  return (
    <details className={cn('group rounded-2xl border border-line bg-surface', className)}>
      <summary className="flex cursor-pointer list-none items-start gap-3 rounded-2xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ignition-500 [&::-webkit-details-marker]:hidden">
        <FlaskConical className="mt-0.5 size-5 shrink-0 text-coolant-400" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-ink">Model limits</span>
          <span className="block text-sm text-ink-muted">
            A simplified physics model for learning, not a prediction of how any real motorcycle will behave. Practise real riding only with qualified instruction.
          </span>
        </span>
        <ChevronDown className="mt-0.5 size-5 shrink-0 text-ink-subtle transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <ul className="space-y-3 border-t border-line px-4 py-4 text-sm">
        {assumptions.map((a) => (
          <li key={a.id} className="leading-relaxed">
            <span className="text-ink">{a.text}</span>
            {a.effect && <span className="block text-ink-muted">{a.effect}</span>}
          </li>
        ))}
      </ul>
    </details>
  )
}
