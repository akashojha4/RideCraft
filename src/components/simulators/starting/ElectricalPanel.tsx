import { motion, type MotionValue } from 'motion/react'
import { DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { cn } from '@/lib/cn'

/** Battery, starter relay and starter motor, fuel pump and charging, for the starting simulator. */
export function ElectricalPanel({
  voltage,
  current,
  relayClosed,
  pumpOn,
  charging,
  starterAngle,
  flowOffset,
}: {
  voltage: number
  current: number
  relayClosed: boolean
  pumpOn: boolean
  charging: boolean
  starterAngle: MotionValue<number>
  flowOffset: MotionValue<number>
}) {
  const heavy = current > 50
  return (
    <svg viewBox="0 0 260 240" className="w-full" role="img" aria-label={`Battery ${voltage.toFixed(1)} volts, starter current ${Math.round(current)} amps`}>
      <g strokeLinejoin="round" strokeLinecap="round">
        {/* Battery */}
        <rect x={14} y={30} width={96} height={64} rx={8} strokeWidth={2} className="fill-surface-raised stroke-line-strong" />
        <rect x={28} y={22} width={14} height={8} rx={2} className="fill-danger-500" />
        <rect x={82} y={22} width={14} height={8} rx={2} className="fill-ink-subtle" />
        <text x={62} y={64} textAnchor="middle" className={cn('tabular font-mono text-[18px]', voltage < 11 ? 'fill-caution-400' : charging ? 'fill-ok-400' : 'fill-ink')}>
          {voltage.toFixed(1)} V
        </text>
        <DiagramLabel x={62} y={84} anchor="middle">Battery</DiagramLabel>

        {/* Cable to the relay and starter motor */}
        <path d="M35,22 L35,10 L150,10 L150,40" fill="none" strokeWidth={heavy ? 5 : 3} className="stroke-surface-overlay" />
        <path d="M170,40 L200,40 L200,120" fill="none" strokeWidth={heavy ? 5 : 3} className="stroke-surface-overlay" />
        {heavy && (
          <>
            <motion.path d="M35,22 L35,10 L150,10 L150,40" fill="none" strokeWidth={3} strokeDasharray="6 8" className="stroke-caution-400" style={{ strokeDashoffset: flowOffset }} />
            <motion.path d="M170,40 L200,40 L200,120" fill="none" strokeWidth={3} strokeDasharray="6 8" className="stroke-caution-400" style={{ strokeDashoffset: flowOffset }} />
          </>
        )}
        {/* Relay contacts */}
        <circle cx={150} cy={44} r={3.5} className="fill-ink-subtle" />
        <circle cx={170} cy={44} r={3.5} className="fill-ink-subtle" />
        <line x1={150} y1={44} x2={relayClosed ? 170 : 166} y2={relayClosed ? 44 : 32} strokeWidth={3} className={relayClosed ? 'stroke-caution-400' : 'stroke-ink-muted'} />
        <DiagramLabel x={160} y={64} anchor="middle">Starter relay</DiagramLabel>

        {/* Starter motor */}
        <circle cx={200} cy={150} r={30} strokeWidth={2} className="fill-surface-raised stroke-line-strong" />
        <motion.g style={{ x: 200, y: 150, rotate: starterAngle }}>
          {[0, 60, 120].map((a) => (
            <line key={a} x1={-20} x2={20} y1={0} y2={0} strokeWidth={4} transform={`rotate(${a})`} className={current > 0 && relayClosed ? 'stroke-coolant-400' : 'stroke-ink-subtle'} />
          ))}
          <circle r={5} className="fill-bg stroke-ink-subtle" />
        </motion.g>
        <DiagramLabel x={200} y={198} anchor="middle">Starter motor</DiagramLabel>
        <DiagramLabel x={200} y={212} anchor="middle" tone="coolant">→ crankshaft</DiagramLabel>

        {/* Fuel pump */}
        <rect x={14} y={130} width={70} height={30} rx={6} strokeWidth={1.5} className={pumpOn ? 'fill-coolant-950 stroke-coolant-400' : 'fill-surface-raised stroke-line-strong'} />
        <DiagramLabel x={49} y={149} anchor="middle" tone={pumpOn ? 'coolant' : 'muted'}>Fuel pump</DiagramLabel>

        {/* Charging */}
        <rect x={14} y={180} width={70} height={30} rx={6} strokeWidth={1.5} className={charging ? 'fill-ok-950 stroke-ok-400' : 'fill-surface-raised stroke-line-strong'} />
        <DiagramLabel x={49} y={199} anchor="middle">Generator</DiagramLabel>
        {charging && <path d="M92,195 L120,195 L120,104 M112,112 L120,102 L128,112" fill="none" strokeWidth={2.5} className="stroke-ok-400" />}
      </g>
    </svg>
  )
}
