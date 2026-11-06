import { cn } from '@/lib/cn'
import { LeverHit } from './LeverHit'

/*
 * The handlebar controls as the rider sees them: looking down and forward from the seat,
 * forward is up the screen. Each grip runs from the outer edge of the screen towards the
 * middle, with its lever in front of it (above on screen). Pulling a lever swings it back
 * towards the grip about its pivot on the perch.
 */

const pct = (x: number) => `${Math.round(x * 100)} %`

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
  const angle = -14 * (1 - brake)
  // Twisting the grip back rolls its index mark round; shown as the mark sliding along the grip.
  const mark = 10 + throttle * 14
  return (
    <svg viewBox="48 30 232 110" className={cn('w-full', className)} role={onThrottle || onBrake ? 'group' : 'img'} aria-label={`Right hand: throttle ${pct(throttle)} open, front brake ${pct(brake)}`}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <line x1={0} y1={92} x2={130} y2={104} strokeWidth={12} className="stroke-line-strong" />
        {/* Throttle housing and the twist grip */}
        <rect x={66} y={82} width={34} height={36} rx={6} className="fill-surface-sunken stroke-line-strong" strokeWidth={1.5} />
        <g transform="rotate(5 201 108)">
          <rect x={142} y={95} width={118} height={26} rx={12} className="fill-surface-overlay stroke-ink-subtle" strokeWidth={1.5} />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={156 + i * 11} y1={99} x2={156 + i * 11} y2={117} strokeWidth={2} className="stroke-surface-raised" />
          ))}
          <line x1={146} y1={108 - mark} x2={146} y2={108} strokeWidth={4} className="stroke-ignition-400" />
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
