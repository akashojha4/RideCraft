import { useState, type PointerEvent } from 'react'
import type { Sample } from '@/hooks/usePowertrainSim'

/*
 * The last 12 seconds of engine RPM and wheel-side RPM, on one axis. Engine in the
 * accent, wheel side muted, both direct-labelled at the right; hover (mouse) for values.
 */

const WINDOW = 12
const MAX = 10000
const P = { left: 40, right: 400, top: 12, bottom: 138 }
const x = (t: number, now: number) => P.right - ((now - t) / WINDOW) * (P.right - P.left)
const y = (rpm: number) => P.bottom - (Math.min(Math.max(rpm, 0), MAX) / MAX) * (P.bottom - P.top)

export function StripChart({ samples, now }: { samples: Sample[]; now: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const line = (key: 'engineRpm' | 'wheelRpm') => samples.map((s, i) => `${i ? 'L' : 'M'}${x(s.t, now).toFixed(1)},${y(s[key]).toFixed(1)}`).join(' ')
  const last = samples[samples.length - 1]
  const hovered = hover !== null && samples.length ? samples.reduce((a, b) => (Math.abs(b.t - hover) < Math.abs(a.t - hover) ? b : a)) : null

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
      <svg viewBox="0 0 460 160" className="w-full" role="img" aria-label="Engine and wheel-side RPM over the last 12 seconds" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {[0, 2500, 5000, 7500, 10000].map((r) => (
          <g key={r}>
            <line x1={P.left} x2={P.right} y1={y(r)} y2={y(r)} strokeWidth={1} className="stroke-line" />
            <text x={P.left - 6} y={y(r) + 3.5} textAnchor="end" className="tabular fill-ink-subtle font-mono text-[9px]">
              {r / 1000}k
            </text>
          </g>
        ))}
        <text x={P.left} y={P.bottom + 16} className="fill-ink-subtle text-[9px]">
          −12 s
        </text>
        <text x={P.right} y={P.bottom + 16} textAnchor="end" className="fill-ink-subtle text-[9px]">
          now
        </text>
        <path d={line('wheelRpm')} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-ink-muted" />
        <path d={line('engineRpm')} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-coolant-400" />
        {last && (
          <>
            <text x={P.right + 6} y={y(last.engineRpm) + (last.engineRpm >= last.wheelRpm ? -2 : 10)} className="fill-ink text-[10px]">
              Engine
            </text>
            <text x={P.right + 6} y={y(last.wheelRpm) + (last.engineRpm >= last.wheelRpm ? 10 : -2)} className="fill-ink-muted text-[10px]">
              Wheel side
            </text>
          </>
        )}
        {hovered && (
          <g>
            <line x1={x(hovered.t, now)} x2={x(hovered.t, now)} y1={P.top} y2={P.bottom} strokeWidth={1} className="stroke-ink-muted" />
            <circle cx={x(hovered.t, now)} cy={y(hovered.engineRpm)} r={4} strokeWidth={2} className="fill-coolant-400 stroke-bg" />
            <circle cx={x(hovered.t, now)} cy={y(hovered.wheelRpm)} r={4} strokeWidth={2} className="fill-ink-muted stroke-bg" />
            <rect x={Math.min(x(hovered.t, now) + 6, P.right - 112)} y={P.top} width={110} height={40} rx={6} className="fill-surface-overlay stroke-line-strong" />
            <text x={Math.min(x(hovered.t, now) + 12, P.right - 106)} y={P.top + 16} className="tabular fill-ink font-mono text-[10px]">
              {`Engine ${Math.round(hovered.engineRpm)}`}
            </text>
            <text x={Math.min(x(hovered.t, now) + 12, P.right - 106)} y={P.top + 31} className="tabular fill-ink-muted font-mono text-[10px]">
              {`Wheel  ${Math.round(Math.max(0, hovered.wheelRpm))}`}
            </text>
          </g>
        )}
      </svg>
      <figcaption className="flex gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-coolant-400" aria-hidden /> Engine RPM
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-ink-muted" aria-hidden /> Wheel-side RPM
        </span>
      </figcaption>
    </figure>
  )
}
