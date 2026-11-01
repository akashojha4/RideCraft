import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { LineChart } from '@/components/charts/LineChart'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { LIMITER_RPM, fullThrottleTorque } from '@/lib/mechanics/powertrain'

/*
 * Mechanics lesson 4: torque and power, from the same full-throttle torque curve the
 * simulators use. Power is torque times rotational speed: P = T × ω (ω in rad/s), so
 * power keeps rising after the torque peak until the torque falls faster than the revs
 * rise. Two charts on separate axes — never one chart with two y-scales.
 */

const pts = (fn: (rpm: number) => number): [number, number][] => {
  const out: [number, number][] = []
  for (let r = 1000; r <= LIMITER_RPM; r += 100) out.push([r, fn(r)])
  return out
}
const power = (rpm: number) => (fullThrottleTorque(rpm) * rpm * 2 * Math.PI) / 60 / 1000
const TORQUE = pts(fullThrottleTorque)
const POWER = pts(power)
const peakT = TORQUE.reduce((a, b) => (b[1] > a[1] ? b : a))
const peakP = POWER.reduce((a, b) => (b[1] > a[1] ? b : a))

export default function TorquePower() {
  const [rpm, setRpm] = useState(5000)
  const t = fullThrottleTorque(rpm)
  const p = power(rpm)
  const xAxis = { min: 1000, max: 9500, ticks: [1000, 3000, 5000, 7000, 9000], label: 'engine speed, RPM', format: (v: number) => `${v / 1000}k` }
  return (
    <DiagramFrame
      stage={
        <div className="grid gap-4 sm:grid-cols-2">
          <LineChart label={`Full-throttle torque: ${t.toFixed(1)} newton metres at ${rpm} RPM`} height={190} x={xAxis} y={{ min: 0, max: 12, ticks: [0, 4, 8, 12], label: 'torque, N·m' }} series={[{ id: 'torque', label: 'Torque', points: TORQUE, tone: 'coolant' }]} marker={{ x: rpm }} valueFormat={(v) => `${v.toFixed(1)} N·m`} />
          <LineChart label={`Full-throttle power: ${p.toFixed(1)} kilowatts at ${rpm} RPM`} height={190} x={xAxis} y={{ min: 0, max: 10, ticks: [0, 2.5, 5, 7.5, 10], label: 'power, kW' }} series={[{ id: 'power', label: 'Power', points: POWER, tone: 'ignition' }]} marker={{ x: rpm }} valueFormat={(v) => `${v.toFixed(1)} kW`} />
        </div>
      }
      controls={
        <>
          <Slider label="Engine speed" value={rpm} onChange={setRpm} min={1000} max={9500} step={100} valueText={`${rpm.toLocaleString('en')} RPM`} tone="coolant" />
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Torque" value={`${t.toFixed(1)} N·m`} tone="coolant" />
            <Readout label="Rotational speed" value={`${((rpm * 2 * Math.PI) / 60).toFixed(0)} rad/s`} />
            <Readout label="Power = T × ω" value={`${p.toFixed(2)} kW · ${(p * 1.341).toFixed(1)} hp`} />
            <Readout label="Peaks" value={`T ${peakT[0]} · P ${peakP[0]} RPM`} />
          </dl>
        </>
      }
      status={`At ${rpm.toLocaleString('en')} RPM the engine makes ${t.toFixed(1)} N·m. Multiply by the rotational speed — ${((rpm * 2 * Math.PI) / 60).toFixed(0)} rad/s — to get power: ${(p * 1000).toFixed(0)} W, or ${p.toFixed(1)} kW. Torque peaks at ${peakT[0].toLocaleString('en')} RPM, but power keeps climbing to ${peakP[0].toLocaleString('en')} RPM because the revs rise faster than the torque falls. Torque is the twist you feel; power is how fast that twist does work — and it sets the top speed.`}
    />
  )
}
