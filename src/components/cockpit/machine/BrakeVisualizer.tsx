import { motion, type MotionValue } from 'motion/react'
import { cn } from '@/lib/cn'
import type { WheelBrake } from '@/lib/mechanics/braking'

/*
 * Front and rear disc brakes: each disc turns with its wheel, and the caliper's pads close on
 * it as the lever or pedal is applied. A locked wheel's disc stops turning while the
 * motorcycle slides on. Braking force is shown against the most the tyre can grip.
 */

function Disc({ label, input, brake, angle, r }: { label: string; input: number; brake: WheelBrake; angle: MotionValue<number>; r: number }) {
  const gap = 5 * (1 - Math.min(1, input * 4))
  const used = brake.grip > 0 ? Math.min(1, brake.force / brake.grip) : 0
  const status = brake.locked ? 'LOCKED' : brake.abs ? 'ABS' : input > 0 ? 'braking' : 'free'
  return (
    <figure data-brake={label.toLowerCase()} className="min-w-0 text-center">
      <svg viewBox="-70 -70 140 140" className="mx-auto w-full max-w-40" role="img" aria-label={`${label} brake: ${Math.round(input * 100)} % applied, ${status}`}>
        <motion.g style={{ rotate: angle }}>
          <circle r={r} className="fill-surface-raised stroke-ink-subtle" strokeWidth={2} />
          <circle r={r * 0.45} className="fill-surface-sunken stroke-line-strong" strokeWidth={1.5} />
          {Array.from({ length: 10 }, (_, k) => (
            <circle key={k} cx={r * 0.72 * Math.cos((k * Math.PI) / 5)} cy={r * 0.72 * Math.sin((k * Math.PI) / 5)} r={3} className="fill-surface-sunken" />
          ))}
          <line x1={0} y1={0} x2={0} y2={-r * 0.45} strokeWidth={3} className="stroke-ink-muted" />
        </motion.g>
        {/* Caliper over the top of the disc, pads either side of it */}
        <g transform={`translate(0 ${-r + 6})`}>
          <rect x={-22} y={-16} width={44} height={22} rx={5} className={cn('stroke-line-strong', brake.locked ? 'fill-danger-950' : 'fill-surface-overlay')} strokeWidth={1.5} />
          <rect x={-16} y={-6 - gap} width={32} height={5} rx={1.5} className={input > 0 ? 'fill-danger-400' : 'fill-ink-subtle'} />
          <rect x={-16} y={8 + gap} width={32} height={5} rx={1.5} className={input > 0 ? 'fill-danger-400' : 'fill-ink-subtle'} />
        </g>
      </svg>
      <figcaption className="mt-1 space-y-0.5 font-mono text-[11px]">
        <p className="text-xs text-ink">{label}</p>
        <p className={cn(brake.locked ? 'text-danger-400' : brake.abs ? 'text-caution-400' : 'text-ink-muted')}>{status}</p>
        <p className="text-ink-muted">
          {Math.round(brake.force)} of {Math.round(brake.grip)} N
        </p>
        <div aria-hidden className="mx-auto h-1.5 w-24 overflow-hidden rounded-full bg-surface-overlay">
          <div className={cn('h-full', brake.locked ? 'bg-danger-400' : used > 0.9 ? 'bg-caution-400' : 'bg-coolant-400')} style={{ width: `${used * 100}%` }} />
        </div>
      </figcaption>
    </figure>
  )
}

export function BrakeVisualizer({
  front,
  rear,
  frontInput,
  rearInput,
  frontAngle,
  rearAngle,
}: {
  front: WheelBrake
  rear: WheelBrake
  frontInput: number
  rearInput: number
  frontAngle: MotionValue<number>
  rearAngle: MotionValue<number>
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Disc label="Front" input={frontInput} brake={front} angle={frontAngle} r={58} />
      <Disc label="Rear" input={rearInput} brake={rear} angle={rearAngle} r={46} />
    </div>
  )
}
