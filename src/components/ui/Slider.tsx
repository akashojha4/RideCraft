import { useId, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'

const fills = {
  ignition: 'var(--color-ignition-500)',
  coolant: 'var(--color-coolant-500)',
} as const

/**
 * Labelled range input. Rider inputs (lever pull, twist grip, pedal pressure) use the
 * default ignition tone, per the colour semantics.
 */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  valueText,
  hint,
  tone = 'ignition',
  className,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Human-readable value, shown and announced (e.g. "40 %"). */
  valueText?: string
  hint?: string
  tone?: keyof typeof fills
  className?: string
}) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {valueText && <span className="tabular font-mono text-xs text-ink-muted">{valueText}</span>}
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range"
        style={{ '--range-pct': `${pct}%`, '--range-fill': fills[tone] } as CSSProperties}
      />
      {hint && <p className="text-xs text-ink-subtle">{hint}</p>}
    </div>
  )
}
