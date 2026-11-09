import { useId } from 'react'
import { TopBike, TopCar } from '@/components/handling/TopBike'
import type { Actor, Frame, TopScene } from '@/lib/scenarios/types'
import { cn } from '@/lib/cn'

/*
 * A scenario seen from above, travelling up the page. The view follows the motorcycle
 * (it sits low in the view so the road ahead is visible) at a fixed scale, so distances on
 * screen are true. Rain draws streaks; night darkens everything outside the headlight beam.
 */

const W = 360
const H = 460
const BIKE_SCREEN_Y = 360

function offsetLine(road: { x: number; y: number }[], offset: number) {
  return road.map((p, i) => {
    const a = road[Math.max(0, i - 1)]
    const b = road[Math.min(road.length - 1, i + 1)]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    // Normal pointing to the right of the direction of travel.
    return { x: p.x + (dy / len) * offset, y: p.y - (dx / len) * offset }
  })
}

function ActorShape({ a, k }: { a: Actor; k: number }) {
  if (a.kind === 'car') return <TopCar x={0} y={4.2 * k * 0.5} scale={k} heading={0} />
  if (a.kind === 'truck')
    return (
      <g>
        <rect x={-1.25 * k} y={0} width={2.5 * k} height={2.4 * k} rx={0.3 * k} className="fill-surface-overlay stroke-ink-muted" strokeWidth={1.5} />
        <rect x={-1.25 * k} y={2.6 * k} width={2.5 * k} height={9.4 * k} rx={0.2 * k} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
      </g>
    )
  if (a.kind === 'tractor')
    return (
      <g>
        <rect x={-1 * k} y={0} width={2 * k} height={4 * k} rx={0.3 * k} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
        <rect x={-1.2 * k} y={2.4 * k} width={0.5 * k} height={1.4 * k} className="fill-ink-subtle" />
        <rect x={0.7 * k} y={2.4 * k} width={0.5 * k} height={1.4 * k} className="fill-ink-subtle" />
      </g>
    )
  if (a.kind === 'person')
    return (
      <g>
        <circle cx={0} cy={0} r={0.16 * k} className="fill-ignition-200" />
        <rect x={-0.14 * k} y={0.16 * k} width={0.28 * k} height={0.55 * k} rx={0.1 * k} className="fill-ignition-400" />
        <rect x={-0.1 * k} y={0.7 * k} width={0.08 * k} height={0.4 * k} rx={0.04 * k} className="fill-ink-muted" />
        <rect x={0.02 * k} y={0.7 * k} width={0.08 * k} height={0.4 * k} rx={0.04 * k} className="fill-ink-muted" />
      </g>
    )
  return (
    <g>
      <ellipse cx={0} cy={0.45 * k} rx={0.18 * k} ry={0.45 * k} className="fill-caution-300" />
      <circle cx={0} cy={0} r={0.14 * k} className="fill-caution-200" />
    </g>
  )
}

export function TopSceneView({ scene, frame }: { scene: TopScene; frame: Frame }) {
  const uid = useId().replace(/:/g, '')
  const span = scene.span ?? 22
  const k = W / span
  const { bike } = frame
  const cam = { x: bike.x, y: bike.y }
  const sx = (x: number) => W / 2 + (x - cam.x) * k
  const sy = (y: number) => BIKE_SCREEN_Y - (y - cam.y) * k
  const pt = (p: { x: number; y: number }) => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`
  const visible = scene.road.filter((p) => p.y > cam.y - 40 && p.y < cam.y + 70)
  const road = visible.length > 1 ? visible : scene.road
  const left = offsetLine(road, scene.edges[0])
  const right = offsetLine(road, scene.edges[1])
  const surface = `M${left.map(pt).join(' L')} L${right.reverse().map(pt).join(' L')} Z`
  const beam = frame.beam ?? scene.beam ?? 40
  const night = scene.weather === 'night'
  const headingRad = (bike.heading * Math.PI) / 180

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl" role="img" aria-label={`Top view, ${Math.round(bike.v * 3.6)} km/h`}>
      <defs>
        <clipPath id={`clip-${uid}`}>
          <rect width={W} height={H} rx={12} />
        </clipPath>
        {night && (
          <mask id={`mask-${uid}`}>
            <rect width={W} height={H} fill="white" />
            <path d={`M${sx(bike.x)},${sy(bike.y)} L${sx(bike.x + Math.sin(headingRad - 0.22) * beam)},${sy(bike.y + Math.cos(headingRad - 0.22) * beam)} L${sx(bike.x + Math.sin(headingRad + 0.22) * beam)},${sy(bike.y + Math.cos(headingRad + 0.22) * beam)} Z`} fill="black" />
          </mask>
        )}
      </defs>
      <g clipPath={`url(#clip-${uid})`}>
        <rect width={W} height={H} className="fill-surface-sunken" />
        <path d={surface} className="fill-surface-overlay" />
        {scene.features?.map((f, i) => {
          if (f.type === 'crossRoad') return <rect key={i} x={0} y={sy(f.y + f.width / 2)} width={W} height={f.width * k} className="fill-surface-overlay" />
          return null
        })}
        {scene.dividers.map((d) => (
          <path key={d.offset} d={`M${offsetLine(road, d.offset).map(pt).join(' L')}`} fill="none" strokeWidth={2} strokeDasharray={d.style === 'dashed' ? '14 12' : undefined} className="stroke-line-strong" />
        ))}
        <path d={`M${offsetLine(road, scene.edges[0]).map(pt).join(' L')}`} fill="none" strokeWidth={2.5} className="stroke-ink-subtle" />
        <path d={`M${offsetLine(road, scene.edges[1]).map(pt).join(' L')}`} fill="none" strokeWidth={2.5} className="stroke-ink-subtle" />
        {scene.features?.map((f, i) => {
          switch (f.type) {
            case 'stopLine':
              return <line key={i} x1={sx(f.x0)} x2={sx(f.x1)} y1={sy(f.y)} y2={sy(f.y)} strokeWidth={4} className="stroke-ink" />
            case 'signal': {
              const colour = frame.signal ?? 'green'
              return (
                <g key={i} transform={`translate(${sx(f.x)},${sy(f.y)})`} data-signal={colour}>
                  <rect x={-9} y={-26} width={18} height={44} rx={5} className="fill-bg stroke-ink-muted" strokeWidth={1.5} />
                  {(['red', 'amber', 'green'] as const).map((c, j) => (
                    <circle key={c} cx={0} cy={-17 + j * 13} r={5} className={colour === c ? (c === 'red' ? 'fill-danger-500' : c === 'amber' ? 'fill-caution-400' : 'fill-ok-400') : 'fill-surface-overlay'} />
                  ))}
                </g>
              )
            }
            case 'pothole':
              return <ellipse key={i} cx={sx(f.x)} cy={sy(f.y)} rx={f.r * k} ry={f.r * k * 0.8} className="fill-bg stroke-ink-subtle" strokeWidth={1.5} />
            case 'patch':
              return <path key={i} d={`M${f.points.map(pt).join(' L')} Z`} className={f.kind === 'gravel' ? 'fill-caution-400/25 stroke-caution-400/50' : 'fill-ink/10'} strokeDasharray="3 3" />
            case 'sign':
              return (
                <text key={i} x={sx(f.x)} y={sy(f.y)} textAnchor="middle" className="fill-ink-muted text-[11px]">
                  {f.text}
                </text>
              )
            default:
              return null
          }
        })}

        {frame.actors.map((a) => (
          <g key={a.id} data-actor={a.kind} transform={`translate(${sx(a.x)},${sy(a.y)}) rotate(${a.heading})`} className={cn(night && a.unlit && 'opacity-90')}>
            <ActorShape a={a} k={k} />
            {a.braking && <rect x={-0.8 * k} y={(a.kind === 'truck' ? 11.8 : 4) * k} width={1.6 * k} height={0.25 * k} className="fill-danger-500" />}
            {a.indicator && Math.floor(frame.t * 2.6) % 2 === 0 && <circle cx={(a.indicator === 'right' ? 1 : -1) * 1.1 * k} cy={0.3 * k} r={0.25 * k} className="fill-caution-400" />}
          </g>
        ))}

        {/* Darkness outside the headlight beam; the rider's own motorcycle stays visible above it. */}
        {night && (
          <g pointerEvents="none">
            <rect width={W} height={H} className="fill-bg" opacity={0.9} mask={`url(#mask-${uid})`} />
          </g>
        )}
        <g opacity={bike.down ? 0.85 : 1}>
          <TopBike x={sx(bike.x)} y={sy(bike.y) + 1 * k} scale={k * 1.25} heading={bike.heading + (bike.down ? 70 : 0)} indicator={bike.indicator ?? null} blink={Math.floor(frame.t * 2.6) % 2 === 0} />
          {bike.pillion && <circle cx={sx(bike.x - Math.sin(headingRad) * 0.5)} cy={sy(bike.y - Math.cos(headingRad) * 0.5) + 1 * k} r={0.14 * k * 1.25} className="fill-coolant-400 stroke-ink-muted" strokeWidth={1} />}
          {bike.braking && !bike.down && <rect x={sx(bike.x) - 0.12 * k} y={sy(bike.y) + 1 * k + 0.95 * k * 1.25} width={0.24 * k} height={0.12 * k} className="fill-danger-500" />}
        </g>

        {scene.weather === 'rain' && (
          <g pointerEvents="none" className="stroke-coolant-200/30" strokeWidth={1}>
            {Array.from({ length: 70 }, (_, i) => {
              const x = (i * 97) % W
              const y = (i * 53 + frame.t * 600) % H
              return <line key={i} x1={x} y1={y} x2={x - 4} y2={y + 12} />
            })}
          </g>
        )}
      </g>
    </svg>
  )
}
