import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { LineChart } from '@/components/charts/LineChart'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { mu, muLateral, peakSlip } from '@/lib/mechanics/tyre'

/*
 * Mechanics lesson 15: tyre dynamics. A tyre grips through a little slip: braking or
 * driving, the tread turns slightly slower or faster than the road passes; cornering, the
 * wheel points slightly away from its path (slip angle). Grip rises with slip to a peak,
 * then falls as the tyre slides. The contact patch is set by load and pressure:
 * area ≈ load / inflation pressure.
 */

const SLIP: [number, number][] = Array.from({ length: 101 }, (_, i) => [i, mu(i / 100, 1) * 100])
const ANGLE: [number, number][] = Array.from({ length: 61 }, (_, i) => [i / 2, muLateral(i / 2, 1) * 100])
const PEAK = peakSlip(1) * 100

export default function TyreSlip() {
  const [slip, setSlip] = useState(8)
  const [pressure, setPressure] = useState(225)
  const [load, setLoad] = useState(1200)
  const area = (load / (pressure * 1000)) * 1e4
  const grip = mu(slip / 100, 1)
  const zone = slip < PEAK - 2 ? 'Building grip' : slip <= PEAK + 4 ? 'At the peak' : 'Sliding'

  return (
    <DiagramFrame
      stage={
        <div className="grid gap-4 sm:grid-cols-2">
          <LineChart label={`Braking grip against wheel slip; ${slip} percent slip gives ${Math.round(grip * 100)} percent of peak`} height={190} x={{ min: 0, max: 100, ticks: [0, 25, 50, 75, 100], label: 'wheel slip, % (100 = locked)', format: (v) => `${v}` }} y={{ min: 0, max: 100, ticks: [0, 50, 100], label: 'grip, % of peak', format: (v) => `${v}` }} series={[{ id: 'long', label: 'Braking / driving', points: SLIP, tone: 'coolant' }]} marker={{ x: slip, label: `${slip} %` }} valueFormat={(v) => `${v.toFixed(0)} %`} />
          <LineChart label="Cornering grip against slip angle" height={190} x={{ min: 0, max: 30, ticks: [0, 10, 20, 30], label: 'slip angle, °', format: (v) => `${v}°` }} y={{ min: 0, max: 100, ticks: [0, 50, 100], label: 'grip, % of peak', format: (v) => `${v}` }} series={[{ id: 'lat', label: 'Cornering', points: ANGLE, tone: 'ignition' }]} valueFormat={(v) => `${v.toFixed(0)} %`} />
        </div>
      }
      controls={
        <>
          <Slider label="Wheel slip" value={slip} onChange={setSlip} min={0} max={100} valueText={`${slip} %`} tone="coolant" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Tyre pressure" value={pressure} onChange={setPressure} min={150} max={300} step={5} valueText={`${pressure} kPa (${(pressure / 6.895).toFixed(0)} psi)`} tone="coolant" />
            <Slider label="Load on the tyre" value={load} onChange={setLoad} min={600} max={2000} step={50} valueText={`${load} N`} tone="coolant" />
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Grip at this slip" value={`${Math.round(grip * 100)} % of peak`} tone={zone === 'Sliding' ? 'caution' : 'ok'} />
            <Readout label="State" value={zone} />
            <Readout label="Contact patch" value={`${area.toFixed(0)} cm²`} />
            <Readout label="Peak grip at" value={`${PEAK.toFixed(0)} % slip`} />
          </dl>
        </>
      }
      status={`${zone === 'Building grip' ? `At ${slip} % slip the tyre is still building grip — more braking force is available.` : zone === 'At the peak' ? `Around ${PEAK.toFixed(0)} % slip the tyre gives its most grip — where ABS and traction control aim to hold it.` : `Past the peak the tread starts to slide: grip falls towards about ${Math.round(mu(1, 1) * 100)} % when locked, and a sliding tyre can no longer steer.`} The contact patch is about ${area.toFixed(0)} cm² — load ÷ pressure. ${pressure < 190 ? 'Under-inflated: a bigger, flexing patch overheats the tyre and makes steering vague.' : pressure > 270 ? 'Over-inflated: a smaller patch means less grip, especially in the wet.' : 'Use the pressures in your owner’s manual, set when the tyres are cold.'}`}
    />
  )
}
