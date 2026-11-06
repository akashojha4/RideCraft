import { useMotionValueEvent, type MotionValue } from 'motion/react'
import { useState } from 'react'
import type { Steer } from '@/hooks/useCockpitControls'
import { cn } from '@/lib/cn'
import { KERB_MARGIN, ROAD_HALF, type WorldPose } from '@/lib/simulation/cockpitWorld'

/*
 * The road from above, for a scenario that steers: both lanes, the kerbs, the path ridden and
 * the motorcycle, with the three-position handlebar beside it. Travel starts left to right;
 * the right of the motorcycle is down the page.
 */

const X_FROM = -4
const X_TO = 14
const PAD = 1.2
const STEERS: { value: Steer; label: string }[] = [
  { value: -1, label: 'Full lock left' },
  { value: 0, label: 'Straight' },
  { value: 1, label: 'Full lock right' },
]

export function TopDownMap({ pose, steer, onSteer, className }: { pose: MotionValue<WorldPose | null>; steer: Steer; onSteer: (s: Steer) => void; className?: string }) {
  const [p, setP] = useState(() => pose.get())
  useMotionValueEvent(pose, 'change', (v) => setP(v))
  if (!p) return null
  const trail = p.trail.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(' ')
  const deg = (p.heading * 180) / Math.PI
  const kerbClose = ROAD_HALF - Math.abs(p.y) < KERB_MARGIN + 0.4

  return (
    <section aria-label="U-turn: the road from above and the handlebar" data-panel="top-down" className={cn('grid gap-4 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]', className)}>
      <div>
        <h2 className="font-semibold text-ink">From above</h2>
        <svg viewBox={`${X_FROM} ${-ROAD_HALF - PAD} ${X_TO - X_FROM} ${2 * (ROAD_HALF + PAD)}`} className="mt-2 w-full max-w-xl rounded-xl bg-surface-sunken" role="img" aria-label={`Top-down view: heading ${Math.round(deg)}°, ${(ROAD_HALF - Math.abs(p.y)).toFixed(1)} m from the kerb.`} data-heading-deg={Math.round(deg)}>
          <rect x={X_FROM} y={-ROAD_HALF} width={X_TO - X_FROM} height={2 * ROAD_HALF} className="fill-surface-overlay" />
          <line x1={X_FROM} x2={X_TO} y1={-ROAD_HALF} y2={-ROAD_HALF} strokeWidth={0.12} className={kerbClose && p.y < 0 ? 'stroke-danger-400' : 'stroke-ink-subtle'} />
          <line x1={X_FROM} x2={X_TO} y1={ROAD_HALF} y2={ROAD_HALF} strokeWidth={0.12} className={kerbClose && p.y > 0 ? 'stroke-danger-400' : 'stroke-ink-subtle'} />
          <line x1={X_FROM} x2={X_TO} y1={0} y2={0} strokeWidth={0.08} strokeDasharray="1 1" className="stroke-ink-muted" />
          <polyline data-trail points={trail} fill="none" strokeWidth={0.12} strokeLinecap="round" strokeLinejoin="round" className="stroke-coolant-400" />
          <g transform={`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${deg.toFixed(1)})`}>
            <path d="M1.1,0 L-0.9,-0.4 L-0.6,0 L-0.9,0.4 Z" className="fill-ignition-400" />
          </g>
        </svg>
        <p className="mt-2 text-xs text-ink-subtle">The road is 7 m wide. Blue: your path. Orange: the motorcycle, pointing the way it faces.</p>
      </div>
      <div role="group" aria-label="Handlebar" className="flex flex-col gap-2">
        <h2 className="font-semibold text-ink">Handlebar</h2>
        {STEERS.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={steer === o.value}
            onClick={() => onSteer(o.value)}
            className={cn('min-h-11 rounded-xl border px-3 text-sm', steer === o.value ? 'border-coolant-500/60 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}
          >
            {o.label}
          </button>
        ))}
        <p className="text-xs text-ink-subtle">Keys: ← / → move it one position.</p>
        <p className="font-mono text-xs text-ink-muted" data-lean>
          Lean {Math.abs(p.lean).toFixed(0)}°
        </p>
      </div>
    </section>
  )
}
