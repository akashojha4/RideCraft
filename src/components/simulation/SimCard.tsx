import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Titled panel used throughout the simulators. */
export function SimCard({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={cn('rounded-2xl border border-line bg-surface-sunken', className)}>
      <h2 className="border-b border-line px-4 py-2.5 font-mono text-[11px] tracking-[0.16em] text-ink-subtle uppercase">{title}</h2>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  )
}
