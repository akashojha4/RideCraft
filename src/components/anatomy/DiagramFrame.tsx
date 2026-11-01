import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Standard frame for an interactive mechanical diagram: a blueprint stage, then a
 * controls area and an optional status line.
 */
export function DiagramFrame({
  stage,
  controls,
  status,
  className,
}: {
  stage: ReactNode
  controls?: ReactNode
  status?: ReactNode
  className?: string
}) {
  return (
    <figure className={cn('overflow-hidden rounded-2xl border border-line bg-surface-sunken', className)}>
      <div className="bg-blueprint p-3 sm:p-5">{stage}</div>
      {controls && <div className="space-y-4 border-t border-line p-4 sm:p-5">{controls}</div>}
      {status && (
        <figcaption className="border-t border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink-muted sm:px-5" aria-live="polite">
          {status}
        </figcaption>
      )}
    </figure>
  )
}

/** Small text label inside a diagram SVG. */
export function DiagramLabel({
  x,
  y,
  children,
  anchor = 'start',
  tone = 'muted',
}: {
  x: number
  y: number
  children: ReactNode
  anchor?: 'start' | 'middle' | 'end'
  tone?: 'muted' | 'coolant' | 'ignition'
}) {
  const fill = { muted: 'fill-ink-muted', coolant: 'fill-coolant-300', ignition: 'fill-ignition-300' }[tone]
  return (
    <text x={x} y={y} textAnchor={anchor} className={cn('font-mono text-[11px]', fill)}>
      {children}
    </text>
  )
}
