import { AlertTriangle, ArrowDown, Check } from 'lucide-react'
import { useRef, useState, type PointerEvent } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { Slider } from '@/components/ui/Slider'
import { GEARS, REDLINE_RPM, rpmAtSpeed } from '@/lib/mechanics/gearbox'
import { cn } from '@/lib/cn'

/*
 * Lesson 7: engine RPM against road speed in each gear (one axis). Each gear is a
 * straight line through the origin whose slope is set by the overall ratio. The
 * selected gear is emphasised; the others are muted and direct-labelled. Hover the plot
 * (or use the slider) to read every gear at one speed — the table is the full readout.
 */

const MAX_SPEED = 110
const MAX_RPM = 10000
/** Below this a small single labours: it can't pull smoothly and may stall. */
const LUG_RPM = 2500
const P = { left: 56, right: 424, top: 22, bottom: 214 }
const x = (kmh: number) => P.left + (kmh / MAX_SPEED) * (P.right - P.left)
const y = (rpm: number) => P.bottom - (rpm / MAX_RPM) * (P.bottom - P.top)

const gears = GEARS.map((_, i) => {
  const g = i + 1
  const slope = rpmAtSpeed(1, g)
  return { g, slope, endSpeed: Math.min(MAX_SPEED, MAX_RPM / slope) }
})

type Status = 'low' | 'ok' | 'high'
const statusOf = (rpm: number): Status => (rpm < LUG_RPM ? 'low' : rpm >= REDLINE_RPM ? 'high' : 'ok')
const statusLabel: Record<Status, string> = { low: 'Labouring', ok: 'Usable', high: 'Over redline' }
const ordinal = ['1st', '2nd', '3rd', '4th', '5th']

export default function GearSpeedChart() {
  const [speed, setSpeed] = useState(40)
  const [gear, setGear] = useState(3)
  const svgRef = useRef<SVGSVGElement>(null)

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    // Touch users scroll the page over the chart and use the slider instead.
    if (e.pointerType === 'touch') return
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    const kmh = ((pt.x - P.left) / (P.right - P.left)) * MAX_SPEED
    if (kmh >= 0 && kmh <= MAX_SPEED) setSpeed(Math.round(kmh))
  }

  const rows = gears.map((d) => {
    const rpm = d.slope * speed
    return { ...d, rpm, status: statusOf(rpm) }
  })
  const usable = rows.filter((r) => r.status === 'ok').map((r) => r.g)

  return (
    <DiagramFrame
      stage={
        <svg
          ref={svgRef}
          viewBox="0 0 470 248"
          className="w-full"
          role="img"
          aria-label="Line chart of engine RPM against road speed for each of the five gears"
          onPointerMove={onPointerMove}
        >
          {/* Zones */}
          <rect x={P.left} y={y(LUG_RPM)} width={P.right - P.left} height={y(0) - y(LUG_RPM)} className="fill-surface-overlay" opacity={0.55} />
          <rect x={P.left} y={y(MAX_RPM)} width={P.right - P.left} height={y(REDLINE_RPM) - y(MAX_RPM)} className="fill-danger-500" opacity={0.14} />
          <text x={P.right - 6} y={y(LUG_RPM) + 14} textAnchor="end" className="fill-ink-subtle text-[10px]">
            Engine labours below {LUG_RPM.toLocaleString('en')} RPM
          </text>
          <text x={P.left + 6} y={y(REDLINE_RPM) - 4} className="fill-ink-muted text-[10px]">
            Redline
          </text>

          {/* Grid and axes */}
          {[0, 2000, 4000, 6000, 8000, 10000].map((r) => (
            <g key={r}>
              <line x1={P.left} x2={P.right} y1={y(r)} y2={y(r)} strokeWidth={1} className="stroke-line" />
              <text x={P.left - 8} y={y(r) + 3.5} textAnchor="end" className="tabular fill-ink-subtle font-mono text-[10px]">
                {r / 1000}k
              </text>
            </g>
          ))}
          {[0, 20, 40, 60, 80, 100].map((s) => (
            <text key={s} x={x(s)} y={P.bottom + 16} textAnchor="middle" className="tabular fill-ink-subtle font-mono text-[10px]">
              {s}
            </text>
          ))}
          <text x={(P.left + P.right) / 2} y={P.bottom + 32} textAnchor="middle" className="fill-ink-subtle text-[10px]">
            Road speed (km/h)
          </text>
          <text x={10} y={10} className="fill-ink-subtle text-[10px]">
            Engine RPM
          </text>

          {/* Gear lines: muted first, selected on top */}
          {[...gears].sort((a, b) => Number(a.g === gear) - Number(b.g === gear)).map((d) => {
            const active = d.g === gear
            const endX = x(d.endSpeed)
            const endY = y(d.slope * d.endSpeed)
            return (
              <g key={d.g} onClick={() => setGear(d.g)} className="cursor-pointer">
                <line x1={x(0)} y1={y(0)} x2={endX} y2={endY} stroke="transparent" strokeWidth={14} />
                <line x1={x(0)} y1={y(0)} x2={endX} y2={endY} strokeWidth={2} strokeLinecap="round" className={active ? 'stroke-coolant-400' : 'stroke-ink-subtle'} opacity={active ? 1 : 0.55} />
                <text
                  x={d.endSpeed >= MAX_SPEED ? endX + 6 : endX}
                  y={d.endSpeed >= MAX_SPEED ? endY + 4 : P.top - 6}
                  textAnchor={d.endSpeed >= MAX_SPEED ? 'start' : 'middle'}
                  className={cn('font-mono text-[10px]', active ? 'fill-ink' : 'fill-ink-subtle')}
                >
                  {ordinal[d.g - 1]}
                </text>
              </g>
            )
          })}

          {/* Crosshair */}
          <line x1={x(speed)} x2={x(speed)} y1={P.top} y2={P.bottom} strokeWidth={1} className="stroke-ink-muted" />
          {rows.map((r) =>
            r.rpm <= MAX_RPM ? (
              <circle key={r.g} cx={x(speed)} cy={y(r.rpm)} r={r.g === gear ? 5 : 4} strokeWidth={2} className={cn('stroke-bg', r.g === gear ? 'fill-coolant-400' : 'fill-ink-subtle')} />
            ) : null,
          )}
          <line x1={P.left} x2={P.right} y1={P.bottom} y2={P.bottom} strokeWidth={1} className="stroke-line-strong" />
        </svg>
      }
      controls={
        <>
          <Slider label="Road speed" value={speed} onChange={setSpeed} max={MAX_SPEED} valueText={`${speed} km/h`} tone="coolant" />
          <table className="w-full text-sm">
            <caption className="sr-only">Engine RPM in each gear at {speed} km/h</caption>
            <thead>
              <tr className="text-left text-[11px] tracking-wide text-ink-subtle uppercase">
                <th className="py-1 font-normal">Gear</th>
                <th className="py-1 text-right font-normal">RPM at {speed} km/h</th>
                <th className="py-1 pl-4 font-normal">Engine</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.g}
                  onClick={() => setGear(r.g)}
                  className={cn('cursor-pointer border-t border-line', r.g === gear && 'bg-coolant-950/60')}
                >
                  <td className="py-1.5 font-mono text-ink">
                    <span className={cn('mr-2 inline-block h-0.5 w-3 align-middle', r.g === gear ? 'bg-coolant-400' : 'bg-ink-subtle')} />
                    {ordinal[r.g - 1]}
                  </td>
                  <td className="tabular py-1.5 text-right font-mono text-ink">{Math.round(r.rpm / 10) * 10}</td>
                  <td className="py-1.5 pl-4 text-ink-muted">
                    <span className="inline-flex items-center gap-1.5">
                      {r.status === 'ok' && <Check className="size-3.5 text-ok-400" aria-hidden />}
                      {r.status === 'low' && <ArrowDown className="size-3.5 text-caution-400" aria-hidden />}
                      {r.status === 'high' && <AlertTriangle className="size-3.5 text-danger-400" aria-hidden />}
                      {statusLabel[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      }
      status={
        speed === 0
          ? 'At a standstill the engine can only be connected through a slipping clutch — that is why you pull away in first.'
          : usable.length
            ? `At ${speed} km/h, ${usable.length === 1 ? 'only gear ' + usable[0] : 'gears ' + usable[0] + '–' + usable[usable.length - 1]} keep the engine between ${LUG_RPM.toLocaleString('en')} and ${REDLINE_RPM.toLocaleString('en')} RPM. Lower gears give stronger acceleration; higher gears give quieter, more economical cruising.`
            : `At ${speed} km/h no gear keeps the engine in its comfortable range.`
      }
    />
  )
}
