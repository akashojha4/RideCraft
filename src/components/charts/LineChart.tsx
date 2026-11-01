import { useId, useState, type PointerEvent } from 'react'
import { cn } from '@/lib/cn'

/*
 * One-axis line chart for mechanics illustrations. Series are direct-labelled at their
 * ends (and listed in a legend when there is more than one), the grid is recessive, and
 * hovering with a mouse shows a crosshair with every series' value at that x.
 * Emphasis colouring: the series that matters is in an accent; the rest are muted.
 */

export type SeriesTone = 'ignition' | 'coolant' | 'muted' | 'danger'

export interface Series {
  id: string
  label: string
  points: [number, number][]
  tone: SeriesTone
  dashed?: boolean
}

export interface Axis {
  min: number
  max: number
  ticks: number[]
  label: string
  format?: (v: number) => string
}

const STROKE: Record<SeriesTone, string> = { ignition: 'stroke-ignition-400', coolant: 'stroke-coolant-400', muted: 'stroke-ink-subtle', danger: 'stroke-danger-400' }
const BG: Record<SeriesTone, string> = { ignition: 'bg-ignition-400', coolant: 'bg-coolant-400', muted: 'bg-ink-subtle', danger: 'bg-danger-400' }

function valueAt(points: [number, number][], x: number) {
  if (!points.length || x < points[0][0] || x > points[points.length - 1][0]) return null
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] >= x) {
      const [x0, y0] = points[i - 1]
      const [x1, y1] = points[i]
      return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
    }
  }
  return points[points.length - 1][1]
}

export function LineChart({
  series,
  x,
  y,
  marker,
  bands,
  height = 200,
  label,
  valueFormat = (v) => v.toFixed(1),
  legend = series.length > 1,
  directLabels = series.length > 1,
}: {
  series: Series[]
  x: Axis
  y: Axis
  /** A vertical line marking the current value of x. */
  marker?: { x: number; label?: string }
  /** Shaded x ranges, e.g. where a valve is open. */
  bands?: { from: number; to: number; label?: string; tone?: SeriesTone }[]
  height?: number
  label: string
  valueFormat?: (v: number) => string
  legend?: boolean
  directLabels?: boolean
}) {
  const uid = useId().replace(/:/g, '')
  const W = 460
  const P = { left: 46, right: series.length > 1 ? 380 : 440, top: 14, bottom: height - 30 }
  const sx = (v: number) => P.left + ((v - x.min) / (x.max - x.min)) * (P.right - P.left)
  const sy = (v: number) => P.bottom - ((Math.min(y.max, Math.max(y.min, v)) - y.min) / (y.max - y.min)) * (P.bottom - P.top)
  const [hover, setHover] = useState<number | null>(null)
  const fx = x.format ?? ((v: number) => String(v))
  const fy = y.format ?? ((v: number) => String(v))

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') return
    const ctm = e.currentTarget.getScreenCTM()
    if (!ctm) return
    const px = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse()).x
    if (px < P.left || px > P.right) return setHover(null)
    setHover(x.min + ((px - P.left) / (P.right - P.left)) * (x.max - x.min))
  }

  // Direct labels at each series' last point, nudged apart so they don't overlap.
  const ends = series
    .map((s) => ({ s, yv: s.points.length ? sy(s.points[s.points.length - 1][1]) : 0, xv: s.points.length ? sx(s.points[s.points.length - 1][0]) : 0 }))
    .sort((a, b) => a.yv - b.yv)
  for (let i = 1; i < ends.length; i++) if (ends[i].yv - ends[i - 1].yv < 11) ends[i].yv = ends[i - 1].yv + 11

  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img" aria-label={label} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <defs>
          <clipPath id={`plot-${uid}`}>
            <rect x={P.left} y={P.top - 2} width={P.right - P.left} height={P.bottom - P.top + 4} />
          </clipPath>
        </defs>
        {bands?.map((b, i) => (
          <g key={i}>
            <rect x={sx(Math.max(x.min, b.from))} y={P.top} width={Math.max(0, sx(Math.min(x.max, b.to)) - sx(Math.max(x.min, b.from)))} height={P.bottom - P.top} className={b.tone === 'ignition' ? 'fill-ignition-500/10' : 'fill-coolant-500/10'} />
            {b.label && (
              <text x={sx(Math.max(x.min, b.from)) + 4} y={P.top + 10} className="fill-ink-subtle text-[9px]">
                {b.label}
              </text>
            )}
          </g>
        ))}
        {y.ticks.map((t) => (
          <g key={t}>
            <line x1={P.left} x2={P.right} y1={sy(t)} y2={sy(t)} strokeWidth={1} className="stroke-line" />
            <text x={P.left - 6} y={sy(t) + 3.5} textAnchor="end" className="tabular fill-ink-subtle font-mono text-[9px]">
              {fy(t)}
            </text>
          </g>
        ))}
        {x.ticks.map((t) => (
          <text key={t} x={sx(t)} y={P.bottom + 14} textAnchor="middle" className="tabular fill-ink-subtle font-mono text-[9px]">
            {fx(t)}
          </text>
        ))}
        <text x={P.right} y={height - 2} textAnchor="end" className="fill-ink-subtle text-[9px]">
          {x.label}
        </text>
        <text x={P.left} y={P.top - 4} className="fill-ink-subtle text-[9px]">
          {y.label}
        </text>
        <g clipPath={`url(#plot-${uid})`}>
          {[...series].sort((a, b) => (a.tone === 'muted' ? -1 : 0) - (b.tone === 'muted' ? -1 : 0)).map((s) => (
            <path
              key={s.id}
              data-series={s.id}
              d={s.points.map(([px, py], i) => `${i ? 'L' : 'M'}${sx(px).toFixed(1)},${sy(py).toFixed(1)}`).join(' ')}
              fill="none"
              strokeWidth={s.tone === 'muted' ? 1.5 : 2}
              strokeDasharray={s.dashed ? '5 4' : undefined}
              strokeLinejoin="round"
              className={STROKE[s.tone]}
            />
          ))}
        </g>
        {directLabels &&
          ends.map(({ s, yv, xv }) => (
            <text key={s.id} x={Math.min(xv, P.right) + 6} y={yv + 3.5} className={cn('text-[10px]', s.tone === 'muted' ? 'fill-ink-subtle' : 'fill-ink')}>
              {s.label}
            </text>
          ))}
        {marker && (
          <g>
            <line x1={sx(marker.x)} x2={sx(marker.x)} y1={P.top} y2={P.bottom} strokeWidth={1.5} className="stroke-ink-muted" />
            {marker.label && (
              <text x={sx(marker.x) + 4} y={P.bottom - 4} className="fill-ink-muted text-[9px]">
                {marker.label}
              </text>
            )}
          </g>
        )}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={sx(hover)} x2={sx(hover)} y1={P.top} y2={P.bottom} strokeWidth={1} className="stroke-ink-muted" />
            {series.map((s) => {
              const v = valueAt(s.points, hover)
              return v === null ? null : <circle key={s.id} cx={sx(hover)} cy={sy(v)} r={3.5} strokeWidth={2} className={cn('fill-bg', STROKE[s.tone])} />
            })}
            {(() => {
              const rows = series.map((s) => ({ s, v: valueAt(s.points, hover) })).filter((r) => r.v !== null)
              return (
                <g transform={`translate(${Math.min(sx(hover) + 8, P.right - 120)},${P.top + 4})`}>
                  <rect width={118} height={16 + 13 * rows.length} rx={5} className="fill-surface-overlay stroke-line-strong" />
                  <text x={8} y={13} className="tabular fill-ink-muted font-mono text-[9px]">
                    {`${x.label.split(',')[0]}: ${fx(Math.round(hover * 10) / 10)}`}
                  </text>
                  {rows.map(({ s, v }, i) => (
                    <text key={s.id} x={8} y={26 + 13 * i} className="tabular fill-ink font-mono text-[9px]">
                      {`${s.label.trim()}: ${valueFormat(v as number)}`}
                    </text>
                  ))}
                </g>
              )
            })()}
          </g>
        )}
      </svg>
      {legend && (
        <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
          {series.map((s) => (
            <span key={s.id} className="flex items-center gap-1.5">
              <span className={cn('h-0.5 w-4', BG[s.tone], s.dashed && 'opacity-60')} aria-hidden /> {s.label}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  )
}
