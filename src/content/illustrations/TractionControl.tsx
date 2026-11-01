import { useMemo, useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { LineChart } from '@/components/charts/LineChart'
import { Readout } from '@/components/simulation/Readouts'
import { cn } from '@/lib/cn'
import { GRIP } from '@/lib/mechanics/braking'
import { launch } from '@/lib/mechanics/tyre'

/*
 * Mechanics lesson 13: traction control, the mirror image of ABS. A sudden full throttle
 * in a low gear asks the rear tyre for more drive than the road can take: the wheel spins
 * up and the tyre slides sideways as easily as forwards. Traction control compares rear
 * and front wheel speeds and cuts engine torque (ignition, fuel or throttle) whenever the
 * rear slips more than about 10 %, restoring it as grip returns.
 */

const V0 = 10 / 3.6

export default function TractionControl() {
  const [tc, setTc] = useState(true)
  const [wet, setWet] = useState(true)
  const peak = wet ? GRIP.wet : GRIP.dry
  const run = useMemo(() => launch(V0, peak, tc), [peak, tc])
  const other = useMemo(() => launch(V0, peak, !tc), [peak, tc])
  const maxSlip = Math.max(...run.samples.map((s) => s.slip))
  const meanSlip = run.samples.reduce((a, s) => a + s.slip, 0) / run.samples.length

  return (
    <DiagramFrame
      stage={
        <div className="grid gap-4 sm:grid-cols-2">
          <LineChart
            label={`Road speed and rear-wheel speed after snapping the throttle open ${tc ? 'with' : 'without'} traction control`}
            height={200}
            x={{ min: 0, max: 2.5, ticks: [0, 1, 2], label: 'time, s', format: (v) => `${v}` }}
            y={{ min: 0, max: 40, ticks: [0, 20, 40], label: 'speed, km/h' }}
            series={[
              { id: 'road', label: 'Motorcycle', points: run.samples.map((s) => [s.t, s.v * 3.6]), tone: 'muted' },
              { id: 'wheel', label: 'Rear wheel', points: run.samples.map((s) => [s.t, s.wheel * 3.6]), tone: tc ? 'coolant' : 'danger' },
            ]}
            valueFormat={(v) => `${v.toFixed(0)} km/h`}
          />
          <LineChart
            label="Engine torque reaching the rear wheel"
            height={200}
            x={{ min: 0, max: 2.5, ticks: [0, 1, 2], label: 'time, s', format: (v) => `${v}` }}
            y={{ min: 0, max: 100, ticks: [0, 50, 100], label: 'drive torque, % of demand', format: (v) => `${v}` }}
            series={[{ id: 'torque', label: 'Torque', points: run.samples.map((s) => [s.t, s.torque * 100]), tone: 'ignition' }]}
            valueFormat={(v) => `${v.toFixed(0)} %`}
          />
        </div>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            {[
              [tc, setTc, 'Traction control'],
              [wet, setWet, 'Wet road'],
            ].map(([on, set, label]) => (
              <button key={label as string} type="button" role="switch" aria-checked={on as boolean} onClick={() => (set as (v: boolean) => void)(!on)} className={cn('h-8 rounded-lg border px-3 text-sm', on ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                {label as string} {on ? 'ON' : 'OFF'}
              </button>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Peak rear-wheel slip" value={`${Math.round(maxSlip * 100)} %`} tone={maxSlip > 0.3 ? 'danger' : 'ok'} />
            <Readout label="Average slip" value={`${Math.round(meanSlip * 100)} %`} />
            <Readout label="Speed after 2.5 s" value={`${(run.speed * 3.6).toFixed(0)} km/h`} />
            <Readout label={tc ? 'Without TC' : 'With TC'} value={`${(other.speed * 3.6).toFixed(0)} km/h`} />
          </dl>
        </>
      }
      status={
        tc
          ? `Traction control holds rear-wheel slip near ${Math.round(meanSlip * 100)} % by trimming torque whenever the wheel starts to spin. The tyre stays close to its peak grip — so it accelerates at least as well (${(run.speed * 3.6).toFixed(0)} km/h vs ${(other.speed * 3.6).toFixed(0)} km/h after 2.5 s) and, crucially, keeps its sideways grip.`
          : `Without traction control the rear wheel spins up to the rev limiter — slip peaks at ${Math.round(maxSlip * 100)} %. A spinning tyre has lost most of its sideways grip: if the motorcycle is even slightly leaned, the rear steps out. On a small commuter motorcycle the same lesson applies to a snapped throttle on a wet road: roll it on smoothly.`
      }
    />
  )
}
