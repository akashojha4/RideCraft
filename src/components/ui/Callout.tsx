import { AlertTriangle, Info, Lightbulb, ShieldAlert, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type CalloutTone = 'info' | 'tip' | 'safety' | 'mistake'

const config: Record<CalloutTone, { icon: LucideIcon; label: string; classes: string; iconClass: string }> = {
  info: {
    icon: Info,
    label: 'How it works',
    classes: 'border-coolant-500/30 bg-coolant-950/60',
    iconClass: 'text-coolant-400',
  },
  tip: {
    icon: Lightbulb,
    label: 'Rider tip',
    classes: 'border-ok-500/30 bg-ok-950/60',
    iconClass: 'text-ok-400',
  },
  safety: {
    icon: ShieldAlert,
    label: 'Safety',
    classes: 'border-danger-500/35 bg-danger-950/60',
    iconClass: 'text-danger-400',
  },
  mistake: {
    icon: AlertTriangle,
    label: 'Common mistake',
    classes: 'border-caution-500/30 bg-caution-950/60',
    iconClass: 'text-caution-400',
  },
}

export function Callout({
  tone,
  title,
  children,
  className,
}: {
  tone: CalloutTone
  title?: ReactNode
  children: ReactNode
  className?: string
}) {
  const { icon: Icon, label, classes, iconClass } = config[tone]
  return (
    <aside className={cn('flex gap-3 rounded-xl border p-4', classes, className)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', iconClass)} aria-hidden />
      <div className="min-w-0 space-y-1">
        <p className={cn('text-sm font-semibold', iconClass)}>{title ?? label}</p>
        <div className="text-sm leading-relaxed text-ink-muted">{children}</div>
      </div>
    </aside>
  )
}
