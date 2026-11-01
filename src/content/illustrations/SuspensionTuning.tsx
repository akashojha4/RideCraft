import { useMemo, useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { LineChart } from '@/components/charts/LineChart'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { G } from '@/lib/mechanics/braking'
import { bumpRide, FORK_TRAVEL } from '@/lib/scenarios/sim'

/*
 * Mechanics lesson 14: spring, preload and damping, on the front-end quarter-car model
 * (110 kg sprung, 12 kg unsprung) crossing a 10 cm, 3.7 m speed breaker at 30 km/h.
 * Sag is how far the fork compresses under the motorcycle's own weight: (load − preload) / k.
 * Preload changes the sag (ride height), not the stiffness. The spring rate decides how
 * hard bumps feel; the damper decides how quickly the motion dies away. Total travel 146 mm;
 * what isn't used by sag is left for bumps.
 */

const TOTAL = 0.146
const LOAD = 110 * G
const V = 30 / 3.6

export default function SuspensionTuning() {
  const [k, setK] = useState(14)
  const [c, setC] = useState(15)
  const [preload, setPreload] = useState(570)
  const sag = Math.max(0, Math.min(TOTAL, (LOAD - preload) / (k * 1000)))
  // bumpRide's travel is measured from a 36 mm reference sag; more sag leaves less.
  const offset = sag - (TOTAL - FORK_TRAVEL)
  const r = useMemo(() => bumpRide(V, { start: 3, length: 3.7, height: 0.1 }, { k: k * 1000, c: c * 100, preload: offset }), [k, c, offset])
  const body = r.trace.map((p) => [p.t, p.body * 1000] as [number, number])
  const load = r.trace.map((p) => [p.t, Math.max(0, p.load) * 100] as [number, number])
  const end = r.trace[r.trace.length - 1].t
  const left = TOTAL - sag
  const bottomed = r.travelUsed > FORK_TRAVEL
  const sagShare = sag / TOTAL

  return (
    <DiagramFrame
      stage={
        <div className="grid gap-4 sm:grid-cols-2">
          <LineChart label="Height of the motorcycle's front over the bump" height={190} x={{ min: 0, max: end, ticks: [0, 0.5, 1, 1.5, 2].filter((v) => v <= end), label: 'time, s' }} y={{ min: -60, max: 180, ticks: [-60, 0, 60, 120, 180], label: 'front of motorcycle, mm' }} series={[{ id: 'body', label: 'Body', points: body, tone: 'coolant' }]} valueFormat={(v) => `${v.toFixed(0)} mm`} />
          <LineChart label="Front tyre load over the bump" height={190} x={{ min: 0, max: end, ticks: [0, 0.5, 1, 1.5, 2].filter((v) => v <= end), label: 'time, s' }} y={{ min: 0, max: 250, ticks: [0, 100, 200], label: 'tyre load, % of normal', format: (v) => `${v}` }} series={[{ id: 'load', label: 'Tyre load', points: load, tone: 'ignition' }]} valueFormat={(v) => `${v.toFixed(0)} %`} />
        </div>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-3">
            <Slider label="Spring rate" value={k} onChange={setK} min={8} max={24} valueText={`${k} N/mm`} tone="coolant" />
            <Slider label="Preload" value={preload} onChange={setPreload} min={0} max={900} step={10} valueText={`${preload} N`} tone="coolant" />
            <Slider label="Damping" value={c} onChange={setC} min={3} max={40} valueText={`${c * 100} N·s/m`} tone="coolant" />
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Sag" value={`${Math.round(sag * 1000)} mm (${Math.round(sagShare * 100)} %)`} tone={sagShare < 0.2 || sagShare > 0.4 ? 'caution' : 'ok'} />
            <Readout label="Travel left for bumps" value={`${Math.round(left * 1000)} mm`} />
            <Readout label="Peak jolt" value={`${r.peakG.toFixed(2)} g`} tone={r.peakG > 1.2 ? 'danger' : 'ink'} />
            <Readout label="Lowest tyre load" value={`${Math.round(r.minLoad * 100)} %`} tone={r.minLoad < 0.2 ? 'danger' : 'ok'} />
          </dl>
        </>
      }
      status={
        bottomed
          ? `The fork runs out of travel and bottoms out — a hard knock straight into the frame. ${sagShare > 0.4 ? 'Too much sag leaves too little travel: add preload or a stiffer spring.' : 'Add damping or a stiffer spring.'}`
          : c < 8
            ? `Too little damping: the spring stores the bump’s energy and gives it back — the front keeps bouncing, and the tyre load swings down to ${Math.round(r.minLoad * 100)} %${r.airborne ? ' (the wheel leaves the road)' : ''}. Grip comes and goes with it.`
            : c > 30
              ? `Too much damping: the fork can’t move quickly enough, so the bump goes straight into the motorcycle (${r.peakG.toFixed(2)} g) and the wheel skips over it.`
              : `Sag ${Math.round(sag * 1000)} mm (${Math.round(sagShare * 100)} % of travel — about 30 % is typical). The spring absorbs the bump, the damper stops it bouncing back, and the tyre keeps at least ${Math.round(r.minLoad * 100)} % of its load. Preload moves the ride height; it doesn’t make the spring any stiffer.`
      }
    />
  )
}
