import { motion, useTransform, type MotionValue } from 'motion/react'
import { DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { beltPath, sprocketPath } from '@/lib/geometry'
import { cn } from '@/lib/cn'

/*
 * Clutch → gearbox → chain → rear wheel for the starting simulator.
 * The clutch basket (driven by the crankshaft) and the clutch hub (on the gearbox
 * mainshaft) turn independently, so slip in the friction zone is visible. Meshing gears
 * turn in opposite directions; the chain keeps both sprockets turning the same way.
 */

const FRONT = { x: 170, y: 168, r: 12 }
const REAR = { x: 300, y: 168, r: 30 }
const CHAIN = beltPath(FRONT, REAR)
const REAR_SPROCKET = sprocketPath(36, REAR.r, 1.5, 2)
const FRONT_SPROCKET = sprocketPath(14, FRONT.r, 1.5, 2)

function Spokes({ r, count, className }: { r: number; count: number; className?: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <line key={i} x1={0} y1={0} x2={r} y2={0} strokeWidth={3} transform={`rotate(${(360 / count) * i})`} className={className} />
      ))}
    </>
  )
}

export function DrivetrainPanel({
  clamp,
  gear,
  angles,
}: {
  /** Clutch clamping force, 0–1. */
  clamp: number
  gear: number
  angles: { basket: MotionValue<number>; mainshaft: MotionValue<number>; countershaft: MotionValue<number>; wheel: MotionValue<number> }
}) {
  // Gear meshes reverse direction: crank (clockwise) → basket and mainshaft (anticlockwise) → countershaft (clockwise).
  const basket = useTransform(angles.basket, (a) => -a)
  const mainshaft = useTransform(angles.mainshaft, (a) => -a)
  const chainOffset = useTransform(angles.countershaft, (a) => -((a * Math.PI) / 180) * FRONT.r)
  const state = clamp >= 0.999 ? 'Engaged' : clamp <= 0.001 ? 'Disengaged' : 'Slipping'

  return (
    <svg viewBox="0 0 372 250" className="w-full" role="img" aria-label={`Clutch ${state.toLowerCase()}, ${gear ? 'first gear' : 'neutral'}`}>
      <g strokeLinejoin="round" strokeLinecap="round">
        {/* Clutch: basket (outer) and hub (inner) */}
        <motion.g style={{ x: 60, y: 90, rotate: basket }}>
          <circle r={40} strokeWidth={2} className="fill-surface-raised stroke-line-strong" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={34} y={-4} width={8} height={8} transform={`rotate(${i * 45})`} className="fill-ink-subtle" />
          ))}
        </motion.g>
        <circle cx={60} cy={90} r={27} strokeWidth={clamp > 0 ? 2.5 : 1} strokeDasharray={clamp > 0.001 ? undefined : '4 3'} className={cn('fill-bg', clamp >= 0.999 ? 'stroke-ok-400' : clamp > 0.001 ? 'stroke-caution-400' : 'stroke-line-strong')} />
        <motion.g style={{ x: 60, y: 90, rotate: mainshaft }}>
          <circle r={22} strokeWidth={2} className="fill-surface-overlay stroke-coolant-400" />
          <Spokes r={20} count={6} className="stroke-coolant-600" />
        </motion.g>
        <DiagramLabel x={60} y={150} anchor="middle">Clutch</DiagramLabel>
        <DiagramLabel x={60} y={164} anchor="middle" tone={state === 'Engaged' ? 'coolant' : 'muted'}>{state}</DiagramLabel>

        {/* Gearbox */}
        <rect x={120} y={36} width={90} height={110} rx={10} strokeWidth={1.5} className="fill-surface-sunken stroke-line-strong" />
        <line x1={84} y1={90} x2={150} y2={90} strokeWidth={4} className="stroke-coolant-600" />
        <motion.g style={{ x: 150, y: 90, rotate: mainshaft }}>
          <circle r={12} strokeWidth={2} className={gear ? 'fill-coolant-950 stroke-coolant-400' : 'fill-surface-raised stroke-line-strong'} />
          <Spokes r={10} count={4} className="stroke-ink-subtle" />
        </motion.g>
        <motion.g style={{ x: 170, y: 120, rotate: angles.countershaft }}>
          <circle r={24} strokeWidth={2} className={gear ? 'fill-coolant-950 stroke-coolant-400' : 'fill-surface-raised stroke-line-strong'} />
          <Spokes r={22} count={6} className="stroke-ink-subtle" />
        </motion.g>
        <line x1={170} y1={120} x2={FRONT.x} y2={FRONT.y} strokeWidth={4} className="stroke-coolant-600" />
        <text x={198} y={56} textAnchor="end" className={cn('font-mono text-[12px]', gear ? 'fill-coolant-300' : 'fill-ok-400')}>
          {gear ? '1st' : 'N'}
        </text>
        <DiagramLabel x={165} y={30} anchor="middle">Gearbox</DiagramLabel>

        {/* Final drive and rear wheel */}
        <motion.g style={{ x: REAR.x, y: REAR.y, rotate: angles.wheel }}>
          <circle r={62} fill="none" strokeWidth={10} className="stroke-surface-overlay" />
          <circle r={54} fill="none" strokeWidth={1.5} className="stroke-ink-subtle" />
          <Spokes r={52} count={5} className="stroke-line-strong" />
          <path d={REAR_SPROCKET} strokeWidth={1.5} className="fill-surface-raised stroke-ink-subtle" />
        </motion.g>
        <motion.g style={{ x: FRONT.x, y: FRONT.y, rotate: angles.countershaft }}>
          <path d={FRONT_SPROCKET} strokeWidth={1.5} className="fill-surface-raised stroke-ink-subtle" />
        </motion.g>
        <motion.path d={CHAIN} fill="none" strokeWidth={3.5} strokeDasharray="3 2.5" className="stroke-ink-muted" style={{ strokeDashoffset: chainOffset }} />
        <DiagramLabel x={REAR.x} y={246} anchor="middle">Rear wheel</DiagramLabel>
        <DiagramLabel x={FRONT.x} y={204} anchor="middle">Chain</DiagramLabel>
      </g>
    </svg>
  )
}
