import { useEffect, useState } from 'react'
import type { LeverAction } from '@/lib/mechanics/gearbox'
import { cn } from '@/lib/cn'
import { LeverHit } from './LeverHit'

/*
 * The foot controls, seen from the rider's seat looking down past the knee: footpeg, the
 * lever pivot behind it and the toe piece or pedal in front (up on screen).
 */

const pct = (x: number) => `${Math.round(x * 100)} %`
const gearName = (g: number) => (g === 0 ? 'N' : String(g))

/** How long a shift is held on screen: the toe piece stays lifted or pressed, with the boot on it. */
const SHIFT_HOLD_MS = 700
const KICK_CLASS: Record<LeverAction, string> = { up: 'gear-lift', down: 'gear-press', half: 'gear-half' }

/**
 * Left foot: gear lever and the gear-position indicator. `pattern` lists the positions from
 * the bottom of the lever's travel to the top — 1-N-2-3-4-5 by default, so first is a press
 * down and every other gear a lift.
 */
export function GearSelector({
  gear = 0,
  pattern = [1, 0, 2, 3, 4, 5],
  kick,
  onShift,
  className,
}: {
  gear?: number
  pattern?: readonly number[]
  /**
   * The last shift: the toe piece swings that way and holds there for a moment, with the rider's
   * boot on it. Left out (a demonstration, a static picture), a change of `gear` is shown the same way.
   */
  kick?: { dir: LeverAction; at: number } | null
  /** Tapping above the toe piece lifts it; below presses it down. */
  onShift?: (action: LeverAction) => void
  className?: string
}) {
  // Without a `kick`, work out the direction of a gear change from where it sits in the pattern.
  const [seen, setSeen] = useState({ gear, kick: null as { dir: LeverAction; at: number } | null })
  if (kick === undefined && gear !== seen.gear) {
    const from = pattern.indexOf(seen.gear)
    const to = pattern.indexOf(gear)
    // First to neutral is the gentle half-lift; otherwise up the pattern is a lift, down a press.
    const dir: LeverAction = seen.gear === 1 && gear === 0 ? 'half' : to > from ? 'up' : 'down'
    setSeen({ gear, kick: { dir, at: (seen.kick?.at ?? 0) + 1 } })
  }
  if (kick === undefined) kick = seen.kick
  // The boot is drawn only while a shift is being made.
  const [doneAt, setDoneAt] = useState<number | null>(null)
  useEffect(() => {
    if (!kick) return
    const id = window.setTimeout(() => setDoneAt(kick.at), SHIFT_HOLD_MS)
    return () => window.clearTimeout(id)
  }, [kick])
  const booted: LeverAction | null = kick && doneAt !== kick.at ? kick.dir : null
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
        {/* While a shift is made, a ghost of the lever at rest shows how far the toe piece has moved. */}
        {booted && (
          <g opacity={0.3}>
            <path d="M62,92 L150,58" strokeWidth={9} strokeDasharray="3 4" className="stroke-coolant-400" />
            <rect x={140} y={47} width={38} height={16} rx={8} transform="rotate(-21 159 55)" fill="none" strokeDasharray="3 3" strokeWidth={1.5} className="stroke-coolant-300" />
          </g>
        )}
        <g key={kick?.at} data-shift={booted ?? undefined} className={kick ? KICK_CLASS[kick.dir] : undefined} style={{ transformOrigin: '62px 92px' }}>
          {/* A lift: the toe of the boot is under the toe piece and comes up with it. */}
          {booted && booted !== 'down' && <Boot x={152} y={77} />}
          <path d="M62,92 L150,58" strokeWidth={9} className="stroke-coolant-400" />
          <rect x={140} y={47} width={38} height={16} rx={8} transform="rotate(-21 159 55)" className="fill-coolant-500 stroke-coolant-300" strokeWidth={1} />
          {/* A press: the boot sits on top of the toe piece and pushes it down. */}
          {booted === 'down' && <Boot x={168} y={33} />}
        </g>
        {booted && (
          <text x={206} y={booted === 'down' ? 104 : 46} textAnchor="middle" className="fill-coolant-300 font-mono text-[13px] font-semibold tracking-wider" data-shift-label>
            {booted === 'down' ? '▼ PRESS' : booted === 'up' ? '▲ LIFT' : '▲ HALF'}
          </text>
        )}
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

/** The toe of the rider's boot on (or under) the gear lever, centred at x, y: toe cap, laces and sole. */
function Boot({ x, y }: { x: number; y: number }) {
  return (
    <g data-boot transform={`rotate(-21 ${x} ${y})`}>
      <path
        d={`M${x - 44},${y + 13} L${x - 44},${y - 8} C${x - 30},${y - 14} ${x - 8},${y - 15} ${x + 12},${y - 13} C${x + 30},${y - 11} ${x + 40},${y - 4} ${x + 40},${y + 4} C${x + 40},${y + 11} ${x + 32},${y + 13} ${x + 20},${y + 13} Z`}
        className="fill-[#2b3038] stroke-ink-muted"
        strokeWidth={1.6}
      />
      <path d={`M${x - 36},${y - 7} L${x - 30},${y + 2} M${x - 26},${y - 9} L${x - 20},${y + 1} M${x - 16},${y - 10} L${x - 10},${y}`} strokeWidth={1.6} className="stroke-ink-subtle" />
      <path d={`M${x - 44},${y + 13} L${x + 22},${y + 13}`} strokeWidth={4} className="stroke-[#111318]" />
    </g>
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
