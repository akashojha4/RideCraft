import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { SimulationClock } from '@/hooks/useSimulationClock'
import { cn } from '@/lib/cn'
import { simulationSpeeds } from '@/lib/motion'

/** Play / pause, slow-motion and reset controls for a `useSimulationClock` clock. */
export function PlaybackControls({
  clock,
  onReset = clock.reset,
  showPlay = true,
  className,
}: {
  clock: SimulationClock
  /** Replaces the default reset (e.g. to also reset simulator progress). */
  onReset?: () => void
  showPlay?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {showPlay && (
        <Button
          size="sm"
          variant={clock.playing ? 'secondary' : 'primary'}
          onClick={clock.toggle}
          leadingIcon={clock.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          className="w-24"
        >
          {clock.playing ? 'Pause' : 'Play'}
        </Button>
      )}

      <div role="group" aria-label="Playback speed" className="flex rounded-xl border border-line bg-surface-sunken p-0.5">
        {simulationSpeeds.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={clock.speed === s}
            onClick={() => clock.setSpeed(s)}
            className={cn(
              'tabular h-7 rounded-[10px] px-2.5 font-mono text-xs transition-colors',
              clock.speed === s ? 'bg-surface-overlay text-ink' : 'text-ink-subtle hover:text-ink',
            )}
          >
            {s}×
          </button>
        ))}
      </div>

      <Button size="sm" variant="ghost" onClick={onReset} leadingIcon={<RotateCcw className="size-4" />}>
        Reset
      </Button>
    </div>
  )
}
