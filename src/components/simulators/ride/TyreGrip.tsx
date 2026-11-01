import { CircleAlert, CircleCheck, OctagonX } from 'lucide-react'
import { frontShare } from '@/lib/mechanics/braking'
import type { PowertrainState } from '@/lib/mechanics/powertrain'
import { cn } from '@/lib/cn'

/*
 * Each tyre's "grip budget": the braking force it is producing against the most it can
 * give before it locks (μ × the load on it right now). The budget moves with the load
 * transfer — watch the front grow and the rear shrink as you brake.
 */

function Budget({ name, share, force, grip, locked, abs }: { name: string; share: number; force: number; grip: number; locked: boolean; abs: boolean }) {
  const used = grip > 0 ? Math.min(1, force / grip) : 0
  const near = !locked && used > 0.88
  const status = locked ? 'Locked' : abs ? 'ABS holding' : near ? 'Near the limit' : force > 1 ? 'Gripping' : 'Rolling'
  const Icon = locked ? OctagonX : near || abs ? CircleAlert : CircleCheck
  return (
    <div className="space-y-1.5" data-tyre={name.toLowerCase()}>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-ink">{name} tyre</span>
        <span className="tabular font-mono text-xs text-ink-muted">{Math.round(share * 100)} % of weight</span>
      </div>
      <div role="meter" aria-label={`${name} tyre grip used`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(used * 100)} className="h-2.5 w-full overflow-hidden rounded-full bg-surface-overlay">
        <div className={cn('h-full rounded-full', locked ? 'bg-danger-500' : near ? 'bg-caution-500' : 'bg-ignition-500')} style={{ width: `${used * 100}%` }} />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={cn('flex items-center gap-1', locked ? 'text-danger-400' : near || abs ? 'text-caution-400' : 'text-ink-muted')}>
          <Icon className="size-3.5" aria-hidden /> {status}
        </span>
        <span className="tabular font-mono text-ink-subtle">
          {Math.round(force).toLocaleString('en')} / {Math.round(grip).toLocaleString('en')} N
        </span>
      </div>
    </div>
  )
}

export function TyreGrip({ state }: { state: PowertrainState }) {
  const share = frontShare(state.loadAccel)
  const { front, rear } = state.brakes
  return (
    <div className="space-y-4">
      <Budget name="Front" share={share} {...front} />
      <Budget name="Rear" share={1 - share} {...rear} />
    </div>
  )
}
