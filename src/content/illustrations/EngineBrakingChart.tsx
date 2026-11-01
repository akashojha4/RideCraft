import { useMemo, useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { LineChart, type Series } from '@/components/charts/LineChart'
import { Readout } from '@/components/simulation/Readouts'
import { cn } from '@/lib/cn'
import { LIMITER_RPM, drivelineSpeed, initialPowertrain, radToRpm, stepPowertrain } from '@/lib/mechanics/powertrain'

/*
 * Mechanics lesson 17: how hard engine braking slows the motorcycle, in each gear,
 * measured on the powertrain model (throttle closed, clutch out). The engine's friction
 * and pumping losses resist being turned; a lower gear turns the engine faster for the
 * same road speed and multiplies its resistance by a bigger ratio. "Coasting" is clutch
 * in: only air drag and rolling resistance. Emphasis colouring: the chosen gear in the
 * accent, the others muted, every line labelled.
 */

function decelAt(kmhV: number, gear: number) {
  const v = kmhV / 3.6
  let s = initialPowertrain({ speed: v, engine: gear ? drivelineSpeed(v, gear) : 150, locked: gear > 0 })
  const inputs = { gear, clutch: gear ? 0 : 1, throttle: 0, brake: 0, grade: 0 }
  for (let i = 0; i < 30; i++) s = stepPowertrain(s, inputs, 0.01)
  return Math.max(0, (v - s.speed) / 0.3)
}

export default function EngineBrakingChart() {
  const [gear, setGear] = useState(3)
  const [speed, setSpeed] = useState(40)
  const series = useMemo(() => {
    const out: Series[] = []
    for (let g = 1; g <= 5; g++) {
      const pts: [number, number][] = []
      for (let k = 5; k <= 100; k += 2.5) {
        if (radToRpm(drivelineSpeed(k / 3.6, g)) > LIMITER_RPM) break
        // Below about 2,000 RPM the idle controller starts opening the throttle, so leave that range out.
        if (radToRpm(drivelineSpeed(k / 3.6, g)) < 2000) continue
        pts.push([k, decelAt(k, g)])
      }
      out.push({ id: `g${g}`, label: ['1st', '2nd', '3rd', '4th', '5th'][g - 1], points: pts, tone: g === gear ? 'ignition' : 'muted' })
    }
    const coast: [number, number][] = []
    for (let k = 5; k <= 100; k += 5) coast.push([k, decelAt(k, 0)])
    out.push({ id: 'coast', label: 'Coasting', points: coast, tone: 'muted', dashed: true })
    return out
  }, [gear])
  const now = series[gear - 1].points.reduce<[number, number] | null>((a, p) => (Math.abs(p[0] - speed) < Math.abs((a ?? [1e9])[0] - speed) ? p : a), null)
  const inRange = now !== null && Math.abs(now[0] - speed) <= 2.5
  const rpm = radToRpm(drivelineSpeed(speed / 3.6, gear))

  return (
    <DiagramFrame
      stage={
        <LineChart
          label={`Engine-braking deceleration against speed in each gear; ${['1st', '2nd', '3rd', '4th', '5th'][gear - 1]} highlighted`}
          height={250}
          x={{ min: 0, max: 100, ticks: [0, 20, 40, 60, 80, 100], label: 'road speed, km/h', format: (v) => `${v}` }}
          y={{ min: 0, max: 3, ticks: [0, 1, 2, 3], label: 'deceleration, m/s²' }}
          series={series}
          marker={{ x: speed }}
          valueFormat={(v) => `${v.toFixed(2)} m/s²`}
          legend={false}
        />
      }
      controls={
        <>
          <div className="flex flex-wrap items-center gap-4">
            <div role="group" aria-label="Gear" className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((g) => (
                <button key={g} type="button" aria-pressed={gear === g} onClick={() => setGear(g)} className={cn('h-8 w-10 rounded-lg border font-mono text-sm', gear === g ? 'border-ignition-500/60 bg-ignition-950 text-ignition-200' : 'border-line text-ink-muted hover:text-ink')}>
                  {g}
                </button>
              ))}
            </div>
            <div role="group" aria-label="Speed" className="flex gap-1.5">
              {[20, 40, 60, 80].map((k) => (
                <button key={k} type="button" aria-pressed={speed === k} onClick={() => setSpeed(k)} className={cn('h-8 rounded-lg border px-3 text-sm', speed === k ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                  {k} km/h
                </button>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-4">
            <Readout label="Engine speed" value={inRange ? `${Math.round(rpm).toLocaleString('en')} RPM` : rpm > LIMITER_RPM ? 'Over the limiter' : 'Below 2,000 RPM'} tone={rpm > LIMITER_RPM ? 'danger' : 'ink'} />
            <Readout label="Engine braking" value={inRange ? `${now![1].toFixed(2)} m/s²` : '—'} tone="coolant" />
            <Readout label="Coasting" value={`${decelAt(speed, 0).toFixed(2)} m/s²`} />
          </dl>
        </>
      }
      status={
        !inRange
          ? rpm > LIMITER_RPM
            ? `${speed} km/h in ${['1st', '2nd', '3rd', '4th', '5th'][gear - 1]} would turn the engine past its limiter — a downshift here would over-rev it. Slow down first.`
            : `At ${speed} km/h, ${['1st', '2nd', '3rd', '4th', '5th'][gear - 1]} gear turns the engine below 2,000 RPM, where the idle control starts opening the throttle and engine braking fades. Change down for more.`
          : `In ${['1st', '2nd', '3rd', '4th', '5th'][gear - 1]} at ${speed} km/h the engine turns at ${Math.round(rpm).toLocaleString('en')} RPM. With the throttle closed, its internal friction and the vacuum it pulls against slow the motorcycle at ${now![1].toFixed(2)} m/s² — about ${(now![1] / decelAt(speed, 0)).toFixed(1)} times more than coasting with the clutch in. Lower gears and higher revs mean stronger engine braking. It acts only on the rear wheel and is gentle — though changing down too many gears at once on a slippery road can still make the rear wheel skip.`
      }
    />
  )
}
