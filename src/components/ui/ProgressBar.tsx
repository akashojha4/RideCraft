import { motion } from 'motion/react'
import { cn } from '@/lib/cn'
import { transition } from '@/lib/motion'

export function ProgressBar({
  value,
  max = 100,
  tone = 'ignition',
  label,
  className,
}: {
  value: number
  max?: number
  tone?: 'ignition' | 'coolant' | 'ok'
  /** Accessible name for the progress bar. */
  label: string
  className?: string
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const fill = { ignition: 'bg-ignition-500', coolant: 'bg-coolant-500', ok: 'bg-ok-500' }[tone]

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-overlay', className)}
    >
      <motion.div
        className={cn('h-full rounded-full', fill)}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={transition.slow}
      />
    </div>
  )
}
