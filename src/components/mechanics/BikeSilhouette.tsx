import type { MotoType } from '@/content/illustrations/motorcycleTypes.data'

/** Simplified side view of a motorcycle type: wheels, fork, frame strokes, panels and bars. */
export function BikeSilhouette({ type: t }: { type: MotoType }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {[t.front, t.rear].map((w, i) => (
        <g key={i}>
          <circle cx={w.x} cy={w.y} r={w.r} fill="none" strokeWidth={9} className="stroke-surface-overlay" />
          <circle cx={w.x} cy={w.y} r={w.r - 10} fill="none" strokeWidth={1.5} className="stroke-ink-subtle" />
          <circle cx={w.x} cy={w.y} r={4} className="fill-ink-subtle" />
        </g>
      ))}
      <line x1={t.front.x} y1={t.front.y} x2={t.head.x} y2={t.head.y} strokeWidth={6} className="stroke-ink-subtle" />
      {t.strokes.map((d, i) => (
        <path key={i} d={d} fill="none" strokeWidth={5} className="stroke-line-strong" />
      ))}
      {t.panels.map((d, i) => (
        <path key={i} d={d} strokeWidth={1.5} className="fill-surface-raised stroke-line-strong" />
      ))}
      <line x1={t.head.x} y1={t.head.y} x2={t.hand.x} y2={t.hand.y} strokeWidth={4} className="stroke-ink-subtle" />
    </g>
  )
}
