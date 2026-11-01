import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

/** The RideCraft mark: a stylised wheel/gear with an ignition-orange hub. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-surface-raised" />
      <circle cx="16" cy="16" r="9" fill="none" className="stroke-ignition-500" strokeWidth="3" />
      <circle cx="16" cy="16" r="2.5" className="fill-ignition-500" />
      <path
        d="M16 7v4M16 21v4M7 16h4M21 16h4"
        className="stroke-ignition-500"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('group flex items-center gap-2.5', className)} aria-label="RideCraft home">
      <LogoMark className="transition-transform duration-500 group-hover:rotate-90" />
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        Ride<span className="text-ignition-500">Craft</span>
      </span>
    </Link>
  )
}
