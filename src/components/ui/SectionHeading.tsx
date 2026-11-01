import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-xs font-medium tracking-[0.18em] text-ignition-400 uppercase', className)}>
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-3', align === 'center' && 'items-center text-center', className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Heading
        className={cn(
          'font-semibold text-ink',
          Heading === 'h1' ? 'text-4xl sm:text-5xl' : Heading === 'h2' ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl',
        )}
      >
        {title}
      </Heading>
      {description && <p className="max-w-2xl text-base text-ink-muted sm:text-lg">{description}</p>}
    </div>
  )
}
