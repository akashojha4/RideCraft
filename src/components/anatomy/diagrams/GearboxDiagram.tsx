import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { Readout } from '@/components/simulation/Readouts'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { GEARS, REDLINE_RPM, gearRatio, overallRatio, rpmAtSpeed, shiftLever, type LeverAction } from '@/lib/mechanics/gearbox'
import { DiagramFrame, DiagramLabel } from '../DiagramFrame'

/*
 * Five-speed constant-mesh sequential gearbox, seen from the side with both shafts
 * horizontal. Every pair is always in mesh; dogs lock the selected pair to its shafts.
 *
 * Ratios come from lib/mechanics/gearbox.ts. Gear radii are drawn proportional to tooth
 * count with a fixed centre distance, so each pair meshes.
 */

const MAIN_Y = 78
const COUNTER_Y = 172
const CENTRE = COUNTER_Y - MAIN_Y
const GEAR_X = [120, 180, 240, 300, 360]
const GEAR_W = 26
/** Lever positions from top to bottom, as on the pattern diagram. */
const PATTERN = [5, 4, 3, 2, 0, 1]

export default function GearboxDiagram() {
  const [gear, setGear] = useState(0)
  const [message, setMessage] = useState('In neutral: no gear pair is locked, so the countershaft is not driven.')
  const reduceMotion = useReducedMotion()

  const lever = (action: LeverAction) => {
    const r = shiftLever(gear, action)
    setGear(r.gear)
    setMessage(r.note)
  }
  const shiftUp = () => lever('up')
  const shiftDown = () => lever('down')
  const halfShift = () => lever('half')

  const x = gear ? GEAR_X[gear - 1] : 0
  const powerPath = gear ? `M44,${MAIN_Y} L${x},${MAIN_Y} L${x},${COUNTER_Y} L446,${COUNTER_Y}` : `M44,${MAIN_Y} L400,${MAIN_Y}`
  const ratio = gear ? gearRatio(gear) : 0
  const rpm40 = gear ? rpmAtSpeed(40, gear) : 0

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 480 250" className="w-full" role="img" aria-label={gear ? `Gearbox in gear ${gear}` : 'Gearbox in neutral'}>
          <g strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
            <line x1={40} y1={MAIN_Y} x2={400} y2={MAIN_Y} strokeWidth={8} className="stroke-surface-overlay" />
            <line x1={80} y1={COUNTER_Y} x2={448} y2={COUNTER_Y} strokeWidth={8} className="stroke-surface-overlay" />
            <rect x={18} y={38} width={26} height={80} rx={4} className="fill-surface-raised stroke-ink-subtle" />
            <rect x={440} y={150} width={12} height={44} rx={2} className="fill-surface-raised stroke-ink-subtle" />

            {GEARS.map((pair, i) => {
              const rMain = (CENTRE * pair.main) / (pair.main + pair.counter)
              const rCounter = CENTRE - rMain
              const active = gear === i + 1
              const cls = active ? 'fill-coolant-950 stroke-coolant-400' : 'fill-surface-raised stroke-line-strong'
              return (
                <g key={i}>
                  <rect x={GEAR_X[i] - GEAR_W / 2} y={MAIN_Y - rMain} width={GEAR_W} height={rMain * 2} rx={3} className={cls} />
                  <rect x={GEAR_X[i] - GEAR_W / 2} y={COUNTER_Y - rCounter} width={GEAR_W} height={rCounter * 2} rx={3} className={cls} />
                  {active && (
                    <>
                      {/* Dogs locking the pair to the shafts */}
                      {[MAIN_Y, COUNTER_Y].map((y) => (
                        <g key={y}>
                          <rect x={GEAR_X[i] + GEAR_W / 2} y={y - 7} width={6} height={4} className="fill-coolant-300" />
                          <rect x={GEAR_X[i] + GEAR_W / 2} y={y + 3} width={6} height={4} className="fill-coolant-300" />
                        </g>
                      ))}
                    </>
                  )}
                  <DiagramLabel x={GEAR_X[i]} y={240} anchor="middle" tone={active ? 'coolant' : 'muted'}>
                    {`${i + 1}`}
                  </DiagramLabel>
                </g>
              )
            })}

            <motion.path
              key={powerPath}
              d={powerPath}
              fill="none"
              strokeWidth={4}
              strokeDasharray="12 10"
              className={gear ? 'stroke-coolant-300' : 'stroke-ink-subtle'}
              initial={{ strokeDashoffset: 0 }}
              animate={reduceMotion ? undefined : { strokeDashoffset: -44 }}
              transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
            />

            <DiagramLabel x={31} y={30} anchor="middle">Clutch</DiagramLabel>
            <DiagramLabel x={410} y={MAIN_Y + 4}>Mainshaft</DiagramLabel>
            <DiagramLabel x={420} y={COUNTER_Y + 34} anchor="middle">Countershaft</DiagramLabel>
            <DiagramLabel x={446} y={142} anchor="middle">Sprocket</DiagramLabel>
            <DiagramLabel x={20} y={240}>Gear pair</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4">
            <ol aria-label="Gear pattern" className="flex flex-col gap-1">
              {PATTERN.map((g) => (
                <li
                  key={g}
                  aria-current={gear === g ? 'true' : undefined}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md border font-mono text-sm',
                    gear === g
                      ? g === 0
                        ? 'border-ok-500/60 bg-ok-950 text-ok-400'
                        : 'border-coolant-500/60 bg-coolant-950 text-coolant-200'
                      : 'border-line text-ink-subtle',
                  )}
                >
                  {g === 0 ? 'N' : g}
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="secondary" onClick={shiftUp}>
                Lift lever (up)
              </Button>
              <Button size="sm" variant="secondary" onClick={halfShift}>
                Half-shift to N
              </Button>
              <Button size="sm" variant="secondary" onClick={shiftDown}>
                Press lever (down)
              </Button>
            </div>
          </div>
          <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3">
            <Readout label="Selected" value={gear ? `Gear ${gear}` : 'Neutral'} tone={gear ? 'coolant' : 'ok'} />
            <Readout label="Gear ratio" value={gear ? `${ratio.toFixed(2)} : 1` : '—'} />
            <Readout
              label="Overall ratio"
              value={gear ? `${overallRatio(gear).toFixed(1)} : 1` : '—'}
            />
            <Readout
              label="RPM at 40 km/h"
              value={gear ? `${Math.round(rpm40 / 10) * 10}${rpm40 > REDLINE_RPM ? ' — over redline' : ''}` : '—'}
              tone={rpm40 > REDLINE_RPM ? 'danger' : 'ink'}
            />
          </dl>
        </div>
      }
      status={
        <>
          <span className="font-medium text-ink">{message}</span>{' '}
          {gear > 0 &&
            `The ${GEARS[gear - 1].main}-tooth mainshaft gear drives the ${GEARS[gear - 1].counter}-tooth countershaft gear, so torque is multiplied about ${ratio.toFixed(2)} times at this stage (less friction losses).`}
        </>
      }
    />
  )
}
