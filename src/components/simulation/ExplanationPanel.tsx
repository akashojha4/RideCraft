import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { Tone } from '@/lib/simulation/model'

const box: Record<Tone, string> = {
  danger: 'border-danger-500/40 bg-danger-950/40',
  caution: 'border-caution-500/40 bg-caution-950/30',
  ok: 'border-ok-500/30 bg-ok-950/30',
  info: 'border-line bg-surface',
}
const heading: Record<Tone, string> = {
  danger: 'text-danger-400',
  caution: 'text-caution-400',
  ok: 'text-ok-400',
  info: 'text-ink',
}

/** "What is happening": the simulation's current state in words, announced to screen readers as it changes. */
export function ExplanationPanel({ tone, title, text, children, className }: { tone: Tone; title: string; text: string; children?: ReactNode; className?: string }) {
  return (
    <section aria-live="polite" aria-label="What is happening" className={cn('rounded-2xl border p-5', box[tone], className)}>
      <h2 className={cn('text-lg font-semibold', heading[tone])}>{title}</h2>
      <p className="mt-1 leading-relaxed text-ink-muted">{text}</p>
      {children}
    </section>
  )
}
