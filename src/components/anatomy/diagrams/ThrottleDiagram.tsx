import { animate, motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react'
import { useRef, useState } from 'react'
import { Meter, Readout } from '@/components/simulation/Readouts'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { THROTTLE_DUCT_HALF, THROTTLE_PLATE_HALF, airflow, valveAngle } from '@/lib/mechanics/throttle'
import { DiagramFrame, DiagramLabel } from '../DiagramFrame'

/** Cable throttle and butterfly throttle valve. Valve and airflow model: lib/mechanics/throttle.ts. */

const GRIP_TRAVEL = 80
const VALVE = { x: 330, y: 140 }
const PLATE_HALF = THROTTLE_PLATE_HALF
const DUCT_HALF = THROTTLE_DUCT_HALF

export default function ThrottleDiagram() {
  const [opening, setOpening] = useState(0)
  const reduceMotion = useReducedMotion()
  const flowOffset = useMotionValue(0)
  const releasing = useRef<ReturnType<typeof animate> | null>(null)

  const angle = valveAngle(opening)
  const flow = airflow(opening)
  const rad = (angle * Math.PI) / 180
  const dx = PLATE_HALF * Math.sin(rad)
  const dy = PLATE_HALF * Math.cos(rad)

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return
    flowOffset.set(flowOffset.get() - (Math.min(delta, 100) / 1000) * (25 + flow * 170))
  })

  const change = (v: number) => {
    releasing.current?.stop()
    setOpening(v)
  }
  const letGo = () => {
    releasing.current?.stop()
    releasing.current = animate(opening, 0, {
      duration: reduceMotion ? 0 : 0.25,
      ease: 'easeIn',
      onUpdate: (v) => setOpening(Math.round(v)),
    })
  }

  const status =
    opening === 0
      ? 'Closed, at idle. The idle stop holds the valve slightly open so the engine keeps running without any input from you.'
      : opening < 35
        ? 'Small opening. A little more air enters, the fuel system adds matching fuel, and each power stroke gets a little stronger.'
        : opening < 80
          ? 'Part throttle. Much more air and fuel per stroke: the engine produces more torque. Whether that raises speed or RPM depends on the gear and the load.'
          : 'Wide open. The valve barely obstructs the air — the engine can now make the most power available at its current RPM.'

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 480 230" className="w-full" role="img" aria-label={`Throttle ${opening} percent open`}>
          <g strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
            {/* Twist grip (end view) */}
            <circle cx={80} cy={120} r={38} className="fill-surface-raised stroke-ignition-400" strokeWidth={3} />
            <g transform={`rotate(${-(opening / 100) * GRIP_TRAVEL} 80 120)`}>
              <circle cx={80} cy={120} r={22} className="fill-surface-overlay stroke-ink-subtle" />
              <line x1={80} y1={120} x2={80} y2={86} strokeWidth={4} className="stroke-ignition-400" />
            </g>

            {/* Cable to the throttle pulley */}
            <path d={`M80,98 L${VALVE.x},${VALVE.y - 22}`} fill="none" strokeWidth={2.5} className="stroke-ink-muted" />

            {/* Return spring */}
            <path d="M352,140 l6,-6 l6,12 l6,-12 l6,12 l6,-6 l10,0" fill="none" strokeWidth={2} className="stroke-ink-subtle" />

            {/* Throttle body (duct) */}
            <rect x={220} y={VALVE.y - DUCT_HALF} width={220} height={DUCT_HALF * 2} className="fill-surface-sunken stroke-line-strong" strokeWidth={3} />
            <g style={{ opacity: 0.25 + flow * 0.75 }}>
              {[-14, 0, 14].map((o) => (
                <motion.line
                  key={o}
                  x1={224}
                  x2={436}
                  y1={VALVE.y + o}
                  y2={VALVE.y + o}
                  strokeWidth={2}
                  strokeDasharray="10 14"
                  className="stroke-coolant-300"
                  style={{ strokeDashoffset: flowOffset }}
                />
              ))}
            </g>
            {/* Throttle pulley on the outside of the body, around the valve shaft */}
            <circle cx={VALVE.x} cy={VALVE.y} r={22} fill="none" strokeDasharray="3 3" className="stroke-ink-subtle" />
            {/* Butterfly plate on its shaft */}
            <line
              x1={VALVE.x - dx}
              y1={VALVE.y - dy}
              x2={VALVE.x + dx}
              y2={VALVE.y + dy}
              strokeWidth={6}
              className="stroke-coolant-400"
            />
            <circle cx={VALVE.x} cy={VALVE.y} r={4} className="fill-bg stroke-coolant-400" />

            {/* Fuel injector and spray */}
            <rect x={392} y={88} width={14} height={26} rx={3} transform="rotate(25 399 101)" className="fill-surface-raised stroke-ink-subtle" />
            <path d="M398,116 L384,150 L410,150 Z" className="fill-caution-400" style={{ opacity: 0.1 + flow * 0.55 }} />

            <DiagramLabel x={80} y={180} anchor="middle" tone="ignition">Twist grip</DiagramLabel>
            <DiagramLabel x={190} y={88} anchor="middle">Cable</DiagramLabel>
            <DiagramLabel x={226} y={196}>Air in</DiagramLabel>
            <DiagramLabel x={436} y={196} anchor="end">To engine</DiagramLabel>
            <DiagramLabel x={VALVE.x} y={212} anchor="middle" tone="coolant">Throttle valve</DiagramLabel>
            <DiagramLabel x={414} y={84}>Injector</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <div className="flex items-end gap-3">
            <Slider
              label="Twist grip"
              value={opening}
              onChange={change}
              valueText={`${opening} % open`}
              hint="Drag to roll the throttle open."
              className="flex-1"
            />
            <Button size="sm" variant="secondary" onClick={letGo} disabled={opening === 0}>
              Let go
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
            <Meter label="Airflow into the engine" value={flow} />
            <dl className="flex gap-5">
              <Readout label="Valve angle" value={`${Math.round(angle)}°`} tone="coolant" />
              <Readout label="Grip rotation" value={`${Math.round((opening / 100) * GRIP_TRAVEL)}°`} />
            </dl>
          </div>
        </>
      }
      status={status}
    />
  )
}
