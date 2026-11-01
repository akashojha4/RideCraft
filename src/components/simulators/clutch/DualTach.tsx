import { LIMITER_RPM } from '@/lib/mechanics/powertrain'

/*
 * A rev counter with two needles: engine RPM, and "wheel side" RPM — the speed the
 * engine would turn at if the clutch were locked at the current road speed. The shaded
 * gap between them is clutch slip; when the clutch locks the needles move as one.
 */

const MAX = 10000
const C = { x: 120, y: 120 }
const R = 92
const START = -210
const SWEEP = 240
const ang = (rpm: number) => START + (Math.min(Math.max(rpm, 0), MAX) / MAX) * SWEEP
const pt = (r: number, deg: number) => ({ x: C.x + r * Math.cos((deg * Math.PI) / 180), y: C.y + r * Math.sin((deg * Math.PI) / 180) })
const arc = (r: number, a0: number, a1: number) => {
  const p0 = pt(r, a0)
  const p1 = pt(r, a1)
  return `M${p0.x},${p0.y} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p1.x},${p1.y}`
}

export function DualTach({ engineRpm, wheelRpm, slipping }: { engineRpm: number; wheelRpm: number; slipping: boolean }) {
  const e = pt(R - 18, ang(engineRpm))
  const w = pt(R - 30, ang(wheelRpm))
  const lo = Math.min(ang(engineRpm), ang(wheelRpm))
  const hi = Math.max(ang(engineRpm), ang(wheelRpm))
  return (
    <figure className="space-y-2">
      <svg viewBox="10 10 220 190" className="mx-auto w-full max-w-xs" role="img" aria-label={`Engine ${Math.round(engineRpm)} RPM, wheel side ${Math.round(wheelRpm)} RPM`}>
        <g strokeLinecap="round">
          <path d={arc(R, START, START + SWEEP)} fill="none" strokeWidth={3} className="stroke-line-strong" />
          <path d={arc(R, ang(LIMITER_RPM - 500), START + SWEEP)} fill="none" strokeWidth={6} className="stroke-danger-500" />
          {slipping && hi - lo > 1 && <path d={arc(R - 24, lo, hi)} fill="none" strokeWidth={16} className="stroke-caution-400" opacity={0.3} />}
          {Array.from({ length: 11 }, (_, i) => {
            const a = ang(i * 1000)
            const p1 = pt(R - 4, a)
            const p2 = pt(R - 12, a)
            const t = pt(R + 12, a)
            return (
              <g key={i}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} strokeWidth={2} className="stroke-ink-subtle" />
                <text x={t.x} y={t.y + 4} textAnchor="middle" className="tabular fill-ink-subtle font-mono text-[11px]">
                  {i}
                </text>
              </g>
            )
          })}
          <line x1={C.x} y1={C.y} x2={w.x} y2={w.y} strokeWidth={4} className="stroke-ink-muted" />
          <line x1={C.x} y1={C.y} x2={e.x} y2={e.y} strokeWidth={4} className="stroke-coolant-400" />
          <circle cx={C.x} cy={C.y} r={7} className="fill-surface-overlay stroke-ink-subtle" />
          <text x={C.x} y={C.y + 40} textAnchor="middle" className="tabular fill-ink font-mono text-[20px]">
            {Math.round(engineRpm).toLocaleString('en')}
          </text>
          <text x={C.x} y={C.y + 56} textAnchor="middle" className="fill-ink-subtle font-mono text-[10px]">
            ENGINE RPM
          </text>
        </g>
      </svg>
      <figcaption className="flex justify-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-4 rounded bg-coolant-400" aria-hidden /> Engine
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-4 rounded bg-ink-muted" aria-hidden /> Wheel side
        </span>
        {slipping && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded bg-caution-400/40" aria-hidden /> Slip
          </span>
        )}
      </figcaption>
    </figure>
  )
}
