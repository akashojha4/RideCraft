import { animate, useMotionValue, useMotionValueEvent } from 'motion/react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { GEARS, gearRatio, shiftLever, type LeverAction } from '@/lib/mechanics/gearbox'

/*
 * Mechanics lesson 7: inside a sequential gearbox. Each lever movement turns the shift
 * drum by one step. Grooves cut round the drum guide three selector forks sideways; each
 * fork slides a dog ring (or a sliding gear) against a neighbouring gear, locking that
 * gear to its shaft through the dogs. The drum is shown unrolled. The fork-to-gear layout
 * is representative of a five-speed — real gearboxes arrange it differently, but always
 * with only one gear locked at a time.
 */

const DRUM: Record<number, number> = { 1: 0, 0: 30, 2: 60, 3: 120, 4: 180, 5: 240 }
/** Fork offsets (−1 left, 0 centre, +1 right) for each gear. */
const FORKS: Record<number, [number, number, number]> = { 1: [-1, 0, 0], 0: [0, 0, 0], 2: [0, -1, 0], 3: [1, 0, 0], 4: [0, 1, 0], 5: [0, 0, 1] }
const GEAR_OF_FORK: [number, number][] = [
  [1, 3],
  [2, 4],
  [0, 5],
]
const ORDER = [1, 0, 2, 3, 4, 5]
const NAME = ['Neutral', '1st', '2nd', '3rd', '4th', '5th']

/** Fork offset at any drum angle, interpolating between the gear positions. */
function forkAt(fork: number, angle: number) {
  for (let i = 1; i < ORDER.length; i++) {
    const a0 = DRUM[ORDER[i - 1]]
    const a1 = DRUM[ORDER[i]]
    if (angle <= a1) {
      const f = Math.min(1, Math.max(0, (angle - a0) / (a1 - a0)))
      const s = f * f * (3 - 2 * f)
      return FORKS[ORDER[i - 1]][fork] + (FORKS[ORDER[i]][fork] - FORKS[ORDER[i - 1]][fork]) * s
    }
  }
  return FORKS[5][fork]
}

const TRACK_X = [70, 120, 170]
const DRUM_TOP = 40
const DRUM_PX_PER_DEG = 0.75
const GEAR_X = [300, 345, 390, 435, 480]

export default function ShiftDrum() {
  const [gear, setGear] = useState(1)
  const [note, setNote] = useState('')
  const drum = useMotionValue(DRUM[1])
  const [angle, setAngle] = useState(DRUM[1])
  useMotionValueEvent(drum, 'change', setAngle)

  const lever = (action: LeverAction) => {
    const r = shiftLever(gear, action)
    setNote(r.note)
    if (!r.moved) return
    setGear(r.gear)
    animate(drum, DRUM[r.gear], { type: 'spring', stiffness: 180, damping: 22 })
  }
  const forks = [0, 1, 2].map((f) => forkAt(f, angle))
  const engaged = forks.flatMap((o, f) => (Math.abs(o) > 0.9 ? [GEAR_OF_FORK[f][o < 0 ? 0 : 1]] : [])).filter((g) => g > 0)

  return (
    <DiagramFrame
      stage={
        <svg viewBox="20 10 500 260" className="w-full" role="img" aria-label={`Shift drum at ${Math.round(angle)} degrees: ${NAME[gear]} selected`}>
          {/* Unrolled drum with its three grooves */}
          <rect x={45} y={DRUM_TOP - 10} width={150} height={240 * DRUM_PX_PER_DEG + 20} rx={8} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
          {TRACK_X.map((tx, f) => {
            const d: string[] = []
            for (let a = 0; a <= 240; a += 4) d.push(`${d.length ? 'L' : 'M'}${tx + forkAt(f, a) * 16},${DRUM_TOP + a * DRUM_PX_PER_DEG}`)
            return <path key={tx} d={d.join(' ')} fill="none" strokeWidth={6} strokeLinecap="round" className="stroke-bg" />
          })}
          {ORDER.map((g) => (
            <text key={g} x={40} y={DRUM_TOP + DRUM[g] * DRUM_PX_PER_DEG + 4} textAnchor="end" className={cn('font-mono text-[10px]', g === gear ? 'fill-ink' : 'fill-ink-subtle')}>
              {g === 0 ? 'N' : g}
            </text>
          ))}
          <line x1={45} x2={195} y1={DRUM_TOP + angle * DRUM_PX_PER_DEG} y2={DRUM_TOP + angle * DRUM_PX_PER_DEG} strokeWidth={1.5} strokeDasharray="4 3" className="stroke-ignition-400" />
          {TRACK_X.map((tx, f) => (
            <circle key={tx} cx={tx + forks[f] * 16} cy={DRUM_TOP + angle * DRUM_PX_PER_DEG} r={6} className="fill-ignition-400 stroke-bg" strokeWidth={2} />
          ))}
          <DiagramLabel x={120} y={24} anchor="middle">shift drum, unrolled</DiagramLabel>

          {/* Shafts, gear pairs and the dog rings moved by the forks */}
          <line x1={270} x2={510} y1={90} y2={90} strokeWidth={8} className="stroke-surface-overlay" />
          <line x1={270} x2={510} y1={190} y2={190} strokeWidth={8} className="stroke-surface-overlay" />
          {GEARS.map((p, i) => {
            const rMain = (100 * p.main) / (p.main + p.counter)
            const on = engaged.includes(i + 1)
            const cls = on ? 'fill-coolant-950 stroke-coolant-400' : 'fill-surface-raised stroke-line-strong'
            return (
              <g key={i} data-gear={i + 1}>
                <rect x={GEAR_X[i] - 11} y={90 - rMain * 0.42} width={22} height={rMain * 0.84} rx={3} className={cls} strokeWidth={1.5} />
                <rect x={GEAR_X[i] - 11} y={190 - (100 - rMain) * 0.42} width={22} height={(100 - rMain) * 0.84} rx={3} className={cls} strokeWidth={1.5} />
                <DiagramLabel x={GEAR_X[i]} y={258} anchor="middle" tone={on ? 'coolant' : 'muted'}>
                  {String(i + 1)}
                </DiagramLabel>
              </g>
            )
          })}
          {GEAR_OF_FORK.map(([a, b], f) => {
            const xa = a ? GEAR_X[a - 1] : GEAR_X[b - 1] - 45
            const xb = GEAR_X[b - 1]
            const mid = (xa + xb) / 2
            const x = mid + forks[f] * ((xb - xa) / 2 - 16)
            return (
              <g key={f}>
                <rect x={x - 6} y={f === 1 ? 172 : 72} width={12} height={36} rx={2} className="fill-ignition-500/80 stroke-ignition-300" strokeWidth={1} />
                <line x1={x} x2={x} y1={f === 1 ? 208 : 72} y2={f === 1 ? 232 : 50} strokeWidth={2} className="stroke-ignition-400" />
              </g>
            )
          })}
          <DiagramLabel x={264} y={86} anchor="end">mainshaft</DiagramLabel>
          <DiagramLabel x={264} y={186} anchor="end">countershaft</DiagramLabel>
        </svg>
      }
      controls={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => lever('up')} leadingIcon={<ArrowUp className="size-4" />}>
              Lift (shift up)
            </Button>
            <Button size="sm" variant="secondary" onClick={() => lever('half')}>
              Half-shift to N
            </Button>
            <Button size="sm" variant="secondary" onClick={() => lever('down')} leadingIcon={<ArrowDown className="size-4" />}>
              Press (shift down)
            </Button>
          </div>
          <dl className="grid grid-cols-3 gap-4">
            <Readout label="Selected" value={NAME[gear]} tone="coolant" />
            <Readout label="Drum angle" value={`${Math.round(angle)}°`} />
            <Readout label="Gear ratio" value={gear ? `${gearRatio(gear).toFixed(2)} : 1` : '—'} />
          </dl>
        </>
      }
      status={`${note ? note + ' ' : ''}Each lever stroke turns the drum one step (neutral is a half step between first and second). The groove under each fork moves it sideways; the orange dog rings slide over and lock ${gear ? `gear pair ${gear}` : 'nothing'} to its shaft. All five pairs stay in mesh all the time — only the dogs change.`}
    />
  )
}
