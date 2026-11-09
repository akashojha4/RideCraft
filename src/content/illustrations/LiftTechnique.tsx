/*
 * Lifting a dropped motorcycle, seen from behind it: the motorcycle pivots about its tyres;
 * the rider turns their back to the seat, bends the knees and pushes it up with the legs.
 * A schematic, not to scale.
 */

export const GROUND = 186
const BIKE = 112 // tyre contact to the top of the handlebar
const SEAT_AT = 62 // tyre contact to the seat

export type P = { x: number; y: number }

/** A point `d` along the motorcycle, leaning `deg` from upright towards the left. */
export const along = (c: number, deg: number, d: number): P => {
  const r = (deg * Math.PI) / 180
  return { x: c - d * Math.sin(r), y: GROUND - d * Math.cos(r) }
}

export function Motorcycle({ c, deg }: { c: number; deg: number }) {
  const top = along(c, deg, BIKE)
  const seat = along(c, deg, SEAT_AT)
  return (
    <g>
      {/* tyres and frame, seen end-on as one tall shape */}
      <line x1={c} y1={GROUND} x2={top.x} y2={top.y} strokeWidth={16} strokeLinecap="round" className="stroke-surface-overlay" />
      <line x1={c} y1={GROUND} x2={top.x} y2={top.y} strokeWidth={2} className="stroke-ink-subtle" />
      {/* seat */}
      <circle cx={seat.x} cy={seat.y} r={11} className="fill-surface-raised stroke-ink-subtle" strokeWidth={1.5} />
      {/* handlebar end */}
      <circle cx={top.x} cy={top.y} r={5} className="fill-ink-subtle" />
    </g>
  )
}

/** A rider: hips, then torso and head; knees bent by `squat` (0 standing, 1 deep). Outlined so it reads as in front of the motorcycle. */
export function Rider({ hips, squat, lean = 0 }: { hips: P; squat: number; lean?: number }) {
  const foot = { x: hips.x + 24, y: GROUND }
  const knee = { x: hips.x + 12 + 24 * squat, y: (hips.y + GROUND) / 2 - 6 * squat }
  const shoulder = { x: hips.x + lean, y: hips.y - 44 }
  const hand = { x: hips.x - 18, y: hips.y + 6 }
  const figure = (
    <>
      <polyline points={`${hips.x},${hips.y} ${knee.x},${knee.y} ${foot.x},${foot.y}`} />
      <line x1={hips.x} y1={hips.y} x2={shoulder.x} y2={shoulder.y} />
      <polyline points={`${shoulder.x},${shoulder.y + 8} ${hand.x},${hand.y}`} />
    </>
  )
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <g className="stroke-bg" strokeWidth={10}>
        {figure}
        <circle cx={shoulder.x + 2} cy={shoulder.y - 12} r={9} />
      </g>
      <g className="stroke-ignition-400" strokeWidth={4}>
        {figure}
        <circle cx={shoulder.x + 2} cy={shoulder.y - 12} r={9} className="fill-bg" />
      </g>
    </g>
  )
}

const panels = [
  { n: 1, deg: 74, title: 'Make it safe', note: ['Engine off, ignition off.', 'Turn the bars towards the ground.'] },
  { n: 2, deg: 74, title: 'Back to the seat', note: ['Back against the seat, knees bent;', 'hands low on the bar and frame.'] },
  { n: 3, deg: 30, title: 'Push with your legs', note: ['Straighten your legs in small pushes.', 'Back straight — don’t pull with it.'] },
]

export default function LiftTechnique() {
  return (
    <svg viewBox="0 0 660 230" className="w-full" role="img" aria-label="Three steps to lift a dropped motorcycle: engine off and bars turned; back against the seat with knees bent; push it upright with the legs in small steps.">
      {panels.map((p, i) => {
        const x0 = i * 220
        const c = x0 + 150
        const seat = along(c, p.deg, SEAT_AT)
        // Panels 2 and 3: hips against the seat, back straight.
        const hips = p.n === 1 ? { x: x0 + 190, y: GROUND - 74 } : { x: seat.x + 6, y: seat.y - 8 }
        return (
          <g key={p.n}>
            <line x1={x0 + 10} y1={GROUND} x2={x0 + 210} y2={GROUND} className="stroke-line-strong" strokeWidth={2} />
            <Motorcycle c={c} deg={p.deg} />
            <Rider hips={hips} squat={p.n === 1 ? 0 : p.n === 2 ? 1 : 0.45} lean={p.n === 1 ? 0 : -4} />
            {p.n === 3 && (
              <path d={`M ${c - 112} ${GROUND - 28} q 8 -48 48 -72`} fill="none" className="stroke-coolant-400" strokeWidth={2.5} markerEnd="url(#lift-arrow)" />
            )}
            <text x={x0 + 14} y={20} className="fill-ink text-[13px] font-medium">
              {p.n}. {p.title}
            </text>
            <text x={x0 + 14} y={GROUND + 22} className="fill-ink-muted text-[11px]">
              {p.note.map((line, k) => (
                <tspan key={line} x={x0 + 14} dy={k === 0 ? 0 : 15}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}
      <defs>
        <marker id="lift-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-coolant-400" />
        </marker>
      </defs>
    </svg>
  )
}
