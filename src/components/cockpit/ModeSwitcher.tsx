import { Bike, Cog, Columns3, Route } from 'lucide-react'
import { cn } from '@/lib/cn'

export type CockpitMode = 'rider' | 'machine' | 'road' | 'split'

const MODES: { id: CockpitMode; label: string; hint: string; icon: typeof Bike }[] = [
  { id: 'rider', label: 'Rider view', hint: 'The cockpit and the road ahead', icon: Bike },
  { id: 'machine', label: 'Machine view', hint: 'Inside the engine, clutch, gearbox, chain and brakes', icon: Cog },
  { id: 'road', label: 'Road view', hint: 'What the motorcycle does on the road', icon: Route },
  { id: 'split', label: 'Split view', hint: 'All three perspectives together', icon: Columns3 },
]

/** Switches the layout; the simulation carries on unchanged. */
export function ModeSwitcher({ mode, onChange, className }: { mode: CockpitMode; onChange: (m: CockpitMode) => void; className?: string }) {
  return (
    <div role="group" aria-label="View mode" className={cn('flex flex-wrap gap-1 rounded-2xl border border-line bg-surface p-1', className)}>
      {MODES.map(({ id, label, hint, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={mode === id}
          title={hint}
          onClick={() => onChange(id)}
          className={cn('flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm whitespace-nowrap', mode === id ? 'bg-surface-overlay text-ink' : 'text-ink-muted hover:text-ink')}
        >
          <Icon className="size-4" aria-hidden /> {label}
        </button>
      ))}
    </div>
  )
}
