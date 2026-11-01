import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { GEARS, TYRE_CIRCUMFERENCE, overallRatio, rpmAtSpeed } from '@/lib/mechanics/gearbox'
import { cn } from '@/lib/cn'

/*
 * Lesson 6: how the gearing multiplies engine torque into a push at the road.
 * Push at the tyre = engine torque × overall ratio × drivetrain efficiency ÷ tyre radius.
 * Assumes 9 N·m from the engine (typical of a 125 cc single near peak torque) and about
 * 90 % drivetrain efficiency. Column chart: the selected gear in the accent, others muted.
 */

const ENGINE_TORQUE = 9
const EFFICIENCY = 0.9
const TYRE_RADIUS = TYRE_CIRCUMFERENCE / (2 * Math.PI)
const RPM_FOR_SPEED = 7500

const gears = GEARS.map((_, i) => {
  const g = i + 1
  const wheelTorque = ENGINE_TORQUE * overallRatio(g) * EFFICIENCY
  return { g, wheelTorque, thrust: wheelTorque / TYRE_RADIUS, speed: RPM_FOR_SPEED / rpmAtSpeed(1, g) }
})

const PLOT = { left: 56, right: 452, top: 24, bottom: 196 }
const Y_MAX = 1000
const yFor = (n: number) => PLOT.bottom - (n / Y_MAX) * (PLOT.bottom - PLOT.top)
const BAR_W = 24
const slot = (PLOT.right - PLOT.left) / gears.length

export default function WheelTorque() {
  const [gear, setGear] = useState(1)
  const sel = gears[gear - 1]

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 470 230" className="w-full" role="img" aria-label="Column chart of the push at the rear tyre in each gear">
          {[0, 250, 500, 750, 1000].map((n) => (
            <g key={n}>
              <line x1={PLOT.left} x2={PLOT.right} y1={yFor(n)} y2={yFor(n)} strokeWidth={1} className="stroke-line" />
              <text x={PLOT.left - 8} y={yFor(n) + 4} textAnchor="end" className="tabular fill-ink-subtle font-mono text-[10px]">
                {n}
              </text>
            </g>
          ))}
          <text x={14} y={PLOT.top - 8} className="fill-ink-subtle font-mono text-[10px]">
            Push at the tyre (N)
          </text>
          {gears.map((d, i) => {
            const cx = PLOT.left + slot * (i + 0.5)
            const top = yFor(d.thrust)
            const active = d.g === gear
            return (
              <g key={d.g} onPointerEnter={() => setGear(d.g)} onClick={() => setGear(d.g)} className="cursor-pointer">
                <rect x={cx - slot / 2} y={PLOT.top} width={slot} height={PLOT.bottom - PLOT.top + 26} fill="transparent" />
                <path
                  d={`M${cx - BAR_W / 2},${PLOT.bottom} L${cx - BAR_W / 2},${top + 4} Q${cx - BAR_W / 2},${top} ${cx - BAR_W / 2 + 4},${top} L${cx + BAR_W / 2 - 4},${top} Q${cx + BAR_W / 2},${top} ${cx + BAR_W / 2},${top + 4} L${cx + BAR_W / 2},${PLOT.bottom} Z`}
                  className={active ? 'fill-coolant-400' : 'fill-line-strong'}
                />
                <text x={cx} y={top - 6} textAnchor="middle" className={cn('tabular font-mono text-[10px]', active ? 'fill-ink' : 'fill-ink-subtle')}>
                  {Math.round(d.thrust)}
                </text>
                <text x={cx} y={PLOT.bottom + 18} textAnchor="middle" className={cn('font-mono text-[11px]', active ? 'fill-ink' : 'fill-ink-muted')}>
                  {`Gear ${d.g}`}
                </text>
              </g>
            )
          })}
          <line x1={PLOT.left} x2={PLOT.right} y1={PLOT.bottom} y2={PLOT.bottom} strokeWidth={1} className="stroke-line-strong" />
        </svg>
      }
      controls={
        <>
          <div role="group" aria-label="Gear" className="flex gap-1.5">
            {gears.map((d) => (
              <button
                key={d.g}
                type="button"
                aria-pressed={gear === d.g}
                onClick={() => setGear(d.g)}
                className={cn(
                  'h-9 w-12 rounded-lg border font-mono text-sm transition-colors',
                  gear === d.g ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink',
                )}
              >
                {d.g}
              </button>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Overall ratio" value={`${overallRatio(gear).toFixed(1)} : 1`} />
            <Readout label="Torque at wheel" value={`${Math.round(sel.wheelTorque)} N·m`} tone="coolant" />
            <Readout label="Push at tyre" value={`${Math.round(sel.thrust)} N`} tone="coolant" />
            <Readout label={`Speed at ${RPM_FOR_SPEED.toLocaleString('en')} RPM`} value={`${Math.round(sel.speed)} km/h`} />
          </dl>
        </>
      }
      status={`Gear ${gear}: the engine’s ${ENGINE_TORQUE} N·m becomes about ${Math.round(sel.wheelTorque)} N·m at the rear wheel — a push of about ${Math.round(sel.thrust)} N at the road. ${
        gear === 1
          ? 'First gear gives the strongest push, but the engine reaches high RPM at only ' + Math.round(sel.speed) + ' km/h.'
          : gear === 5
            ? 'Top gear gives the weakest push, but lets you cruise at ' + Math.round(sel.speed) + ' km/h at the same engine speed.'
            : 'Each higher gear trades push for speed.'
      } Assumes ${ENGINE_TORQUE} N·m from the engine and ~${Math.round(EFFICIENCY * 100)} % drivetrain efficiency.`}
    />
  )
}
