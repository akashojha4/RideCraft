import { BIKE_CG, RIDER_CG } from '@/lib/mechanics/cornering'

/*
 * Motorcycle and rider seen from behind, drawn in metres about the rear contact patch and
 * scaled by `scale` (px per metre). The motorcycle leans `lean` degrees (positive = right)
 * about the contact patch. `riderShift` moves the rider's centre of mass sideways from the
 * motorcycle's centre line (m, positive = right): about 70 % by sliding the hips across the
 * seat, the rest by tilting the upper body. Footpegs sit 0.3 m out and 0.25 m up, so they
 * touch the road at 40° of lean, as on a typical commuter motorcycle.
 */

const HIP_Y = 0.82
const RIDER_LEVER = 0.13
const TORSO = 0.55
const BAR = { x: 0.36, y: 1.02 }
const PEG = { x: 0.3, y: 0.25 }

function riderPose(riderShift: number) {
  const hipX = riderShift * 0.7
  const tilt = Math.asin(Math.max(-0.95, Math.min(0.95, (riderShift - hipX) / RIDER_LEVER)))
  return { hipX, tilt }
}

export function RearView({
  x,
  y,
  scale,
  lean,
  riderShift = 0,
  rider = true,
  showCg = false,
  scraping = false,
}: {
  x: number
  y: number
  scale: number
  lean: number
  riderShift?: number
  rider?: boolean
  showCg?: boolean
  /** Highlight the inside footpeg touching the road. */
  scraping?: boolean
}) {
  const P = (px: number, py: number) => `${(px * scale).toFixed(1)},${(-py * scale).toFixed(1)}`
  const { hipX, tilt } = riderPose(riderShift)
  const hip = { x: hipX, y: HIP_Y }
  const up = { x: Math.sin(tilt), y: Math.cos(tilt) }
  const side = { x: Math.cos(tilt), y: -Math.sin(tilt) }
  const shoulderC = { x: hip.x + up.x * TORSO, y: hip.y + up.y * TORSO }
  const shoulder = (s: number) => ({ x: shoulderC.x + side.x * 0.2 * s, y: shoulderC.y + side.y * 0.2 * s })
  const head = { x: shoulderC.x + up.x * 0.17, y: shoulderC.y + up.y * 0.17 }
  const insidePeg = lean >= 0 ? 1 : -1
  const sw = Math.max(1.2, scale * 0.012)

  return (
    <g transform={`translate(${x},${y}) rotate(${lean})`} strokeLinejoin="round" strokeLinecap="round">
      {/* Tyre and wheel */}
      <rect x={-0.065 * scale} y={-0.58 * scale} width={0.13 * scale} height={0.58 * scale} rx={0.06 * scale} className="fill-ink-subtle/70 stroke-ink-muted" strokeWidth={sw} />
      {/* Footpegs */}
      {[-1, 1].map((s) => (
        <line key={s} x1={s * 0.12 * scale} y1={-PEG.y * scale} x2={s * PEG.x * scale} y2={-PEG.y * scale} strokeWidth={sw * 2.2} className={scraping && s === insidePeg ? 'stroke-danger-400' : 'stroke-ink-muted'} />
      ))}
      {/* Body, seat, tail light and handlebar */}
      <path d={`M${P(-0.1, 0.52)} L${P(-0.19, 0.84)} L${P(0.19, 0.84)} L${P(0.1, 0.52)} Z`} className="fill-surface-raised stroke-ink-muted" strokeWidth={sw} />
      <rect x={-0.05 * scale} y={-0.74 * scale} width={0.1 * scale} height={0.05 * scale} rx={0.015 * scale} className="fill-danger-500/80" />
      <path d={`M${P(-0.16, 0.84)} L${P(-0.15, 0.89)} L${P(0.15, 0.89)} L${P(0.16, 0.84)} Z`} className="fill-surface-overlay stroke-ink-muted" strokeWidth={sw} />
      <line x1={-BAR.x * scale} y1={-BAR.y * scale} x2={BAR.x * scale} y2={-BAR.y * scale} strokeWidth={sw * 1.6} className="stroke-ink-muted" />
      {[-1, 1].map((s) => (
        <line key={s} x1={s * 0.3 * scale} y1={-BAR.y * scale} x2={s * 0.34 * scale} y2={-1.16 * scale} strokeWidth={sw} className="stroke-ink-subtle" />
      ))}

      {rider && (
        <g>
          {/* Legs: hip to knee to footpeg */}
          {[-1, 1].map((s) => (
            <path key={s} d={`M${P(hip.x + s * 0.1, hip.y)} L${P(s * 0.15 + hip.x * 0.4, 0.58)} L${P(s * 0.27, PEG.y + 0.03)}`} fill="none" strokeWidth={sw * 4} className="stroke-surface-overlay" />
          ))}
          {/* Torso, arms, helmet */}
          <path d={`M${P(hip.x - 0.13 * side.x, hip.y - 0.13 * side.y)} L${P(shoulder(-1).x, shoulder(-1).y)} L${P(shoulder(1).x, shoulder(1).y)} L${P(hip.x + 0.13 * side.x, hip.y + 0.13 * side.y)} Z`} className="fill-ignition-500/80 stroke-ignition-300" strokeWidth={sw} />
          {[-1, 1].map((s) => (
            <line key={s} x1={shoulder(s).x * scale} y1={-shoulder(s).y * scale} x2={s * BAR.x * 0.9 * scale} y2={-BAR.y * scale} strokeWidth={sw * 3} className="stroke-ignition-400" />
          ))}
          <circle cx={head.x * scale} cy={-head.y * scale} r={0.13 * scale} className="fill-surface-overlay stroke-ink-muted" strokeWidth={sw} />
        </g>
      )}

      {showCg && (
        <g>
          <circle cx={0} cy={-BIKE_CG * scale} r={Math.max(3, 0.04 * scale)} className="fill-coolant-300" />
          {rider && <circle cx={riderShift * scale} cy={-RIDER_CG * scale} r={Math.max(3, 0.04 * scale)} className="fill-ignition-300" />}
        </g>
      )}
    </g>
  )
}

/** Ground line and the force diagram at a centre of mass (world coordinates, px). */
export function LeanForces({ x, y, cg, lean, scale, label = true }: { x: number; y: number; cg: { x: number; y: number }; lean: number; scale: number; label?: boolean }) {
  const cx = x + cg.x * scale
  const cy = y - cg.y * scale
  const g = 0.55 * scale
  const lat = Math.tan((lean * Math.PI) / 180) * g
  const arrow = (x1: number, y1: number, x2: number, y2: number, cls: string) => {
    const a = Math.atan2(y2 - y1, x2 - x1)
    const h = Math.max(6, scale * 0.06)
    return (
      <g className={cls}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={Math.max(2, scale * 0.02)} />
        <path d={`M${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} L${x2},${y2} L${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}`} fill="none" strokeWidth={Math.max(2, scale * 0.02)} />
      </g>
    )
  }
  return (
    <g strokeLinecap="round">
      <line x1={x} y1={y} x2={cx} y2={cy} strokeWidth={1.5} strokeDasharray="4 4" className="stroke-ink-muted" />
      {arrow(cx, cy, cx, cy + g, 'stroke-ink')}
      {Math.abs(lat) > 1 && arrow(x, y, x + lat, y, 'stroke-coolant-400')}
      <circle cx={cx} cy={cy} r={Math.max(4, scale * 0.045)} strokeWidth={2} className="fill-bg stroke-ink" />
      {label && (
        <>
          <text x={cx + 8} y={cy + g - 4} className="fill-ink-muted font-mono text-[11px]">
            weight
          </text>
          {Math.abs(lat) > 20 && (
            <text x={x + lat + (lat > 0 ? 8 : -8)} y={y + 4} textAnchor={lat > 0 ? 'start' : 'end'} className="fill-coolant-300 font-mono text-[11px]">
              tyre grip
            </text>
          )}
        </>
      )}
    </g>
  )
}
