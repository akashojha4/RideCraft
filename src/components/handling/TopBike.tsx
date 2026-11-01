/*
 * Motorcycle and rider seen from above, drawn in metres and scaled by `scale` (px per
 * metre). Points up the page at heading 0; `heading` turns it clockwise (deg). The front
 * wheel and handlebar turn by `steer` (deg, positive right). `indicator` flashes the
 * left or right indicators when `blink` is true.
 */
export function TopBike({
  x,
  y,
  scale,
  heading,
  steer = 0,
  indicator = null,
  blink = false,
  tone = 'ignition',
}: {
  x: number
  y: number
  scale: number
  heading: number
  steer?: number
  indicator?: 'left' | 'right' | null
  blink?: boolean
  tone?: 'ignition' | 'muted'
}) {
  const s = (v: number) => v * scale
  const sw = Math.max(1, scale * 0.025)
  const lamp = (side: -1 | 1, front: boolean) => {
    const on = blink && indicator === (side < 0 ? 'left' : 'right')
    return <circle key={`${side}${front}`} cx={s(side * 0.16)} cy={s(front ? -0.62 : 0.86)} r={s(0.06)} className={on ? 'fill-caution-400' : 'fill-line-strong'} />
  }
  return (
    <g transform={`translate(${x},${y}) rotate(${heading})`} strokeLinejoin="round">
      {/* Rear wheel */}
      <rect x={s(-0.06)} y={s(0.4)} width={s(0.12)} height={s(0.56)} rx={s(0.05)} className="fill-ink-subtle" />
      {/* Front wheel and handlebar, steered about the steering head */}
      <g transform={`translate(0,${s(-0.55)}) rotate(${steer})`}>
        <rect x={s(-0.055)} y={s(-0.38)} width={s(0.11)} height={s(0.56)} rx={s(0.05)} className="fill-ink-subtle" />
        <line x1={s(-0.37)} x2={s(0.37)} y1={s(0.12)} y2={s(0.12)} strokeWidth={sw * 2} strokeLinecap="round" className="stroke-ink-muted" />
      </g>
      {/* Body */}
      <path d={`M0,${s(-0.55)} L${s(0.16)},${s(-0.3)} L${s(0.19)},${s(0.3)} L${s(0.1)},${s(0.85)} L${s(-0.1)},${s(0.85)} L${s(-0.19)},${s(0.3)} L${s(-0.16)},${s(-0.3)} Z`} className="fill-surface-raised stroke-ink-muted" strokeWidth={sw} />
      {lamp(-1, true)}
      {lamp(1, true)}
      {lamp(-1, false)}
      {lamp(1, false)}
      {/* Rider: shoulders and helmet */}
      <ellipse cx={0} cy={s(0.05)} rx={s(0.23)} ry={s(0.13)} className={tone === 'ignition' ? 'fill-ignition-500/80' : 'fill-ink-muted'} />
      <circle cx={0} cy={s(-0.02)} r={s(0.12)} className="fill-surface-overlay stroke-ink-muted" strokeWidth={sw} />
    </g>
  )
}

/** A car seen from above, pointing up the page at heading 0 (4.2 × 1.8 m). */
export function TopCar({ x, y, scale, heading }: { x: number; y: number; scale: number; heading: number }) {
  const s = (v: number) => v * scale
  return (
    <g transform={`translate(${x},${y}) rotate(${heading})`}>
      <rect x={s(-0.9)} y={s(-2.1)} width={s(1.8)} height={s(4.2)} rx={s(0.35)} className="fill-surface-overlay stroke-ink-muted" strokeWidth={Math.max(1, scale * 0.04)} />
      <rect x={s(-0.72)} y={s(-1.2)} width={s(1.44)} height={s(0.7)} rx={s(0.15)} className="fill-line-strong" />
      <rect x={s(-0.72)} y={s(0.9)} width={s(1.44)} height={s(0.5)} rx={s(0.15)} className="fill-line-strong" />
    </g>
  )
}
