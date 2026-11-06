import { motion, useTransform, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { DiagramLabel } from '@/components/anatomy/DiagramFrame'
import type { ExplorerPart } from '@/content/simulators/clutchExplorer'
import { cn } from '@/lib/cn'
import { CLUTCH, type Actuation, type ClutchMechanism } from '@/lib/mechanics/clutch'

/*
 * Cross-section of a wet multi-plate clutch (shaft horizontal), driven by clutchMechanism():
 * the lever, the cable or hydraulic release, the pushrod inside the hollow mainshaft, the
 * pressure plate, springs and plate stack. Movements are drawn enlarged (MM px per mm).
 * An end view shows the basket and hub turning, so slip between them is visible.
 */

const MM = 7
const SHAFT_Y = 150
const X0 = 230
const PLATES = ['friction', 'steel', 'friction', 'steel', 'friction', 'steel', 'friction', 'steel', 'friction'] as const
const THICKNESS = { friction: 9, steel: 5 }
const STACK = PLATES.reduce((n, k) => n + THICKNESS[k], 0)
const SPRING_SEAT = X0 + 190

function springPath(x1: number, x2: number, y: number, coils = 6, amp = 7) {
  const step = (x2 - x1) / (coils * 2)
  let d = `M${x1},${y}`
  for (let i = 1; i < coils * 2; i++) d += ` L${x1 + i * step},${y + (i % 2 ? -amp : amp)}`
  return `${d} L${x2},${y}`
}

/** Dims a part when something else is highlighted. */
function Part({ id, highlight, children }: { id: ExplorerPart | ExplorerPart[]; highlight: readonly ExplorerPart[]; children: ReactNode }) {
  const ids = Array.isArray(id) ? id : [id]
  const dim = highlight.length > 0 && !ids.some((p) => highlight.includes(p))
  const lit = highlight.length > 0 && !dim
  return (
    <g data-part={ids.join(' ')} data-lit={lit || undefined} style={{ opacity: dim ? 0.25 : 1, transition: 'opacity 200ms' }}>
      {children}
    </g>
  )
}

export function ClutchMechanismView({
  mech,
  actuation,
  basketAngle,
  hubAngle,
  highlight = [],
  slipping,
  basketRpm,
  hubRpm,
}: {
  mech: ClutchMechanism
  actuation: Actuation
  basketAngle: MotionValue<number>
  hubAngle: MotionValue<number>
  highlight?: readonly ExplorerPart[]
  slipping: boolean
  basketRpm: number
  hubRpm: number
}) {
  const lift = mech.travel * MM
  // The stack spreads as the pressure plate lifts: tiny while the cushion plate unloads, then the open gap.
  const plateX = PLATES.map((_, i) => X0 + PLATES.slice(0, i).reduce((n, k) => n + THICKNESS[k], 0) + (lift * i) / PLATES.length)
  const pressureX = X0 + STACK + lift
  const leverAngle = -mech.pull * 22
  const basket = useTransform(basketAngle, (a) => -a)
  const hub = useTransform(hubAngle, (a) => -a)
  const clampW = 2 + mech.clamp * 7
  const status = slipping ? 'Slipping' : basketRpm < 1 && hubRpm < 1 ? 'Not turning' : mech.clamp === 0 ? 'Turning separately' : 'Turning together'

  return (
    <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
    <svg viewBox="0 0 490 310" className="w-full [&_text]:text-[14px] sm:[&_text]:text-[11px]" role="img" aria-label={`Clutch cross-section: ${mech.stage}, clamp load ${Math.round(mech.clampN)} newtons, pushrod travel ${mech.travel.toFixed(2)} millimetres`}>
      <g strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
        {/* Lever on the handlebar */}
        <Part id="lever" highlight={highlight}>
          <circle cx={46} cy={42} r={5} className="fill-surface-overlay stroke-ink-subtle" />
          <g transform={`rotate(${leverAngle} 46 42)`}>
            <path d="M46,42 L118,36" strokeWidth={7} className="stroke-ignition-500" />
          </g>
          <rect x={44} y={24} width={90} height={8} rx={4} className="fill-surface-raised stroke-line-strong" />
          <DiagramLabel x={10} y={16} tone="ignition">Lever {Math.round(mech.pull * 100)} %</DiagramLabel>
        </Part>

        {/* Release: cable and arm, or hydraulic hose and slave cylinder */}
        <Part id="actuator" highlight={highlight}>
          {actuation === 'cable' ? (
            <>
              <path d={`M46,46 C30,90 22,110 28,${SHAFT_Y - 34}`} fill="none" strokeWidth={2} strokeDasharray="5 3" className="stroke-ignition-400" />
              <path d={`M28,${SHAFT_Y - 34} L${60 + lift},${SHAFT_Y}`} strokeWidth={5} className="stroke-ignition-400" />
              <circle cx={44} cy={SHAFT_Y - 16} r={3} className="fill-surface-overlay stroke-ink-subtle" />
              <DiagramLabel x={4} y={SHAFT_Y - 46}>Cable &amp; arm</DiagramLabel>
            </>
          ) : (
            <>
              <path d={`M46,46 C26,90 20,${SHAFT_Y - 40} 24,${SHAFT_Y - 8}`} fill="none" strokeWidth={3} className="stroke-coolant-400" />
              <rect x={14} y={SHAFT_Y - 14} width={46} height={28} rx={3} className="fill-surface-sunken stroke-coolant-400" />
              <rect x={26 + lift} y={SHAFT_Y - 9} width={10} height={18} className="fill-coolant-950 stroke-coolant-300" />
              <line x1={36 + lift} y1={SHAFT_Y} x2={60 + lift} y2={SHAFT_Y} strokeWidth={4} className="stroke-coolant-300" />
              <DiagramLabel x={4} y={SHAFT_Y - 24}>Slave cylinder</DiagramLabel>
            </>
          )}
        </Part>

        {/* Hollow mainshaft and the pushrod inside it */}
        <line x1={60} y1={SHAFT_Y - 6} x2={486} y2={SHAFT_Y - 6} strokeWidth={2} className="stroke-line-strong" />
        <line x1={60} y1={SHAFT_Y + 6} x2={486} y2={SHAFT_Y + 6} strokeWidth={2} className="stroke-line-strong" />
        <Part id="pushrod" highlight={highlight}>
          <line x1={60 + lift} y1={SHAFT_Y} x2={pressureX} y2={SHAFT_Y} strokeWidth={4} className="stroke-coolant-300" />
          <DiagramLabel x={72} y={SHAFT_Y + 24}>Pushrod</DiagramLabel>
          <DiagramLabel x={72} y={SHAFT_Y + 40}>{mech.travel.toFixed(2)} mm</DiagramLabel>
        </Part>

        {/* Basket, driven by the crankshaft through the primary gear */}
        <Part id="basket" highlight={highlight}>
          <rect x={X0 - 46} y={36} width={12} height={228} className="fill-surface-raised stroke-ink-subtle" />
          <path d={`M${X0 + STACK + 40},44 L${X0 - 34},44 L${X0 - 34},256 L${X0 + STACK + 40},256`} fill="none" strokeWidth={6} className="stroke-ink-subtle" />
          <DiagramLabel x={X0 - 46} y={24}>Basket</DiagramLabel>
          <DiagramLabel x={X0 - 46} y={280}>Driven by the crank</DiagramLabel>
        </Part>

        {/* Hub, splined to the mainshaft */}
        <Part id="hub" highlight={highlight}>
          <rect x={X0 - 14} y={64} width={8} height={172} className="fill-surface-raised stroke-line-strong" />
          <rect x={X0 - 6} y={104} width={STACK + 12} height={92} className="fill-surface-raised stroke-line-strong" />
          <DiagramLabel x={X0 + 6} y={SHAFT_Y + 4}>Hub</DiagramLabel>
        </Part>

        {/* Friction plates (tabs in the basket) and steel plates (splined to the hub) */}
        <Part id="plates" highlight={highlight}>
          {PLATES.map((kind, i) => {
            const [top, bottom] = kind === 'friction' ? [[48, 100], [200, 252]] : [[60, 104], [196, 240]]
            const cls = kind === 'friction' ? (slipping ? 'fill-caution-950 stroke-caution-400' : 'fill-coolant-950 stroke-coolant-400') : 'fill-surface-overlay stroke-ink-subtle'
            return (
              <g key={i}>
                <rect x={plateX[i]} y={top[0]} width={THICKNESS[kind]} height={top[1] - top[0]} rx={1.5} className={cls} />
                <rect x={plateX[i]} y={bottom[0]} width={THICKNESS[kind]} height={bottom[1] - bottom[0]} rx={1.5} className={cls} />
              </g>
            )
          })}
          <DiagramLabel x={X0 + STACK / 2} y={298} anchor="middle" tone="coolant">
            Plates · gap {mech.gap.toFixed(2)} mm
          </DiagramLabel>
        </Part>

        {/* Pressure plate with the clamp load it applies */}
        <Part id="pressurePlate" highlight={highlight}>
          <rect x={pressureX} y={56} width={14} height={188} rx={3} className="fill-surface-overlay stroke-coolant-300" />
          {mech.clamp > 0 &&
            [84, 216].map((y) => (
              <g key={y}>
                <line x1={pressureX - 2} y1={y} x2={pressureX - 18} y2={y} strokeWidth={clampW} className="stroke-ignition-400" />
                <path d={`M${pressureX - 18},${y - clampW - 2} L${pressureX - 26},${y} L${pressureX - 18},${y + clampW + 2} Z`} className="fill-ignition-400" />
              </g>
            ))}
          <DiagramLabel x={pressureX + 7} y={24} anchor="middle" tone="coolant">
            Pressure plate
          </DiagramLabel>
        </Part>

        {/* Springs between the pressure plate and the bolts in the hub */}
        <Part id="springs" highlight={highlight}>
          {[80, 220].map((y) => (
            <g key={y}>
              <line x1={X0 + STACK} y1={y} x2={SPRING_SEAT + 6} y2={y} strokeWidth={3} className="stroke-line-strong" />
              <rect x={SPRING_SEAT} y={y - 9} width={7} height={18} rx={1} className="fill-surface-overlay stroke-ink-subtle" />
              <path d={springPath(pressureX + 14, SPRING_SEAT, y)} fill="none" strokeWidth={2} className="stroke-ink-muted" />
            </g>
          ))}
          <DiagramLabel x={SPRING_SEAT - 50} y={112}>
            Springs {Math.round(mech.springN)} N
          </DiagramLabel>
        </Part>

      </g>
      <desc>{`Clamp load ${Math.round(mech.clampN)} of ${CLUTCH.springPreload} newtons.`}</desc>
    </svg>
    <svg viewBox="-80 -92 160 196" className="mx-auto w-36 sm:w-full" role="img" aria-label={`End view of the basket and hub: ${status}`}>
      <g strokeWidth={1.5}>
        {/* End view: basket and hub turning (equal speeds = locked, different = slipping) */}
        <g>
          <Part id="basket" highlight={highlight}>
            <motion.g style={{ rotate: basket }}>
              <circle r={58} strokeWidth={2} className="fill-surface-raised stroke-line-strong" />
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={i} x={52} y={-4} width={9} height={8} transform={`rotate(${i * 36})`} className="fill-ink-subtle" />
              ))}
              <line x1={0} y1={0} x2={0} y2={-56} strokeWidth={3} className="stroke-ink-muted" />
            </motion.g>
          </Part>
          <Part id="hub" highlight={highlight}>
            <motion.g style={{ rotate: hub }}>
              <circle r={32} strokeWidth={2} className="fill-surface-overlay stroke-coolant-400" />
              <line x1={0} y1={0} x2={0} y2={-30} strokeWidth={3} className="stroke-coolant-300" />
            </motion.g>
          </Part>
          <text y={86} textAnchor="middle" className={cn('font-mono text-[11px]', slipping ? 'fill-caution-400' : 'fill-ink-muted')}>
            {status}
          </text>
          <text y={-70} textAnchor="middle" className="fill-ink-muted font-mono text-[11px]">
            End view
          </text>
        </g>
      </g>
    </svg>
    </div>
  )
}
