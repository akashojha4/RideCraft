import { motion, useTransform, type MotionValue } from 'motion/react'
import { DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { cn } from '@/lib/cn'
import { cycleAngle } from '@/lib/mechanics/engine'

/*
 * Cutaway of a single-cylinder four-stroke engine, driven by crank angle in degrees.
 * One cycle = 720° (two crankshaft turns). 0° = piston at top dead centre (TDC) at the
 * start of the intake stroke.
 *
 * Piston position follows slider-crank geometry. Valve timing is simplified to open
 * exactly over their strokes (real engines open early and close late, with overlap);
 * ignition is shown slightly before TDC, as on a real engine.
 */

const CRANK = { x: 160, y: 240 }
const THROW = 30
const ROD = 95
const PIN_TO_CROWN = 16
const HEAD_Y = 80
const BORE_LEFT = 112
const BORE_WIDTH = 96
const MAX_LIFT = 11

function pinY(deg: number) {
  const t = (deg * Math.PI) / 180
  return CRANK.y - (THROW * Math.cos(t) + Math.sqrt(ROD ** 2 - (THROW * Math.sin(t)) ** 2))
}
const TDC_PIN_Y = pinY(0)

function lift(phase: number, start: number) {
  const local = phase - start
  return local > 0 && local < 180 ? MAX_LIFT * Math.sin((local * Math.PI) / 180) : 0
}

const gasClass = ['fill-coolant-400', 'fill-coolant-400', 'fill-caution-400', 'fill-ink-subtle']

function Valve({ x, offset }: { x: number; offset: MotionValue<number> }) {
  return (
    <motion.g style={{ y: offset }}>
      <line x1={x} y1={22} x2={x} y2={HEAD_Y - 4} strokeWidth={4} className="stroke-ink-subtle" />
      <path d={`M${x - 12},${HEAD_Y} L${x + 12},${HEAD_Y} L${x + 4},${HEAD_Y - 6} L${x - 4},${HEAD_Y - 6} Z`} className="fill-surface-overlay stroke-ink-muted" />
    </motion.g>
  )
}

export function FourStrokeEngine({
  crankAngle,
  stroke,
  className,
}: {
  /** Crank angle in degrees; any value, wrapped to the 720° cycle. */
  crankAngle: MotionValue<number>
  /** Current stroke index (0–3), used for gas colour. Derive with `strokeIndex`. */
  stroke: number
  className?: string
}) {
  const phase = useTransform(crankAngle, cycleAngle)
  const pistonOffset = useTransform(phase, (a) => pinY(a) - TDC_PIN_Y)
  const pistonPinY = useTransform(phase, pinY)
  const crankPinX = useTransform(phase, (a) => CRANK.x + THROW * Math.sin((a * Math.PI) / 180))
  const crankPinY = useTransform(phase, (a) => CRANK.y - THROW * Math.cos((a * Math.PI) / 180))
  const gasHeight = useTransform(phase, (a) => pinY(a) - PIN_TO_CROWN - HEAD_Y)
  const gasOpacity = useTransform(phase, (a) => {
    if (a < 180) return 0.12 + (a / 180) * 0.1
    if (a < 360) return 0.22 + ((a - 180) / 180) * 0.2
    if (a < 540) return 0.75 - ((a - 360) / 180) * 0.5
    return 0.28
  })
  const spark = useTransform(phase, (a) => (a > 345 && a < 385 ? 1 : 0))
  const intakeLift = useTransform(phase, (a) => lift(a, 0))
  const exhaustLift = useTransform(phase, (a) => lift(a, 540))
  const crownY = TDC_PIN_Y - PIN_TO_CROWN

  return (
    <svg viewBox="40 0 300 300" className={cn('w-full', className)} role="img" aria-label="Cutaway of a four-stroke engine cylinder showing piston, valves, spark plug, connecting rod and crankshaft">
      <g strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
        {/* Ports */}
        <path d={`M132,${HEAD_Y - 2} C132,60 118,46 70,44`} fill="none" strokeWidth={18} className="stroke-surface-overlay" />
        <path d={`M188,${HEAD_Y - 2} C188,60 202,46 250,44`} fill="none" strokeWidth={18} className="stroke-surface-overlay" />

        {/* Cylinder walls and crankcase */}
        <path d={`M100,30 L220,30 L220,${HEAD_Y} M100,30 L100,${HEAD_Y}`} fill="none" strokeWidth={3} className="stroke-line-strong" />
        <line x1={BORE_LEFT - 3} y1={HEAD_Y} x2={BORE_LEFT - 3} y2={198} strokeWidth={6} className="stroke-line-strong" />
        <line x1={BORE_LEFT + BORE_WIDTH + 3} y1={HEAD_Y} x2={BORE_LEFT + BORE_WIDTH + 3} y2={198} strokeWidth={6} className="stroke-line-strong" />
        <path d="M109,198 C80,205 92,292 160,292 C228,292 240,205 211,198" fill="none" strokeWidth={3} className="stroke-line-strong" />

        {/* Gas above the piston */}
        <motion.rect x={BORE_LEFT} y={HEAD_Y} width={BORE_WIDTH} height={gasHeight} className={gasClass[stroke]} style={{ opacity: gasOpacity }} />

        <Valve x={132} offset={intakeLift} />
        <Valve x={188} offset={exhaustLift} />

        {/* Spark plug and spark */}
        <line x1={160} y1={6} x2={160} y2={HEAD_Y + 2} strokeWidth={6} className="stroke-ink-subtle" />
        <motion.circle cx={160} cy={HEAD_Y + 6} r={9} className="fill-caution-400" style={{ opacity: spark }} />

        {/* Connecting rod */}
        <motion.line x1={160} y1={pistonPinY} x2={crankPinX} y2={crankPinY} strokeWidth={9} className="stroke-coolant-600" />

        {/* Piston with rings */}
        <motion.g style={{ y: pistonOffset }}>
          <rect x={BORE_LEFT + 2} y={crownY} width={BORE_WIDTH - 4} height={42} rx={3} className="fill-surface-raised stroke-coolant-400" />
          {[6, 11, 16].map((d) => (
            <line key={d} x1={BORE_LEFT + 2} x2={BORE_LEFT + BORE_WIDTH - 2} y1={crownY + d} y2={crownY + d} className="stroke-coolant-600" />
          ))}
          <circle cx={160} cy={TDC_PIN_Y} r={6} className="fill-bg stroke-coolant-400" />
        </motion.g>

        {/* Crankshaft: web with counterweight and crankpin */}
        <motion.g style={{ x: CRANK.x, y: CRANK.y, rotate: phase }}>
          <path d="M-40,8 A42,42 0 0 0 40,8 L12,-30 L-12,-30 Z" className="fill-surface-raised stroke-coolant-400" />
          <circle cx={0} cy={-THROW} r={8} className="fill-coolant-950 stroke-coolant-400" />
          <circle r={9} className="fill-bg stroke-coolant-400" />
        </motion.g>

        <DiagramLabel x={66} y={34}>Intake</DiagramLabel>
        <DiagramLabel x={254} y={34} anchor="end">Exhaust</DiagramLabel>
        <DiagramLabel x={250} y={140}>Piston</DiagramLabel>
        <DiagramLabel x={250} y={250}>Crankshaft</DiagramLabel>
        <DiagramLabel x={168} y={12}>Spark plug</DiagramLabel>
      </g>
    </svg>
  )
}
