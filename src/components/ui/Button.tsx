import type { ComponentProps, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'coolant'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap select-none ' +
  'transition-[background-color,color,border-color,box-shadow,transform] duration-200 ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45'

const variants: Record<Variant, string> = {
  primary: 'bg-ignition-500 text-bg hover:bg-ignition-400 hover:shadow-glow-ignition',
  coolant: 'bg-coolant-500 text-bg hover:bg-coolant-400 hover:shadow-glow-coolant',
  secondary: 'bg-surface-raised text-ink border border-line hover:bg-surface-overlay hover:border-line-strong',
  outline: 'border border-line-strong text-ink hover:border-ignition-500/70 hover:text-ignition-300',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface-raised',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
}

interface StyleProps {
  variant?: Variant
  size?: Size
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

function buttonClasses({ variant = 'primary', size = 'md' }: StyleProps = {}, className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

export function Button({
  variant,
  size,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = 'button',
  ...props
}: StyleProps & ComponentProps<'button'>) {
  return (
    <button type={type} className={buttonClasses({ variant, size }, className)} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  )
}

/** A router link styled as a button. */
export function ButtonLink({
  variant,
  size,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: StyleProps & LinkProps) {
  return (
    <Link className={buttonClasses({ variant, size }, className)} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  )
}
