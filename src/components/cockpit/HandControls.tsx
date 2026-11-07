import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { LeverHit } from './LeverHit'

/*
 * The handlebar controls as the rider sees them: looking down and forward from the seat,
 * forward is up the screen. Each grip runs from the outer edge of the screen towards the
 * middle, with its lever in front of it (above on screen). Pulling a lever swings it back
 * towards the grip about its pivot on the perch.
 */

const pct = (x: number) => `${Math.round(x * 100)} %`

/** Drawn roll of the twist grip — bigger than a real ~70° so shut vs open is obvious at a glance. */
const TWIST_DEG = 140
const RIBS = 6

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

/** Left handlebar: grip and clutch lever. `pull` 0 (released) – 1 (at the grip). */
export function ClutchControl({ pull = 0, valueText, onChange, onRelease, className }: { pull?: number; valueText?: string; onChange?: (v: number) => void; onRelease?: () => void; className?: string }) {
  // Lever swings from 14° ahead of the grip (forward, up the screen) back to lying along it.
  const angle = 14 * (1 - pull)
  return (
    <svg viewBox="0 30 232 110" className={cn('w-full', className)} role={onChange ? 'group' : 'img'} aria-label={`Clutch lever, left hand: pulled ${pct(pull)}`}>
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Handlebar tube towards the centre of the motorcycle */}
        <line x1={150} y1={104} x2={280} y2={92} strokeWidth={12} className="stroke-line-strong" />
        {/* Rubber grip at the outer end */}
        <rect x={20} y={95} width={118} height={26} rx={12} transform="rotate(-5 79 108)" className="fill-surface-overlay stroke-ink-subtle" strokeWidth={1.5} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={34 + i * 11} y1={99 - i * 0.95} x2={34 + i * 11} y2={117 - i * 0.95} strokeWidth={2} className="stroke-surface-raised" />
        ))}
        {/* Perch, switch block and cable */}
        <rect x={146} y={86} width={30} height={30} rx={5} className="fill-surface-raised stroke-ink-subtle" strokeWidth={1.5} />
        <rect x={180} y={82} width={34} height={36} rx={6} className="fill-surface-sunken stroke-line-strong" strokeWidth={1.5} />
        <path d="M168,86 C176,58 206,46 236,40" fill="none" strokeWidth={3} className="stroke-ink-subtle" />
        {/* Lever, pivoting on the perch */}
        <g transform={`rotate(${angle} 160 88)`}>
          <path d="M160,88 L30,80" strokeWidth={9} className="stroke-ignition-500" />
          <circle cx={30} cy={80} r={5} className="fill-ignition-500" />
        </g>
        <circle cx={160} cy={88} r={4.5} className="fill-surface-overlay stroke-ink" strokeWidth={1.5} />
      </g>
      {onChange && <LeverHit d="M4,30 H200 V140 H4 Z" label="Clutch lever" value={pull} valueText={valueText ?? pct(pull)} travel={40} onChange={onChange} onRelease={onRelease} />}
    </svg>
  )
}

/** Right handlebar: twist grip (throttle) and front brake lever. */
export function ThrottleBrakeControl({
  throttle = 0,
  brake = 0,
  onThrottle,
  onBrake,
  onThrottleRelease,
  onBrakeRelease,
  className,
}: {
  throttle?: number
  brake?: number
  onThrottle?: (v: number) => void
  onBrake?: (v: number) => void
  onThrottleRelease?: () => void
  onBrakeRelease?: () => void
  className?: string
}) {
  const clipId = `throttle-grip-${useId().replace(/:/g, '')}`
  const prev = useRef(throttle)
  const [kick, setKick] = useState<{ dir: 'open' | 'shut'; at: number } | null>(null)
  useEffect(() => {
    const d = throttle - prev.current
    prev.current = throttle
    if (Math.abs(d) < 0.08) return
    setKick({ dir: d > 0 ? 'open' : 'shut', at: performance.now() })
  }, [throttle])
  const angle = -14 * (1 - brake)
  // Twist toward the rider (down the screen). Shut = 12 o'clock on the bar end; open rolls that way.
  // A little throttle is drawn further along the roll than a real grip, so 20 % doesn't look shut.
  const shown = throttle <= 0 ? 0 : Math.min(1, 0.16 + throttle * 0.84)
  const twist = shown * TWIST_DEG
  const twistR = (twist * Math.PI) / 180
  const indexY = 108 - Math.cos(twistR) * 10
  const cap = { cx: 254, cy: 108, r: 15 }
  const pointer = polar(cap.cx, cap.cy, cap.r - 3, -90 + twist)
  const shutTick = polar(cap.cx, cap.cy, cap.r + 1, -90)
  const openTip = polar(cap.cx, cap.cy, cap.r + 6, -90 + TWIST_DEG)
  const openA = polar(cap.cx, cap.cy, cap.r - 1, -90 + TWIST_DEG - 12)
  const openB = polar(cap.cx, cap.cy, cap.r - 1, -90 + TWIST_DEG + 12)
  const arcStart = polar(cap.cx, cap.cy, cap.r - 1, -90)
  const open = throttle > 0.04
  return (
    <svg viewBox="48 30 232 110" className={cn('w-full', className)} role={onThrottle || onBrake ? 'group' : 'img'} aria-label={`Right hand: throttle ${pct(throttle)} open, front brake ${pct(brake)}`} data-throttle={Math.round(throttle * 100)}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <line x1={0} y1={92} x2={130} y2={104} strokeWidth={12} className="stroke-line-strong" />
        {/* Throttle housing: a drum that turns with the grip, pulling the cable */}
        <rect x={66} y={82} width={34} height={36} rx={6} className="fill-surface-sunken stroke-line-strong" strokeWidth={1.5} />
        <circle cx={83} cy={100} r={11} className="fill-surface-overlay stroke-ink-subtle" strokeWidth={1.5} />
        <g transform={`rotate(${twist} 83 100)`}>
          <path d="M83,100 L83,90" strokeWidth={3} className={open ? 'stroke-ignition-400' : 'stroke-ink-muted'} />
          <path d="M83,100 L91,104" strokeWidth={2} className="stroke-ink-subtle" />
        </g>
        <path d="M72,92 C60,70 48,58 40,50" fill="none" strokeWidth={2.5} className={open ? 'stroke-ignition-400' : 'stroke-ink-subtle'} />
        <g
          key={kick?.at ?? 'idle'}
          transform="rotate(5 201 108)"
          className={kick ? (kick.dir === 'open' ? 'throttle-open' : 'throttle-shut') : undefined}
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={142} y={95} width={100} height={26} rx={12} />
            </clipPath>
          </defs>
          <rect
            x={142}
            y={95}
            width={100}
            height={26}
            rx={12}
            className={open ? 'fill-ignition-950 stroke-ignition-400' : 'fill-surface-overlay stroke-ink-subtle'}
            strokeWidth={1.5}
          />
          <g clipPath={`url(#${clipId})`}>
            {Array.from({ length: RIBS }, (_, i) => {
              const a = twistR + (i / RIBS) * Math.PI * 2
              const front = Math.cos(a)
              if (front < -0.15) return null
              const y = 108 + Math.sin(a) * 10
              return (
                <line
                  key={i}
                  x1={148}
                  y1={y}
                  x2={236}
                  y2={y}
                  strokeWidth={1.2 + 2.2 * Math.max(0, front)}
                  opacity={0.25 + 0.55 * Math.max(0, front)}
                  className="stroke-ink-subtle"
                />
              )
            })}
            {/* Fat index band: starts on top (shut) and rolls toward the rider as the grip opens. */}
            <path
              d={`M144,${indexY} L152,${indexY - 5} L236,${indexY - 5} L244,${indexY} L236,${indexY + 5} L152,${indexY + 5} Z`}
              className={open ? 'fill-ignition-400' : 'fill-ink-muted'}
            />
          </g>
          {/* Bar-end: a clock face so the twist reads even when the band is edge-on. */}
          <circle cx={cap.cx} cy={cap.cy} r={cap.r} className={cn(open ? 'fill-ignition-950 stroke-ignition-400' : 'fill-surface-raised stroke-ink')} strokeWidth={1.8} />
          <circle cx={cap.cx} cy={cap.cy} r={3} className={open ? 'fill-ignition-400' : 'fill-ink-muted'} />
          <line x1={cap.cx} y1={cap.cy - cap.r} x2={shutTick.x} y2={shutTick.y} strokeWidth={2.5} className="stroke-ink-muted" />
          <path d={`M ${openTip.x} ${openTip.y} L ${openA.x} ${openA.y} L ${openB.x} ${openB.y} Z`} className="fill-ignition-400" />
          {open && (
            <path
              d={`M ${arcStart.x} ${arcStart.y} A ${cap.r - 1} ${cap.r - 1} 0 ${twist > 180 ? 1 : 0} 1 ${pointer.x} ${pointer.y}`}
              fill="none"
              strokeWidth={3}
              className="stroke-ignition-400"
              opacity={0.45}
            />
          )}
          <line x1={cap.cx} y1={cap.cy} x2={pointer.x} y2={pointer.y} strokeWidth={4} className={open ? 'stroke-ignition-400' : 'stroke-ink-muted'} />
        </g>
        {/* Brake master cylinder with its fluid reservoir */}
        <rect x={104} y={84} width={32} height={30} rx={5} className="fill-surface-raised stroke-ink-subtle" strokeWidth={1.5} />
        <rect x={108} y={58} width={22} height={22} rx={3} className="fill-surface-sunken stroke-line-strong" strokeWidth={1.5} />
        <path d="M118,84 C108,62 80,50 48,44" fill="none" strokeWidth={3} className="stroke-ink-subtle" />
        <g transform={`rotate(${angle} 120 88)`}>
          <path d="M120,88 L250,80" strokeWidth={9} className="stroke-danger-400" />
          <circle cx={250} cy={80} r={5} className="fill-danger-400" />
        </g>
        <circle cx={120} cy={88} r={4.5} className="fill-surface-overlay stroke-ink" strokeWidth={1.5} />
      </g>
      {onBrake && <LeverHit d="M90,30 H280 V88 H90 Z" label="Front brake lever" value={brake} valueText={`${pct(brake)} applied`} travel={40} onChange={onBrake} onRelease={onBrakeRelease} />}
      {onThrottle && <LeverHit d="M136,88 H280 V140 H136 Z" label="Throttle twist grip" value={throttle} valueText={`${pct(throttle)} open`} travel={40} onChange={onThrottle} onRelease={onThrottleRelease} />}
    </svg>
  )
}
