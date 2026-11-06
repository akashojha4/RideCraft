import { useTransform, type MotionValue } from 'motion/react'
import { MotorcycleSideView } from '@/components/motorcycle/MotorcycleSideView'
import type { PartId } from '@/components/motorcycle/parts'
import { G, frontShare } from '@/lib/mechanics/braking'
import type { PowertrainState } from '@/lib/mechanics/powertrain'

/*
 * Close-up of the motorcycle, facing right (the drawing mirrored so it travels the same
 * way as the road view). It pitches with the load transfer — nose down under braking,
 * squatting under acceleration — and the overlay shows the load on each tyre (vertical
 * arrows) and each brake's force at the contact patch (horizontal arrows, pointing
 * back). The overlay shares the drawing's viewBox, mirrored: x' = 810 − x.
 */

const VIEWBOX = '60 60 690 394'
const GROUND_Y = 440
const FRONT_X = 810 - 180
const REAR_X = 810 - 600
/** Degrees of pitch per g of load transfer (suspension travel, exaggerated slightly for visibility). */
const PITCH_PER_G = 3
const LOAD_SCALE = 190
const FORCE_SCALE = 260

function LoadArrow({ x, share }: { x: number; share: number }) {
  const len = 30 + share * LOAD_SCALE
  return (
    <g>
      <line x1={x} y1={GROUND_Y} x2={x} y2={GROUND_Y - len} strokeWidth={5} className="stroke-coolant-400" />
      <path d={`M${x - 10},${GROUND_Y - len + 12} L${x},${GROUND_Y - len} L${x + 10},${GROUND_Y - len + 12}`} fill="none" strokeWidth={5} className="stroke-coolant-400" />
      <text x={x + 14} y={GROUND_Y - len + 8} className="tabular fill-ink font-mono text-[20px]">
        {Math.round(share * 100)} %
      </text>
    </g>
  )
}

function ForceArrow({ x, force, weight, locked }: { x: number; force: number; weight: number; locked: boolean }) {
  if (force < 1) return null
  const len = Math.max(12, (force / weight) * FORCE_SCALE)
  const cls = locked ? 'stroke-danger-400' : 'stroke-ignition-400'
  return (
    <g>
      <line x1={x} y1={GROUND_Y - 4} x2={x - len} y2={GROUND_Y - 4} strokeWidth={6} className={cls} />
      <path d={`M${x - len + 12},${GROUND_Y - 14} L${x - len},${GROUND_Y - 4} L${x - len + 12},${GROUND_Y + 6}`} fill="none" strokeWidth={6} className={cls} />
    </g>
  )
}

export function BrakingView({
  state,
  weight,
  frontWheel,
  rearWheel,
  road,
  highlighted,
}: {
  state: PowertrainState
  /** Parts to highlight on the motorcycle (from the cause-and-effect strip). */
  highlighted?: readonly PartId[]
  weight: number
  frontWheel: MotionValue<number>
  rearWheel: MotionValue<number>
  road: MotionValue<number>
}) {
  const share = frontShare(state.loadAccel)
  const pitch = (-state.loadAccel / G) * PITCH_PER_G
  const { front, rear } = state.brakes
  const front2 = useTransform(frontWheel, (a) => -a)
  const rear2 = useTransform(rearWheel, (a) => -a)
  const road2 = useTransform(road, (a) => -a)
  // Pivot near the contact patch that takes the load: front under braking, rear under acceleration.
  const pivot = pitch >= 0 ? FRONT_X : REAR_X

  return (
    <div className="relative">
      <div style={{ transform: `rotate(${pitch.toFixed(2)}deg)`, transformOrigin: `${((pivot - 60) / 690) * 100}% ${((GROUND_Y - 60) / 394) * 100}%` }}>
        <div style={{ transform: 'scaleX(-1)' }}>
          <MotorcycleSideView mode="rider" highlighted={highlighted} wheelAngle={rear2} frontWheelAngle={front2} roadAngle={road2} title="Motorcycle with rider, facing the direction of travel" />
        </div>
      </div>
      <svg viewBox={VIEWBOX} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <LoadArrow x={FRONT_X} share={share} />
        <LoadArrow x={REAR_X} share={1 - share} />
        <ForceArrow x={FRONT_X} force={front.force} weight={weight} locked={front.locked} />
        <ForceArrow x={REAR_X} force={rear.force} weight={weight} locked={rear.locked} />
        {(
          [
            [FRONT_X, front],
            [REAR_X, rear],
          ] as const
        ).map(([x, w]) =>
          w.locked || w.abs ? (
            <text key={x} x={x} y={GROUND_Y - 200} textAnchor="middle" className={w.locked ? 'fill-danger-400 text-[22px] font-semibold' : 'fill-ok-400 text-[22px] font-semibold'}>
              {w.locked ? 'LOCKED' : 'ABS'}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  )
}
