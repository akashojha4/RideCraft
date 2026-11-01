import { useState, type PointerEvent } from 'react'
import type { Sample } from '@/hooks/usePowertrainSim'

/*
 * Road speed over the last 12 seconds, one series on one axis. A target band, when an
 * exercise has one, is shaded behind it. Hover (mouse) for values.
 */

const WINDOW = 12
const P = { left: 34, right: 440, top: 12, bottom: 118 }

export function SpeedChart({ samples, now, band }: { samples: Sample[]; now: number; band?: [number, number] }) {
  const [hover, setHover] = useState<number | null>(null)
  const peak = Math.max(20, band?.[1] ?? 0, ...samples.map((s) => s.kmh))
  const max = Math.ceil(peak / 20) * 20
  const x = (t: number) => P.right - ((now - t) / WINDOW) * (P.right - P.left)
  const y = (v: number) => P.bottom - (Math.min(Math.max(v, 0), max) / max) * (P.bottom - P.top)
  const line = samples.map((s, i) => `${i ? 'L' : 'M'}${x(s.t).toFixed(1)},${y(s.kmh).toFixed(1)}`).join(' ')
  const hovered = hover !== null && samples.length ? samples.reduce((a, b) => (Math.abs(b.t - hover) < Math.abs(a.t - hover) ? b : a)) : null
  const ticks = Array.from({ length: max / 20 + 1 }, (_, i) => i * 20)

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') return
    const ctm = e.currentTarget.getScreenCTM()
    if (!ctm) return
    const px = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse()).x
    if (px < P.left || px > P.right) return setHover(null)
    setHover(now - ((P.right - px) / (P.right - P.left)) * WINDOW)
  }

  return (
    <figure className="space-y-2">
      <svg viewBox="0 0 460 140" className="w-full" role="img" aria-label="Road speed over the last 12 seconds" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {band && <rect x={P.left} width={P.right - P.left} y={y(band[1])} height={y(band[0]) - y(band[1])} className="fill-ok-500/15" />}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={P.left} x2={P.right} y1={y(v)} y2={y(v)} strokeWidth={1} className="stroke-line" />
            <text x={P.left - 6} y={y(v) + 3.5} textAnchor="end" className="tabular fill-ink-subtle font-mono text-[9px]">
              {v}
            </text>
          </g>
        ))}
        <text x={P.left} y={P.bottom + 16} className="fill-ink-subtle text-[9px]">
          −12 s
        </text>
        <text x={P.right} y={P.bottom + 16} textAnchor="end" className="fill-ink-subtle text-[9px]">
          now
        </text>
        <path d={line} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-coolant-400" />
        {hovered && (
          <g>
            <line x1={x(hovered.t)} x2={x(hovered.t)} y1={P.top} y2={P.bottom} strokeWidth={1} className="stroke-ink-muted" />
            <circle cx={x(hovered.t)} cy={y(hovered.kmh)} r={4} strokeWidth={2} className="fill-coolant-400 stroke-bg" />
            <rect x={Math.min(x(hovered.t) + 6, P.right - 86)} y={P.top} width={84} height={24} rx={6} className="fill-surface-overlay stroke-line-strong" />
            <text x={Math.min(x(hovered.t) + 12, P.right - 80)} y={P.top + 16} className="tabular fill-ink font-mono text-[10px]">
              {`${hovered.kmh.toFixed(1)} km/h`}
            </text>
          </g>
        )}
      </svg>
      <figcaption className="flex gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-coolant-400" aria-hidden /> Speed, km/h
        </span>
        {band && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 bg-ok-500/15" aria-hidden /> Target {band[0]}–{band[1]} km/h
          </span>
        )}
      </figcaption>
    </figure>
  )
}
