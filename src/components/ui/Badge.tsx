import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export type Tone = 'neutral' | 'ignition' | 'coolant' | 'ok' | 'caution' | 'danger'

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-raised text-ink-muted border-line',
  ignition: 'bg-ignition-950 text-ignition-300 border-ignition-500/30',
  coolant: 'bg-coolant-950 text-coolant-300 border-coolant-500/30',
  ok: 'bg-ok-950 text-ok-400 border-ok-500/30',
  caution: 'bg-caution-950 text-caution-400 border-caution-500/30',
  danger: 'bg-danger-950 text-danger-400 border-danger-500/30',
}

export function Badge({ tone = 'neutral', className, ...props }: { tone?: Tone } & ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
