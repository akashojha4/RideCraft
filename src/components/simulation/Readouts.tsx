import type { ReactNode } from 'react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'

/** A labelled numeric or text value from a simulation. */
export function Readout({
  label,
  value,
  tone = 'ink',
  className,
}: {
  label: string
  value: ReactNode
  tone?: 'ink' | 'coolant' | 'ok' | 'caution' | 'danger'
  className?: string
}) {
  const color = {
    ink: 'text-ink',
    coolant: 'text-coolant-300',
    ok: 'text-ok-400',
    caution: 'text-caution-400',
    danger: 'text-danger-400',
  }[tone]
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-[11px] tracking-wide text-ink-subtle uppercase">{label}</dt>
      <dd className={cn('tabular mt-0.5 truncate font-mono text-sm', color)}>{value}</dd>
    </div>
  )
}

/** A labelled 0–1 quantity shown as a bar (forces, flow, pressure). */
export function Meter({
  label,
  value,
  valueText,
  tone = 'coolant',
}: {
  label: string
  value: number
  valueText?: string
  tone?: 'coolant' | 'ok' | 'ignition'
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-2 text-[11px] tracking-wide text-ink-subtle uppercase">
        <span>{label}</span>
        <span className="tabular font-mono normal-case">{valueText ?? `${Math.round(value * 100)} %`}</span>
      </div>
      <ProgressBar value={value * 100} tone={tone} label={label} />
    </div>
  )
}
