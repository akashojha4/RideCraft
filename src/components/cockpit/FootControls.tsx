import type { LeverAction } from '@/lib/mechanics/gearbox'
import { cn } from '@/lib/cn'
import { LeverHit } from './LeverHit'

/*
 * The foot controls, seen from the rider's seat looking down past the knee: footpeg, the
 * lever pivot behind it and the toe piece or pedal in front (up on screen).
 */

const pct = (x: number) => `${Math.round(x * 100)} %`
const gearName = (g: number) => (g === 0 ? 'N' : String(g))

/**
 * Left foot: gear lever and the gear-position indicator. `pattern` lists the positions from
 * the bottom of the lever's travel to the top — 1-N-2-3-4-5 by default, so first is a press
 * down and every other gear a lift.
 */
export function GearSelector({
  gear = 0,
  pattern = [1, 0, 2, 3, 4, 5],
  kick = null,
  onShift,
  className,
}: {
  gear?: number
  pattern?: readonly number[]
  /** The last shift: the toe piece gives a brief nudge in its direction each time it changes. */
  kick?: { dir: LeverAction; at: number } | null
  /** Tapping above the toe piece lifts it; below presses it down. */
  onShift?: (action: LeverAction) => void
  className?: string
}) {
  return (
    <svg viewBox="0 30 280 110" className={cn('w-full', className)} role="img" aria-label={`Gear lever, left foot: ${gear === 0 ? 'neutral' : `gear ${gear}`}. Pattern ${pattern.map(gearName).join('-')}`}>
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Engine case edge, pivot shaft and linkage */}
        <path d="M0,40 L70,30 L90,150" fill="none" strokeWidth={2} className="stroke-line" />
        <circle cx={62} cy={92} r={9} className="fill-surface-raised stroke-ink-subtle" strokeWidth={1.5} />
        {/* Footpeg */}
        <rect x={40} y={112} width={110} height={18} rx={9} className="fill-surface-overlay stroke-ink-subtle" strokeWidth={1.5} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={56 + i * 15} y1={115} x2={56 + i * 15} y2={127} strokeWidth={2} className="stroke-surface-raised" />
        ))}
        {/* Gear lever arm and toe piece, ahead of the peg */}
        <g key={kick?.at} className={kick ? (kick.dir === 'down' ? 'gear-press' : 'gear-lift') : undefined} style={{ transformOrigin: '62px 92px' }}>
          <path d="M62,92 L150,58" strokeWidth={8} className="stroke-coolant-400" />
          <rect x={142} y={48} width={34} height={14} rx={7} transform="rotate(-21 159 55)" className="fill-coolant-500" />
        </g>
        {onShift && (
          <>
            <rect x={110} y={30} width={110} height={26} fill="transparent" className="cursor-pointer" onPointerDown={() => onShift('up')} aria-hidden />
            <rect x={110} y={62} width={110} height={40} fill="transparent" className="cursor-pointer" onPointerDown={() => onShift('down')} aria-hidden />
          </>
        )}
      </g>
    </svg>
  )
}

/** Right foot: rear brake pedal. `pressure` 0 – 1. */
export function RearBrakeControl({ pressure = 0, onChange, onRelease, className }: { pressure?: number; onChange?: (v: number) => void; onRelease?: () => void; className?: string }) {
  // The pedal tip dips as it is pressed.
  const dip = pressure * 22
  return (
    <svg viewBox="0 30 280 110" className={cn('w-full', className)} role={onChange ? 'group' : 'img'} aria-label={`Rear brake pedal, right foot: ${pct(pressure)} pressed`}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M280,40 L210,30 L190,150" fill="none" strokeWidth={2} className="stroke-line" />
        {/* Master cylinder and reservoir */}
        <rect x={196} y={50} width={20} height={34} rx={4} className="fill-surface-sunken stroke-line-strong" strokeWidth={1.5} />
        <circle cx={218} cy={92} r={9} className="fill-surface-raised stroke-ink-subtle" strokeWidth={1.5} />
        {/* Footpeg */}
        <rect x={130} y={112} width={110} height={18} rx={9} className="fill-surface-overlay stroke-ink-subtle" strokeWidth={1.5} />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={146 + i * 15} y1={115} x2={146 + i * 15} y2={127} strokeWidth={2} className="stroke-surface-raised" />
        ))}
        {/* Pedal arm and pad, ahead of the peg */}
        <path d={`M218,92 L128,${58 + dip}`} strokeWidth={8} className="stroke-danger-400" />
        <rect x={104} y={48 + dip} width={34} height={16} rx={6} transform={`rotate(18 121 ${56 + dip})`} className="fill-danger-400" />
        {/* Pressure bar */}
        <rect x={14} y={58} width={14} height={72} rx={4} className="fill-surface-sunken stroke-line" strokeWidth={1.5} />
        <rect x={16} y={60 + 68 * (1 - pressure)} width={10} height={68 * pressure} rx={3} className="fill-danger-400" />
      </g>
      {onChange && <LeverHit d="M84,30 H244 V140 H84 Z" label="Rear brake pedal" value={pressure} valueText={`${pct(pressure)} pressed`} travel={40} onChange={onChange} onRelease={onRelease} />}
    </svg>
  )
}

/** The gear-position indicator: the pattern from the top of the lever's travel to the bottom, current gear lit. */
export function GearLadder({ gear = 0, pattern = [1, 0, 2, 3, 4, 5], className }: { gear?: number; pattern?: readonly number[]; className?: string }) {
  return (
    <ol aria-label={`Gear pattern ${pattern.map(gearName).join('-')}, top to bottom reversed`} className={cn('flex flex-col gap-0.5 font-mono text-xs', className)}>
      {[...pattern].reverse().map((g) => (
        <li
          key={g}
          aria-current={g === gear ? 'true' : undefined}
          className={cn(
            'w-8 rounded border text-center leading-5',
            g === gear ? (g === 0 ? 'border-ok-400 bg-ok-950 text-ok-400' : 'border-coolant-400 bg-coolant-950 text-coolant-300') : 'border-line bg-surface-sunken text-ink-subtle',
          )}
        >
          {gearName(g)}
        </li>
      ))}
    </ol>
  )
}
