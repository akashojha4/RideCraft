import { motion, useTransform } from 'motion/react'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { useSimulationClock } from '@/hooks/useSimulationClock'
import { beltPath, sprocketPath } from '@/lib/geometry'

/*
 * Final drive: a 15-tooth front sprocket driving a 45-tooth rear sprocket.
 *
 * Pitch radius is drawn proportional to tooth count, so tooth pitch (and chain link
 * pitch) is identical on both sprockets, as on a real chain drive. The chain moves at
 * one linear speed; the larger rear sprocket therefore turns at 15/45 = 1/3 the speed
 * of the front sprocket and, ignoring losses, delivers 3× the torque.
 */

const FRONT_TEETH = 15
const REAR_TEETH = 45
const PX_PER_TOOTH = 2.2
const FRONT = { x: 120, y: 120, r: FRONT_TEETH * PX_PER_TOOTH }
const REAR = { x: 400, y: 120, r: REAR_TEETH * PX_PER_TOOTH }
const LINK_PITCH = 2 * Math.PI * PX_PER_TOOTH

/** Front sprocket speed at 1× playback: half a revolution per second. */
const FRONT_DEG_PER_SEC = 180

const CHAIN = beltPath(FRONT, REAR)
const FRONT_SPROCKET = sprocketPath(FRONT_TEETH, FRONT.r)
const REAR_SPROCKET = sprocketPath(REAR_TEETH, REAR.r)

export default function ChainDriveIllustration() {
  const clock = useSimulationClock()
  const frontDeg = useTransform(clock.time, (t) => t * FRONT_DEG_PER_SEC)
  const rearDeg = useTransform(frontDeg, (d) => (d * FRONT_TEETH) / REAR_TEETH)
  // Chain speed equals the front sprocket's surface speed at its pitch radius.
  const chainOffset = useTransform(frontDeg, (d) => -((d * Math.PI) / 180) * FRONT.r)
  const frontRevs = useTransform(frontDeg, (d) => (d / 360).toFixed(1))
  const rearRevs = useTransform(rearDeg, (d) => (d / 360).toFixed(1))

  return (
    <div className="space-y-4">
      <svg
        viewBox="0 0 520 250"
        className="w-full"
        role="img"
        aria-label="Animated chain drive: a small 15-tooth front sprocket drives a large 45-tooth rear sprocket through a chain. The rear sprocket turns once for every three turns of the front sprocket."
      >
        <motion.path
          d={CHAIN}
          fill="none"
          className="stroke-ink-subtle"
          strokeWidth={7}
          strokeDasharray={`${LINK_PITCH * 0.55} ${LINK_PITCH * 0.45}`}
          style={{ strokeDashoffset: chainOffset }}
        />

        <motion.g style={{ x: REAR.x, y: REAR.y, rotate: rearDeg }}>
          <path d={REAR_SPROCKET} className="fill-coolant-950 stroke-coolant-500" strokeWidth={1.5} />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle
              key={a}
              cx={Math.cos((a * Math.PI) / 180) * 58}
              cy={Math.sin((a * Math.PI) / 180) * 58}
              r={14}
              className="fill-bg stroke-coolant-600"
            />
          ))}
          <circle r={22} className="fill-surface-raised stroke-coolant-600" />
          <line x1={0} y1={0} x2={REAR.r - 8} y2={0} className="stroke-ignition-500" strokeWidth={3} strokeLinecap="round" />
        </motion.g>

        <motion.g style={{ x: FRONT.x, y: FRONT.y, rotate: frontDeg }}>
          <path d={FRONT_SPROCKET} className="fill-coolant-950 stroke-coolant-500" strokeWidth={1.5} />
          <circle r={11} className="fill-surface-raised stroke-coolant-600" />
          <line x1={0} y1={0} x2={FRONT.r - 6} y2={0} className="stroke-ignition-500" strokeWidth={3} strokeLinecap="round" />
        </motion.g>

        <g className="fill-ink-muted font-mono text-[11px]" textAnchor="middle">
          <text x={FRONT.x} y={238}>Front · {FRONT_TEETH}T</text>
          <text x={REAR.x} y={238}>Rear · {REAR_TEETH}T</text>
        </g>
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PlaybackControls clock={clock} />
        <dl className="tabular flex gap-5 font-mono text-xs text-ink-muted">
          <div>
            <dt className="text-ink-subtle">Ratio</dt>
            <dd className="text-ink">{(REAR_TEETH / FRONT_TEETH).toFixed(2)} : 1</dd>
          </div>
          <div>
            <dt className="text-ink-subtle">Front revs</dt>
            <motion.dd className="text-coolant-300">{frontRevs}</motion.dd>
          </div>
          <div>
            <dt className="text-ink-subtle">Rear revs</dt>
            <motion.dd className="text-coolant-300">{rearRevs}</motion.dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
