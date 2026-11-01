import { motion, useInView, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { useSimulationClock } from '@/hooks/useSimulationClock'
import { DiagramFrame, DiagramLabel } from '../DiagramFrame'

/** Exhaust flow schematic: port → header → catalytic converter → silencer → outlet. */

const HEADER = 'M70,75 C112,75 120,140 170,140 L200,140'
const AFTER_CAT = 'M270,140 L470,140'
const GAS_SPEED = 60

const stages = [
  { n: 1, title: 'Exhaust port & header', text: 'Each time the exhaust valve opens, a pulse of gas at several hundred °C leaves the cylinder and enters the header pipe.' },
  { n: 2, title: 'Catalytic converter', text: 'A honeycomb coated with precious metals converts carbon monoxide, unburnt fuel and nitrogen oxides into carbon dioxide, water and nitrogen.' },
  { n: 3, title: 'Silencer', text: 'Perforated tubes, chambers and packing break up and absorb the pressure pulses, so the engine is far quieter.' },
  { n: 4, title: 'Outlet', text: 'Cooler, cleaner and quieter gas leaves at the back of the motorcycle.' },
]

function Marker({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} className="fill-bg stroke-coolant-400" />
      <text x={x} y={y + 3.5} textAnchor="middle" className="fill-coolant-300 font-mono text-[10px]">
        {n}
      </text>
    </g>
  )
}

export default function ExhaustDiagram() {
  const clock = useSimulationClock()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const reduceMotion = useReducedMotion()
  const offset = useTransform(clock.time, (t) => -t * GAS_SPEED)
  const { play, pause } = clock

  useEffect(() => {
    if (inView && !reduceMotion) play()
    else pause()
  }, [inView, reduceMotion, play, pause])

  return (
    <div ref={ref}>
      <DiagramFrame
        stage={
          <svg viewBox="0 0 480 200" className="w-full" role="img" aria-label="Exhaust gas flowing from the engine through the header, catalytic converter and silencer">
            <g strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
              <rect x={10} y={36} width={60} height={78} rx={6} className="fill-surface-raised stroke-line-strong" />
              <path d={HEADER} fill="none" strokeWidth={16} className="stroke-surface-overlay" />
              <path d={AFTER_CAT} fill="none" strokeWidth={12} className="stroke-surface-overlay" />

              <rect x={200} y={118} width={70} height={44} rx={6} className="fill-surface-raised stroke-line-strong" />
              {Array.from({ length: 10 }, (_, i) => (
                <line key={i} x1={207 + i * 6} x2={207 + i * 6} y1={122} y2={158} className="stroke-coolant-600" />
              ))}

              <rect x={300} y={104} width={140} height={72} rx={18} className="fill-surface-raised stroke-line-strong" />
              {[345, 395].map((x) => (
                <line key={x} x1={x} x2={x} y1={108} y2={172} strokeWidth={2} className="stroke-line-strong" />
              ))}
              <line x1={304} x2={436} y1={140} y2={140} strokeWidth={10} strokeDasharray="2 5" className="stroke-bg" />

              <motion.path d={HEADER} fill="none" strokeWidth={6} strokeDasharray="10 14" className="stroke-caution-400" style={{ strokeDashoffset: offset }} />
              <motion.path d={AFTER_CAT} fill="none" strokeWidth={4} strokeDasharray="10 14" className="stroke-ink-muted" style={{ strokeDashoffset: offset }} />

              <Marker x={110} y={60} n={1} />
              <Marker x={235} y={104} n={2} />
              <Marker x={370} y={92} n={3} />
              <Marker x={462} y={122} n={4} />
              <DiagramLabel x={10} y={28}>Cylinder head</DiagramLabel>
              <DiagramLabel x={235} y={180} anchor="middle" tone="coolant">Catalyst</DiagramLabel>
              <DiagramLabel x={370} y={194} anchor="middle">Silencer</DiagramLabel>
            </g>
          </svg>
        }
        controls={<PlaybackControls clock={clock} />}
        status={
          <ol className="grid gap-2 sm:grid-cols-2">
            {stages.map((s) => (
              <li key={s.n} className="flex gap-2.5">
                <span className="tabular mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-coolant-500/50 font-mono text-[10px] text-coolant-300">
                  {s.n}
                </span>
                <span>
                  <span className="font-medium text-ink">{s.title}.</span> {s.text}
                </span>
              </li>
            ))}
          </ol>
        }
      />
    </div>
  )
}
