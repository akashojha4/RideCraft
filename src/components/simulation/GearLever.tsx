import { ArrowDown, ArrowUp, Check, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { GearLeverControl } from '@/hooks/useGearLever'
import { cn } from '@/lib/cn'

/** Lever positions from top to bottom, as on a pattern diagram. */
const PATTERN = [5, 4, 3, 2, 0, 1]

/** Gear pattern, lever buttons, auto-clutch switches and the last lever message. */
export function GearLever({ control: c }: { control: GearLeverControl }) {
  return (
    <>
      <div className="flex items-start gap-4">
        <ol aria-label="Gear pattern" className="flex flex-col gap-1">
          {PATTERN.map((g) => (
            <li
              key={g}
              aria-current={c.gear === g ? 'true' : undefined}
              className={cn(
                'flex size-8 items-center justify-center rounded-md border font-mono text-sm',
                c.gear === g ? (g === 0 ? 'border-ok-500/60 bg-ok-950 text-ok-400' : 'border-coolant-500/60 bg-coolant-950 text-coolant-200') : 'border-line text-ink-subtle',
              )}
            >
              {g === 0 ? 'N' : g}
            </li>
          ))}
        </ol>
        <div className="flex flex-1 flex-col gap-2">
          <Button size="sm" variant="secondary" onClick={() => c.lever('up')} disabled={c.busy} leadingIcon={<ArrowUp className="size-4" />}>
            Lift (shift up)
          </Button>
          <Button size="sm" variant="secondary" onClick={() => c.lever('half')} disabled={c.busy}>
            Half-shift to N
          </Button>
          <Button size="sm" variant="secondary" onClick={() => c.lever('down')} disabled={c.busy} leadingIcon={<ArrowDown className="size-4" />}>
            Press (shift down)
          </Button>
          <div className="mt-1 flex flex-col gap-1.5">
            {(
              [
                [c.autoClutch, c.setAutoClutch, 'Auto-clutch'],
                [c.blip, c.setBlip, 'Blip on downshifts'],
              ] as const
            ).map(([on, set, label]) => (
              <button
                key={label}
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => set(!on)}
                disabled={label === 'Blip on downshifts' && !c.autoClutch}
                className={cn('flex h-8 items-center justify-between rounded-lg border px-3 text-xs disabled:opacity-40', on ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted')}
              >
                {label} <span className="font-mono">{on ? 'ON' : 'OFF'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {c.notice && (
        <p className={cn('mt-3 flex items-start gap-2 text-sm', c.notice.warn ? 'text-caution-400' : 'text-ink-muted')} aria-live="polite">
          {c.notice.warn ? <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> : <Check className="mt-0.5 size-4 shrink-0 text-ok-400" aria-hidden />} {c.notice.text}
        </p>
      )}
    </>
  )
}
