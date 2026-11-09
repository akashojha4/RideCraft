import { cn } from '@/lib/cn'
import { GROUND, Motorcycle, along } from './LiftTechnique'

/*
 * Walking beside the motorcycle, seen from behind: nearly upright and leaning slightly towards
 * you, its weight is easy to hold; leaned further, the weight you must hold grows quickly.
 * The figure in your hands balances the tipping moment about the tyres: weight × centre-of-mass
 * height × sin(lean), held at the handlebar — a rough figure, for a sense of scale.
 */

const WEIGHT_KG = 120
/** Centre-of-mass height over handlebar height, for a small motorcycle (about 0.55 m / 1 m). */
const LEVER = 0.55

const cases = [
  { deg: -6, good: true, title: 'Nearly upright, leaning slightly towards you', note: 'Easy to hold — walk it, front brake to stop.' },
  { deg: -24, good: false, title: 'Leaned too far', note: 'Too heavy to catch — step clear and let it down gently.' },
]

export default function WalkingLean() {
  return (
    <svg viewBox="0 0 660 240" className="w-full" role="img" aria-label="Walking a motorcycle, seen from behind: nearly upright and leaning slightly towards you it is easy to hold; leaned far over it is too heavy to catch, so let it down gently.">
      {cases.map((k, i) => {
        const x0 = i * 330
        const c = x0 + 130
        const bar = along(c, k.deg, 112)
        const side = Math.round(WEIGHT_KG * LEVER * Math.sin((Math.abs(k.deg) * Math.PI) / 180))
        const hips = { x: c + 52, y: GROUND - 74 }
        return (
          <g key={k.title}>
            <line x1={x0 + 20} y1={GROUND} x2={x0 + 300} y2={GROUND} className="stroke-line-strong" strokeWidth={2} />
            <Motorcycle c={c} deg={k.deg} />
            {/* the rider, standing beside it with a hand on the bar */}
            <g className="stroke-ignition-400" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <polyline points={`${hips.x - 6},${GROUND} ${hips.x},${hips.y} ${hips.x + 8},${GROUND}`} />
              <line x1={hips.x} y1={hips.y} x2={hips.x} y2={hips.y - 46} />
              <polyline points={`${hips.x},${hips.y - 38} ${bar.x + 4},${bar.y + 2}`} />
              <circle cx={hips.x} cy={hips.y - 58} r={9} className="fill-bg" />
            </g>
            <text x={x0 + 20} y={22} className={cn('text-[13px] font-medium', k.good ? 'fill-ok-400' : 'fill-caution-400')}>
              {k.good ? '✓' : '✕'} {k.title}
            </text>
            <text x={x0 + 20} y={40} className="fill-ink-muted text-[11px]">
              Roughly {side} kg to hold at the handlebar
            </text>
            <text x={x0 + 20} y={GROUND + 24} className="fill-ink-muted text-[11px]">
              {k.note}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
