import { motion, useTransform, type MotionValue } from 'motion/react'
import { DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { GEARS } from '@/lib/mechanics/gearbox'
import { cn } from '@/lib/cn'

/*
 * Live five-speed constant-mesh gearbox (side view, shafts horizontal).
 *
 * Every pair is always in mesh, so every pair turns whenever the mainshaft turns; only
 * the selected pair is locked to the countershaft by its dogs. Each gear's teeth (the
 * dashed line across its face) move at its pitch-line speed — equal for both gears of a
 * pair, in opposite directions on the visible faces because meshing gears counter-rotate.
 * Angles are the shared, slowed-down visual angles from the simulation.
 */

const MAIN_Y = 78
const COUNTER_Y = 172
const CENTRE = COUNTER_Y - MAIN_Y
const GEAR_X = [130, 186, 242, 298, 354]
const GEAR_W = 26
const rad = (deg: number) => (deg * Math.PI) / 180

function Pair({ i, active, mainshaft }: { i: number; active: boolean; mainshaft: MotionValue<number> }) {
  const pair = GEARS[i]
  const rMain = (CENTRE * pair.main) / (pair.main + pair.counter)
  const rCounter = CENTRE - rMain
  // Pitch-line travel is the same for both gears of the pair.
  const mainTeeth = useTransform(mainshaft, (a) => rad(a) * rMain * 3)
  const counterTeeth = useTransform(mainshaft, (a) => -rad(a) * rMain * 3)
  const cls = active ? 'fill-coolant-950 stroke-coolant-400' : 'fill-surface-raised stroke-line-strong'
  const x = GEAR_X[i]
  return (
    <g data-gear={i + 1}>
      <rect x={x - GEAR_W / 2} y={MAIN_Y - rMain} width={GEAR_W} height={rMain * 2} rx={3} strokeWidth={1.5} className={cls} />
      <rect x={x - GEAR_W / 2} y={COUNTER_Y - rCounter} width={GEAR_W} height={rCounter * 2} rx={3} strokeWidth={1.5} className={cls} />
      <motion.line x1={x} x2={x} y1={MAIN_Y - rMain + 2} y2={MAIN_Y + rMain - 2} strokeWidth={10} strokeDasharray="2 3" className={active ? 'stroke-coolant-600' : 'stroke-line'} style={{ strokeDashoffset: mainTeeth }} />
      <motion.line x1={x} x2={x} y1={COUNTER_Y - rCounter + 2} y2={COUNTER_Y + rCounter - 2} strokeWidth={10} strokeDasharray="2 3" className={active ? 'stroke-coolant-600' : 'stroke-line'} style={{ strokeDashoffset: counterTeeth }} />
      {active && (
        // Dogs: lugs locking the selected countershaft gear to its shaft.
        <g className="fill-coolant-300">
          <rect x={x + GEAR_W / 2} y={COUNTER_Y - 8} width={7} height={5} />
          <rect x={x + GEAR_W / 2} y={COUNTER_Y + 3} width={7} height={5} />
        </g>
      )}
      <DiagramLabel x={x} y={244} anchor="middle" tone={active ? 'coolant' : 'muted'}>
        {String(i + 1)}
      </DiagramLabel>
    </g>
  )
}

export function GearboxView({
  gear,
  clamp,
  basket,
  mainshaft,
  countershaft,
}: {
  gear: number
  clamp: number
  basket: MotionValue<number>
  mainshaft: MotionValue<number>
  countershaft: MotionValue<number>
}) {
  const basketRot = useTransform(basket, (a) => -a)
  const hubRot = useTransform(mainshaft, (a) => -a)
  const mainShaftFlow = useTransform(mainshaft, (a) => rad(a) * 12)
  const counterShaftFlow = useTransform(countershaft, (a) => -rad(a) * 12)
  const flowing = gear > 0 && clamp > 0
  const x = gear ? GEAR_X[gear - 1] : 0
  const path = `M50,${MAIN_Y} L${x},${MAIN_Y} L${x},${COUNTER_Y} L452,${COUNTER_Y}`
  const flow = useTransform(mainshaft, (a) => -rad(a) * 20)

  return (
    <svg viewBox="0 0 480 252" className="w-full" role="img" aria-label={gear ? `Gearbox in gear ${gear}` : 'Gearbox in neutral'}>
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Shafts, with moving markings showing their rotation */}
        <line x1={40} x2={400} y1={MAIN_Y} y2={MAIN_Y} strokeWidth={8} className="stroke-surface-overlay" />
        <motion.line x1={40} x2={400} y1={MAIN_Y} y2={MAIN_Y} strokeWidth={8} strokeDasharray="3 9" className="stroke-line-strong" style={{ strokeDashoffset: mainShaftFlow }} />
        <line x1={90} x2={448} y1={COUNTER_Y} y2={COUNTER_Y} strokeWidth={8} className="stroke-surface-overlay" />
        <motion.line x1={90} x2={448} y1={COUNTER_Y} y2={COUNTER_Y} strokeWidth={8} strokeDasharray="3 9" className="stroke-line-strong" style={{ strokeDashoffset: counterShaftFlow }} />

        {/* Clutch: basket from the crankshaft, hub on the mainshaft */}
        <motion.g style={{ x: 34, y: MAIN_Y, rotate: basketRot }}>
          <circle r={30} strokeWidth={1.5} className="fill-surface-raised stroke-line-strong" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={25} y={-3} width={6} height={6} transform={`rotate(${i * 45})`} className="fill-ink-subtle" />
          ))}
        </motion.g>
        <motion.g style={{ x: 34, y: MAIN_Y, rotate: hubRot }}>
          <circle r={17} strokeWidth={2} className={cn('fill-surface-overlay', clamp >= 0.999 ? 'stroke-ok-400' : clamp > 0 ? 'stroke-caution-400' : 'stroke-line-strong')} />
          <line x1={-14} x2={14} y1={0} y2={0} strokeWidth={3} className="stroke-coolant-600" />
        </motion.g>

        {GEARS.map((_, i) => (
          <Pair key={i} i={i} active={gear === i + 1} mainshaft={mainshaft} />
        ))}

        {/* Front sprocket on the countershaft */}
        <motion.g style={{ x: 452, y: COUNTER_Y, rotate: countershaft }}>
          <circle r={18} strokeWidth={1.5} className="fill-surface-raised stroke-ink-subtle" />
          <line x1={0} y1={0} x2={15} y2={0} strokeWidth={3} className="stroke-ink-subtle" />
        </motion.g>

        {flowing && <motion.path d={path} fill="none" strokeWidth={3.5} strokeDasharray="10 8" className="stroke-coolant-300" style={{ strokeDashoffset: flow }} />}

        <DiagramLabel x={34} y={124} anchor="middle">Clutch</DiagramLabel>
        <DiagramLabel x={408} y={MAIN_Y + 4}>Mainshaft</DiagramLabel>
        <DiagramLabel x={420} y={COUNTER_Y + 34} anchor="middle">Countershaft</DiagramLabel>
        <DiagramLabel x={452} y={COUNTER_Y - 26} anchor="middle">Sprocket</DiagramLabel>
        <DiagramLabel x={60} y={244}>Pair</DiagramLabel>
      </g>
    </svg>
  )
}
