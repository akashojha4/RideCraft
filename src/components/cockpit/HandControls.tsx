import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { LeverHit } from './LeverHit'

/*
 * The handlebar controls as the rider sees them: looking down and forward from the seat,
 * forward is up the screen. Each grip runs from the outer edge of the screen towards the
 * middle, with its lever in front of it (above on screen). Pulling a lever swings it back
 * towards the grip about its pivot on the perch.
 *
 * Every movement is drawn larger than life — a real lever moves a few centimetres — so that
 * lever out vs lever in, and the biting point between them, read at a glance and on video.
 */

const pct = (x: number) => `${Math.round(x * 100)} %`

/** Rows of rubber knurling around the twist grip; they roll with it, so a twist can be seen. */
const KNURL_ROWS = 12
/** Drawn swing of each hand lever from released (forward) to pulled to the grip. */
const LEVER_SWING = 38
/** Pivot to ball end, in drawing units. */
const LEVER_LENGTH = 132
/** The front brake lever: a little shorter swing, so it stays a lever above the grip, not a second thing on it. */
const BRAKE_SWING = 30
const BRAKE_LENGTH = 128

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

/**
 * A forged lever blade drawn along −x from its pivot (mirrored with `dir` = 1 for the right
 * hand): broad at the pivot, tapering to a ball end, with a groove along it.
 */
function Blade({ dir = -1, length = LEVER_LENGTH, className }: { dir?: -1 | 1; length?: number; className?: string }) {
  const L = length
  const x = (v: number) => v * dir
  return (
    <g className={className}>
      <path
        d={`M${x(-6)},-6 C${x(4)},-9 ${x(18)},-8 ${x(30)},-7 L${x(L - 12)},-3.6 C${x(L - 4)},-3.3 ${x(L + 1)},-2 ${x(L + 2)},0 C${x(L + 1)},2 ${x(L - 4)},3.3 ${x(L - 12)},3.6 L${x(30)},7 C${x(18)},8 ${x(4)},9 ${x(-6)},6 Z`}
        className="fill-current"
      />
      <path d={`M${x(26)},0 L${x(L - 16)},0`} strokeWidth={1.4} className="stroke-black/35" />
      <circle cx={x(L + 1)} cy={0} r={4.6} className="fill-current" />
    </g>
  )
}

/** Points along the arc the ball end sweeps, from swing angle `a` to `b` (deg, lever-local). */
function sweep(pivot: { x: number; y: number }, base: number, dir: -1 | 1, a: number, b: number, r = LEVER_LENGTH) {
  const n = 14
  return Array.from({ length: n + 1 }, (_, i) => {
    const s = a + ((b - a) * i) / n
    // Left lever: points along −x, swings clockwise (tip up) as s grows. Right: mirror.
    const deg = dir < 0 ? 180 + base + s : -(base + s)
    return polar(pivot.x, pivot.y, r, deg)
  })
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
}

/** Left handlebar: grip and clutch lever. `pull` 0 (released) – 1 (at the grip). */
export function ClutchControl({
  pull = 0,
  valueText,
  zone,
  onChange,
  onRelease,
  className,
}: {
  pull?: number
  valueText?: string
  /** The friction zone as lever pull [from, to]: marked on the lever's path so the biting point can be seen. */
  zone?: readonly [number, number]
  onChange?: (v: number) => void
  onRelease?: () => void
  className?: string
}) {
  const pivot = { x: 160, y: 88 }
  // The lever lies a few degrees above the grip line when pulled in; released, it swings forward.
  const base = 3.5
  const angle = LEVER_SWING * (1 - pull)
  const inZone = !!zone && pull >= zone[0] && pull <= zone[1]
  const zoneArc = zone && sweep(pivot, base, -1, LEVER_SWING * (1 - zone[1]), LEVER_SWING * (1 - zone[0]))
  // The label sits just inside the arc, below the band, clear of the ball end.
  const zoneMid = zone && polar(pivot.x, pivot.y, LEVER_LENGTH - 22, 180 + base + LEVER_SWING * (1 - zone[1]) - 4)
  return (
    <svg viewBox="0 -8 232 148" className={cn('w-full', className)} role={onChange ? 'group' : 'img'} aria-label={`Clutch lever, left hand: pulled ${pct(pull)}${inZone ? ', in the friction zone' : ''}`} data-clutch-zone={inZone || undefined}>
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
        <path d="M168,86 C176,58 206,46 236,40" fill="none" strokeWidth={2.5} className="stroke-ink-subtle" opacity={0.6} />
        {/* The path the ball end travels, out (forward) to in (at the grip) */}
        <polyline points={sweep(pivot, base, -1, 0, LEVER_SWING)} fill="none" strokeWidth={1.5} strokeDasharray="2 5" className="stroke-ink-subtle" opacity={0.7} />
        {zoneArc && (
          <g data-friction-zone>
            <polyline points={zoneArc} fill="none" strokeWidth={13} className="stroke-caution-400" opacity={inZone ? 0.85 : 0.3} />
            {zoneMid && (
              <text x={zoneMid.x} y={zoneMid.y} textAnchor="middle" dominantBaseline="middle" className={cn('font-mono text-[9px] font-semibold tracking-wider', inZone ? 'fill-caution-400' : 'fill-caution-400/60')}>
                BITE
              </text>
            )}
          </g>
        )}
        {/* Lever, pivoting on the perch */}
        <g transform={`rotate(${(angle + base).toFixed(2)} ${pivot.x} ${pivot.y})`}>
          <g transform={`translate(${pivot.x} ${pivot.y})`}>
            <Blade dir={-1} className={inZone ? 'text-caution-400' : 'text-ignition-500'} />
          </g>
        </g>
        <circle cx={pivot.x} cy={pivot.y} r={4.5} className="fill-surface-overlay stroke-ink" strokeWidth={1.5} />
      </g>
      {onChange && <LeverHit d="M4,-8 H200 V140 H4 Z" label="Clutch lever" value={pull} valueText={valueText ?? pct(pull)} travel={40} onChange={onChange} onRelease={onRelease} />}
    </svg>
  )
}

/**
 * Right handlebar: the front brake lever on its perch, and beyond it the throttle — a rubber
 * twist grip ending in a bar-end weight. The brake lever sits above (ahead of) the grip and
 * closes towards it; the grip itself rolls towards the rider as the throttle opens, which shows
 * as its knurling and its index stripe rolling down, with an orange arrow round the end.
 */
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
  const uid = useId().replace(/:/g, '')
  const clipId = `throttle-grip-${uid}`
  const rubberId = `throttle-rubber-${uid}`
  const metalId = `throttle-metal-${uid}`
  const prev = useRef(throttle)
  const [kick, setKick] = useState<{ dir: 'open' | 'shut'; at: number } | null>(null)
  useEffect(() => {
    const d = throttle - prev.current
    prev.current = throttle
    if (Math.abs(d) < 0.08) return
    setKick({ dir: d > 0 ? 'open' : 'shut', at: performance.now() })
  }, [throttle])
  const open = throttle > 0.04
  const braking = brake > 0.04
  // Brake lever: pivot on the perch nearer the middle; squeezed, it lies level just above the grip.
  const pivot = { x: 92, y: 78 }
  const swing = BRAKE_SWING * (1 - brake)

  // The grip, seen from above: a cylinder centred on y = 108. Angle 0 faces the rider's eye;
  // −90° is its far (forward) edge, +90° its near edge. Twisting the throttle rolls the top of
  // the grip towards the rider, so every mark on it slides down the screen.
  // A little throttle is drawn further along the roll than a real grip, so 20 % doesn't look shut.
  const shown = throttle <= 0 ? 0 : Math.min(1, 0.16 + throttle * 0.84)
  const roll = shown * 1.9 // rad
  const g = { x0: 148, x1: 236, cy: 108, r: 12 }
  const across = (a: number) => g.cy + Math.sin(a) * g.r
  const rows = Array.from({ length: KNURL_ROWS }, (_, i) => {
    const a = (((-Math.PI / 2 + roll + (i / KNURL_ROWS) * Math.PI * 2 + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI
    return { a, i, face: Math.cos(a) }
  }).filter((r) => r.face > 0.08)
  // The index stripe: just past the far edge when shut, rolling down past the middle when open.
  const indexA = -1.05 + roll
  const indexFace = Math.cos(indexA)
  // Twist arrow round the bar end: its solid part grows with the throttle.
  const end = { cx: 266, cy: g.cy, rx: 7, ry: 15 }
  const onEnd = (t: number) => ({ x: end.cx + end.rx * Math.cos(-Math.PI / 2 + t * Math.PI), y: end.cy + end.ry * Math.sin(-Math.PI / 2 + t * Math.PI) })
  const arc = (t: number) => {
    const n = 12
    return Array.from({ length: n + 1 }, (_, k) => onEnd((t * k) / n)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  }
  const tip = onEnd(Math.max(shown, 0.02))
  const before = onEnd(Math.max(shown - 0.12, 0))
  const ang = Math.atan2(tip.y - before.y, tip.x - before.x)
  const head = (da: number) => `${(tip.x - 6 * Math.cos(ang + da)).toFixed(1)},${(tip.y - 6 * Math.sin(ang + da)).toFixed(1)}`
  return (
    <svg viewBox="48 -8 232 148" className={cn('w-full', className)} role={onThrottle || onBrake ? 'group' : 'img'} aria-label={`Right hand: throttle ${pct(throttle)} open, front brake ${pct(brake)}`} data-throttle={Math.round(throttle * 100)}>
      <defs>
        <linearGradient id={rubberId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4a505a" />
          <stop offset="0.3" stopColor="#30353d" />
          <stop offset="0.75" stopColor="#1a1d22" />
          <stop offset="1" stopColor="#0d0f12" />
        </linearGradient>
        <linearGradient id={metalId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c4cbd4" />
          <stop offset="0.45" stopColor="#7d8692" />
          <stop offset="1" stopColor="#3c424b" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x={g.x0 - 2} y={g.cy - g.r} width={g.x1 - g.x0 + 4} height={g.r * 2} rx={7} />
        </clipPath>
      </defs>
      <g strokeLinecap="round" strokeLinejoin="round">
        <line x1={0} y1={92} x2={110} y2={102} strokeWidth={12} className="stroke-line-strong" />
        {/* Brake perch and master cylinder, with its fluid reservoir and hose */}
        <path d="M84,70 C76,52 62,40 44,32" fill="none" strokeWidth={2.5} className="stroke-ink-subtle" opacity={0.45} />
        <rect x={74} y={68} width={34} height={30} rx={5} className="fill-surface-raised stroke-ink-subtle" strokeWidth={1.5} />
        <rect x={80} y={48} width={22} height={17} rx={3} className="fill-surface-sunken stroke-line-strong" strokeWidth={1.5} />
        {/* Throttle housing where the grip's cable leaves */}
        <rect x={112} y={92} width={30} height={32} rx={5} className="fill-surface-sunken stroke-line-strong" strokeWidth={1.5} />
        <path d="M118,94 C112,80 106,74 98,70" fill="none" strokeWidth={2} className={open ? 'stroke-ignition-400' : 'stroke-ink-subtle'} opacity={open ? 0.8 : 0.4} />

        {/* The twist grip */}
        <g
          key={kick?.at ?? 'idle'}
          data-grip
          transform="rotate(4 196 108)"
          className={kick ? (kick.dir === 'open' ? 'throttle-open' : 'throttle-shut') : undefined}
        >
          {/* Flange at the inner end of the rubber */}
          <rect x={g.x0 - 6} y={g.cy - g.r - 3} width={8} height={g.r * 2 + 6} rx={2.5} fill={`url(#${rubberId})`} stroke="#07080a" strokeWidth={1.2} />
          {/* Rubber body */}
          <rect x={g.x0} y={g.cy - g.r} width={g.x1 - g.x0} height={g.r * 2} rx={7} fill={`url(#${rubberId})`} stroke={open ? 'var(--color-ignition-500)' : '#07080a'} strokeOpacity={open ? 0.7 : 1} strokeWidth={1.4} />
          <g clipPath={`url(#${clipId})`}>
            {/* Knurling: staggered short ridges in rows round the grip, rolling with it */}
            {rows.map(({ a, i, face }) => (
              <line
                key={i}
                x1={g.x0 + 4 + (i % 2) * 5}
                x2={g.x1 - 4}
                y1={across(a)}
                y2={across(a)}
                strokeWidth={0.8 + 1.8 * face}
                strokeDasharray="6 4"
                stroke="#6b737e"
                opacity={0.15 + 0.5 * face}
              />
            ))}
            {/* Index stripe printed along the grip */}
            {indexFace > 0.05 && (
              <line x1={g.x0 + 3} x2={g.x1 - 3} y1={across(indexA)} y2={across(indexA)} strokeWidth={1.5 + 3.5 * indexFace} className={open ? 'stroke-ignition-400' : 'stroke-ink-muted'} />
            )}
            {/* Soft sheen along the top of the rubber */}
            <line x1={g.x0 + 6} x2={g.x1 - 6} y1={g.cy - g.r + 3.5} y2={g.cy - g.r + 3.5} stroke="#fff" strokeOpacity={0.1} strokeWidth={2} />
          </g>
          {/* Bar-end weight */}
          <rect x={g.x1 - 1} y={g.cy - 9} width={16} height={18} rx={4} fill={`url(#${metalId})`} stroke="#22262c" strokeWidth={1} />
          <rect x={g.x1 + 13} y={g.cy - 7} width={5} height={14} rx={2} fill={`url(#${metalId})`} stroke="#22262c" strokeWidth={1} />
        </g>
        {/* Which way the grip rolls: faint all the way round, orange as far as it is open */}
        <g data-twist>
          <polyline points={arc(1)} fill="none" strokeWidth={1.5} strokeDasharray="2 3" className="stroke-ink-subtle" opacity={0.6} />
          {open && <polyline points={arc(shown)} fill="none" strokeWidth={3.5} className="stroke-ignition-400" />}
          <polygon points={`${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${head(0.5)} ${head(-0.5)}`} className={open ? 'fill-ignition-400' : 'fill-ink-subtle'} opacity={open ? 1 : 0.7} />
        </g>

        {/* Front brake lever: its own red lever above the grip, closing towards it when squeezed */}
        <polyline points={sweep(pivot, 0, 1, 0, BRAKE_SWING, BRAKE_LENGTH)} fill="none" strokeWidth={1.5} strokeDasharray="2 5" className="stroke-danger-400" opacity={braking ? 0.55 : 0.22} />
        <g transform={`rotate(${(-swing).toFixed(2)} ${pivot.x} ${pivot.y})`}>
          <g transform={`translate(${pivot.x} ${pivot.y})`} className={braking ? 'drop-shadow-[0_0_6px_rgb(248_113_113/0.7)]' : undefined}>
            <Blade dir={1} length={BRAKE_LENGTH} className="text-danger-400" />
          </g>
        </g>
        <circle cx={pivot.x} cy={pivot.y} r={4.5} className="fill-surface-overlay stroke-ink" strokeWidth={1.5} />
      </g>
      {onBrake && <LeverHit d="M70,-8 H280 V86 H70 Z" label="Front brake lever" value={brake} valueText={`${pct(brake)} applied`} travel={40} onChange={onBrake} onRelease={onBrakeRelease} />}
      {onThrottle && <LeverHit d="M136,88 H280 V140 H136 Z" label="Throttle twist grip" value={throttle} valueText={`${pct(throttle)} open`} travel={40} onChange={onThrottle} onRelease={onThrottleRelease} />}
    </svg>
  )
}
