import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { LineChart } from '@/components/charts/LineChart'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { compressionEnd, ottoEfficiency, runCycle } from '@/lib/mechanics/combustion'

/*
 * Mechanics lesson 3: compression ratio = (swept volume + clearance volume) / clearance
 * volume. Squeezing the charge harder before it burns lets it expand further afterwards,
 * so more of its heat becomes work: ideal (air-standard Otto) efficiency = 1 − 1/r^0.4.
 * The cost: higher pressure and temperature at the end of compression, so a higher
 * octane fuel is needed to avoid knock.
 */

const CYL = { x: 70, w: 90, top: 40, stroke: 150 }
const RATIOS: [number, number][] = []
for (let r = 6; r <= 14.01; r += 0.25) RATIOS.push([r, ottoEfficiency(r) * 100])

export default function CompressionRatio() {
  const [cr, setCr] = useState(9.5)
  const clearancePx = CYL.stroke / (cr - 1)
  const end = compressionEnd(cr)
  const model = runCycle(20, cr)
  const fuel = cr <= 10 ? 'Regular (RON 91)' : cr <= 11.5 ? 'Premium (RON 95)' : 'High-octane (RON 98)'
  const piston = (y: number, label: string, x: number) => (
    <g transform={`translate(${x},0)`}>
      <rect x={0} y={CYL.top} width={CYL.w} height={CYL.stroke + clearancePx + 20} rx={4} className="fill-surface-sunken stroke-ink-muted" strokeWidth={2} />
      <rect x={3} y={CYL.top + 3} width={CYL.w - 6} height={y - CYL.top - 3} className="fill-coolant-400/30" />
      <rect x={3} y={y} width={CYL.w - 6} height={24} rx={3} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
      <DiagramLabel x={CYL.w / 2} y={CYL.top + CYL.stroke + clearancePx + 44} anchor="middle">
        {label}
      </DiagramLabel>
    </g>
  )

  return (
    <DiagramFrame
      stage={
        <div className="grid items-center gap-4 sm:grid-cols-[2fr_3fr]">
          <svg viewBox="0 20 340 330" className="mx-auto w-full max-w-xs" role="img" aria-label={`Compression ratio ${cr} to 1: swept volume and clearance volume`}>
            {piston(CYL.top + clearancePx + CYL.stroke, 'Bottom dead centre', CYL.x - 30)}
            {piston(CYL.top + clearancePx, 'Top dead centre', CYL.x + 100)}
            <DiagramLabel x={CYL.x + 100 + CYL.w + 6} y={CYL.top + clearancePx / 2 + 4}>clearance</DiagramLabel>
            <DiagramLabel x={CYL.x - 30 + CYL.w / 2} y={CYL.top + CYL.stroke / 2 + clearancePx} anchor="middle" tone="coolant">
              full volume
            </DiagramLabel>
          </svg>
          <LineChart
            label={`Ideal efficiency against compression ratio; ${cr} to 1 gives ${Math.round(ottoEfficiency(cr) * 100)} percent`}
            height={200}
            x={{ min: 6, max: 14, ticks: [6, 8, 10, 12, 14], label: 'compression ratio', format: (v) => `${v}:1` }}
            y={{ min: 40, max: 70, ticks: [40, 50, 60, 70], label: 'ideal efficiency, %' }}
            series={[{ id: 'otto', label: 'Ideal efficiency', points: RATIOS, tone: 'coolant' }]}
            marker={{ x: cr, label: `${cr}:1` }}
            valueFormat={(v) => `${v.toFixed(1)} %`}
          />
        </div>
      }
      controls={
        <>
          <Slider label="Compression ratio" value={cr * 2} onChange={(v) => setCr(v / 2)} min={12} max={28} valueText={`${cr} : 1`} tone="coolant" />
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Ideal efficiency" value={`${(ottoEfficiency(cr) * 100).toFixed(1)} %`} tone="coolant" />
            <Readout label="End of compression" value={`${end.bar.toFixed(0)} bar · ${Math.round(end.kelvin - 273)} °C`} />
            <Readout label="Work per cycle (model)" value={`${model.work.toFixed(0)} J`} />
            <Readout label="Fuel" value={fuel} tone={cr > 11.5 ? 'caution' : 'ink'} />
          </dl>
        </>
      }
      status={`At ${cr} : 1 the mixture is squeezed into 1/${cr} of the space it filled. It is ${end.bar.toFixed(0)} bar and about ${Math.round(end.kelvin - 273)} °C before the spark, and the ideal efficiency is ${(ottoEfficiency(cr) * 100).toFixed(0)} %. Small commuter engines run about 9.5–10 : 1 on regular fuel; sports engines 12–13 : 1, which needs high-octane fuel so the hotter mixture doesn’t knock.`}
    />
  )
}
