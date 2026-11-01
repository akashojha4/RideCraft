import { useMotionValueEvent, useTransform } from 'motion/react'
import { useState } from 'react'
import { FourStrokeEngine } from '@/components/mechanics/FourStrokeEngine'
import { cycleAngle, strokeIndex, strokes } from '@/lib/mechanics/engine'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { useSimulationClock } from '@/hooks/useSimulationClock'
import { cn } from '@/lib/cn'
import { DiagramFrame } from '../DiagramFrame'

/** Crank speed at 1× playback: a full four-stroke cycle takes 8 seconds. */
const DEG_PER_SEC = 90

export default function EngineDiagram() {
  const clock = useSimulationClock()
  const crankAngle = useTransform(clock.time, (t) => t * DEG_PER_SEC)
  const [angle, setAngle] = useState(0)
  useMotionValueEvent(crankAngle, 'change', (a) => setAngle(Math.round(cycleAngle(a))))

  const current = strokeIndex(angle)
  const info = strokes[current]

  const jumpTo = (i: number) => {
    clock.pause()
    // Land a little into the stroke so the valve positions are clearly visible.
    clock.time.set((i * 180 + 60) / DEG_PER_SEC)
  }

  return (
    <DiagramFrame
      stage={<FourStrokeEngine crankAngle={crankAngle} stroke={current} className="mx-auto max-h-80" />}
      controls={
        <>
          <div role="group" aria-label="Jump to stroke" className="grid grid-cols-4 gap-1.5">
            {strokes.map((s, i) => (
              <button
                key={s.name}
                type="button"
                aria-pressed={current === i}
                onClick={() => jumpTo(i)}
                className={cn(
                  'h-9 rounded-lg border text-xs font-medium transition-colors sm:text-sm',
                  current === i
                    ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200'
                    : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                )}
              >
                {i + 1}. {s.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PlaybackControls clock={clock} />
            <dl className="flex gap-5">
              <Readout label="Crank angle" value={`${angle}°`} tone="coolant" />
              <Readout label="Piston" value={info.piston} />
            </dl>
          </div>
        </>
      }
      status={
        <>
          <span className="font-medium text-ink">
            {info.name} stroke · {info.valves}.
          </span>{' '}
          {info.text}
          <span className="mt-1 block text-xs text-ink-subtle">
            Shown thousands of times slower than reality: at an idle of about 1,400 RPM a full cycle takes under a tenth
            of a second. Valve timing simplified.
          </span>
        </>
      }
    />
  )
}
