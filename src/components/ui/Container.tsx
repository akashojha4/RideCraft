import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const widths = {
  prose: 'max-w-3xl',
  default: 'max-w-7xl',
} as const

export function Container({
  width = 'default',
  className,
  ...props
}: { width?: keyof typeof widths } & ComponentProps<'div'>) {
  return <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widths[width], className)} {...props} />
}
