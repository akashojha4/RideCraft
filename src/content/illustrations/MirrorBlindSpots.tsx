import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'

/*
 * Pre-ride lesson 4: mirrors and blind spots, seen from above (travelling up the page).
 *
 * Each mirror shows a cone behind it, half-angle 12° about its aim (measured outward from
 * straight back). Rays within 3° of straight back or inward are blocked by the rider's own
 * arm and shoulder. Peripheral vision covers up to 100° either side of straight ahead.
 * A car that is in neither is in the blind spot.
 */

const RIDER = { x: 260, y: 190 }
const EYE = { x: RIDER.x, y: RIDER.y - 6 }
const MIRRORS = [
  { side: -1, x: RIDER.x - 18, y: RIDER.y - 14 },
  { side: 1, x: RIDER.x + 18, y: RIDER.y - 14 },
]
const HALF_FOV = 12
const BODY_BLOCK = 3
const PERIPHERAL = 100
const CONE_LENGTH = 300
const CAR = { w: 46, h: 88 }
const LANE_X = { left: 140, right: 380 }

const deg = (r: number) => (r * 180) / Math.PI
const rad = (d: number) => (d * Math.PI) / 180

/** Angle of a point from straight back, measured outward for the given side. */
function angleFromBack(m: { side: number; x: number; y: number }, p: { x: number; y: number }) {
  return deg(Math.atan2((p.x - m.x) * m.side, p.y - m.y))
}

function wedge(o: { x: number; y: number }, fromDeg: number, toDeg: number, side: number, len: number) {
  // Angles from straight back, outward positive.
  const pt = (a: number) => ({ x: o.x + side * len * Math.sin(rad(a)), y: o.y + len * Math.cos(rad(a)) })
  const a = pt(fromDeg)
  const b = pt(toDeg)
  return `M${o.x},${o.y} L${a.x},${a.y} L${b.x},${b.y} Z`
}

export default function MirrorBlindSpots() {
  const [aim, setAim] = useState(4)
  const [carY, setCarY] = useState(250)
  const [lane, setLane] = useState<'left' | 'right'>('right')

  const car = { x: LANE_X[lane], y: carY }
  const mirror = MIRRORS[lane === 'left' ? 0 : 1]
  const visibleFrom = Math.max(aim - HALF_FOV, BODY_BLOCK)
  const visibleTo = aim + HALF_FOV
  const carAngle = angleFromBack(mirror, car)
  const inMirror = car.y > mirror.y && carAngle >= visibleFrom && carAngle <= visibleTo
  const fromForward = deg(Math.atan2(Math.abs(car.x - EYE.x), -(car.y - EYE.y)))
  const inPeripheral = fromForward <= PERIPHERAL
  const status = inPeripheral ? 'peripheral' : inMirror ? 'mirror' : 'blind'
  const blockedShare = Math.max(0, Math.min(1, (BODY_BLOCK - (aim - HALF_FOV)) / (2 * HALF_FOV)))

  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 20 440 380" className="mx-auto w-full max-w-lg" role="img" aria-label={`Top view: car ${status === 'blind' ? 'in the blind spot' : status === 'mirror' ? 'visible in the mirror' : 'in peripheral vision'}`}>
          <g strokeLinejoin="round" strokeLinecap="round">
            {/* Road */}
            <rect x={80} y={20} width={360} height={380} className="fill-surface-sunken" />
            {[200, 320].map((x) => (
              <line key={x} x1={x} x2={x} y1={20} y2={400} strokeWidth={2} strokeDasharray="18 16" className="stroke-line-strong" />
            ))}

            {/* Peripheral vision (forward) */}
            <path
              d={`M${EYE.x},${EYE.y} L${EYE.x - 240 * Math.sin(rad(PERIPHERAL))},${EYE.y - 240 * Math.cos(rad(PERIPHERAL))} A240,240 0 0 1 ${EYE.x + 240 * Math.sin(rad(PERIPHERAL))},${EYE.y - 240 * Math.cos(rad(PERIPHERAL))} Z`}
              className="fill-ink-subtle"
              opacity={0.08}
            />

            {MIRRORS.map((m) => (
              <g key={m.side}>
                {/* Blind spot: between peripheral vision and the mirror's outer edge */}
                <path d={wedge(m, visibleTo, 180 - PERIPHERAL, m.side, CONE_LENGTH)} className="fill-caution-400" opacity={0.14} />
                {/* Mirror view, with the part blocked by the rider */}
                <path d={wedge(m, visibleFrom, visibleTo, m.side, CONE_LENGTH)} className="fill-coolant-400" opacity={0.2} />
                {aim - HALF_FOV < BODY_BLOCK && <path d={wedge(m, aim - HALF_FOV, BODY_BLOCK, m.side, 40)} className="fill-ink-subtle" opacity={0.4} />}
                <circle cx={m.x} cy={m.y} r={3} className="fill-coolant-300" />
              </g>
            ))}

            {/* Rider and motorcycle */}
            <rect x={RIDER.x - 7} y={RIDER.y - 40} width={14} height={78} rx={7} className="fill-surface-overlay stroke-ink-subtle" strokeWidth={1.5} />
            <ellipse cx={RIDER.x} cy={RIDER.y + 4} rx={16} ry={10} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
            <circle cx={RIDER.x} cy={RIDER.y - 2} r={8} className="fill-surface-overlay stroke-ink-muted" strokeWidth={1.5} />
            <line x1={RIDER.x - 18} x2={RIDER.x + 18} y1={RIDER.y - 14} y2={RIDER.y - 14} strokeWidth={3} className="stroke-ink-subtle" />

            {/* The other car */}
            <rect
              x={car.x - CAR.w / 2}
              y={car.y - CAR.h / 2}
              width={CAR.w}
              height={CAR.h}
              rx={10}
              strokeWidth={2}
              className={cn(status === 'blind' ? 'fill-caution-950 stroke-caution-400' : 'fill-surface-raised stroke-ok-400')}
            />
            <rect x={car.x - CAR.w / 2 + 6} y={car.y - CAR.h / 2 + 12} width={CAR.w - 12} height={16} rx={4} className="fill-surface-overlay" />

            <DiagramLabel x={RIDER.x} y={RIDER.y + 58} anchor="middle">You</DiagramLabel>
            <DiagramLabel x={448} y={36} anchor="end">Direction of travel ↑</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Mirror aim (outward)" value={aim} onChange={setAim} max={30} valueText={`${aim}°`} hint="0° points straight back." />
            <Slider label="Car position" value={-carY} onChange={(v) => setCarY(-v)} min={-390} max={-110} valueText={carY > 300 ? 'Far behind' : carY > 200 ? 'Closing in' : carY > 140 ? 'Alongside' : 'Ahead'} tone="coolant" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div role="group" aria-label="Car lane" className="flex rounded-lg border border-line bg-surface-sunken p-0.5">
              {(['left', 'right'] as const).map((l) => (
                <button key={l} type="button" aria-pressed={lane === l} onClick={() => setLane(l)} className={cn('h-7 rounded-md px-3 text-xs capitalize', lane === l ? 'bg-surface-overlay text-ink' : 'text-ink-subtle hover:text-ink')}>
                  {l} lane
                </button>
              ))}
            </div>
            <dl className="flex gap-6">
              <Readout label="Car is" value={status === 'mirror' ? 'In the mirror' : status === 'peripheral' ? 'In your side vision' : 'In the blind spot'} tone={status === 'blind' ? 'caution' : 'ok'} />
              <Readout label="Mirror shows you" value={blockedShare > 0 ? `${Math.round(blockedShare * 100)} % your arm` : 'Only road'} tone={blockedShare > 0.3 ? 'caution' : 'ink'} />
            </dl>
          </div>
        </>
      }
      status={
        status === 'blind'
          ? 'The car is in your blind spot: too far forward for the mirror, too far back for your side vision. This is why you look over your shoulder before changing lanes or turning.'
          : status === 'mirror'
            ? 'The car is visible in your mirror. Mirrors show what is behind — but always check the blind spot with a quick look over your shoulder before moving across.'
            : 'The car is beside or ahead of you, within your side vision.'
      }
    />
  )
}
