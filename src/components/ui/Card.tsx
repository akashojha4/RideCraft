import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export function Card({ interactive = false, className, ...props }: { interactive?: boolean } & ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-card',
        interactive &&
          'transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-raised',
        className,
      )}
      {...props}
    />
  )
}
