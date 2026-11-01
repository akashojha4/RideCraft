import { useMemo, useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { LineChart } from '@/components/charts/LineChart'
import { Readout } from '@/components/simulation/Readouts'
import { cn } from '@/lib/cn'
import { GRIP } from '@/lib/mechanics/braking'
import { brakeStop } from '@/lib/mechanics/tyre'

/*
 * Mechanics lesson 12: what ABS does, in the first second and a half of a full-force stop
 * from 50 km/h (wheel-slip model, tyre.ts). Without ABS the wheel speed collapses to zero
 * within a fraction of a second: the tyre slides at its lower, locked grip and can't
 * steer. With ABS, sensors see the wheel slowing far faster than the motorcycle could,
 * the modulator releases pressure, the wheel spins back up, and pressure is re-applied —
 * keeping the tyre near its peak grip, around 12 % slip.
 */

const V0 = 50 / 3.6
const WINDOW = 1.5

export default function AbsCycle() {
  const [abs, setAbs] = useState(true)
  const [wet, setWet] = useState(false)
  const peak = wet ? GRIP.wet : GRIP.dry
  const run = useMemo(() => brakeStop(V0, peak, abs), [peak, abs])
  const other = useMemo(() => brakeStop(V0, peak, !abs), [peak, abs])
  const win = run.samples.filter((s) => s.t <= WINDOW)
  const releases = win.reduce((n, s, i) => (i > 0 && s.torque < win[i - 1].torque - 0.001 && !(win[i - 1].torque < win[Math.max(0, i - 2)].torque - 0.001) ? n + 1 : n), 0)

  return (
    <DiagramFrame
      stage={
        <div className="grid gap-4 sm:grid-cols-2">
          <LineChart
            label={`Road speed and wheel speed during a full-force stop ${abs ? 'with' : 'without'} ABS`}
            height={200}
            x={{ min: 0, max: WINDOW, ticks: [0, 0.5, 1, 1.5], label: 'time, s', format: (v) => `${v}` }}
            y={{ min: 0, max: 50, ticks: [0, 25, 50], label: 'speed, km/h' }}
            series={[
              { id: 'road', label: 'Motorcycle', points: win.map((s) => [s.t, s.v * 3.6]), tone: 'muted' },
              { id: 'wheel', label: 'Wheel', points: win.map((s) => [s.t, s.wheel * 3.6]), tone: abs ? 'coolant' : 'danger' },
            ]}
            valueFormat={(v) => `${v.toFixed(0)} km/h`}
          />
          <LineChart
            label="Brake pressure applied"
            height={200}
            x={{ min: 0, max: WINDOW, ticks: [0, 0.5, 1, 1.5], label: 'time, s', format: (v) => `${v}` }}
            y={{ min: 0, max: 100, ticks: [0, 50, 100], label: 'brake pressure, % of lever', format: (v) => `${v}` }}
            series={[{ id: 'pressure', label: 'Pressure', points: win.map((s) => [s.t, s.torque * 100]), tone: 'ignition' }]}
            valueFormat={(v) => `${v.toFixed(0)} %`}
          />
        </div>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            {[
              [abs, setAbs, 'ABS'],
              [wet, setWet, 'Wet road'],
            ].map(([on, set, label]) => (
              <button key={label as string} type="button" role="switch" aria-checked={on as boolean} onClick={() => (set as (v: boolean) => void)(!on)} className={cn('h-8 rounded-lg border px-3 text-sm', on ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                {label as string} {on ? 'ON' : 'OFF'}
              </button>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Readout label="Stopping distance" value={`${run.distance.toFixed(1)} m`} tone={abs ? 'ok' : 'danger'} />
            <Readout label={abs ? 'Without ABS' : 'With ABS'} value={`${other.distance.toFixed(1)} m`} />
            <Readout label="Peak wheel slip" value={`${Math.round(Math.min(1, Math.max(...run.samples.map((s) => s.slip))) * 100)} %`} />
            <Readout label="Pressure releases in 1.5 s" value={abs ? String(releases) : '—'} />
          </dl>
        </>
      }
      status={
        abs
          ? `With ABS the wheel speed dips and recovers over and over (${releases} release cycles in the first 1.5 s here; real systems cycle up to 15 times a second). The tyre stays near its peak grip and keeps rolling, so it can still steer — and the motorcycle stops in ${run.distance.toFixed(1)} m instead of ${other.distance.toFixed(1)} m.`
          : `Without ABS the wheel locks within ${(run.samples.find((s) => s.wheel < 0.5)?.t ?? 0).toFixed(2)} s and slides at its lower, locked grip. A sliding front tyre can’t steer or keep the motorcycle upright. Stopping distance ${run.distance.toFixed(1)} m — ABS would manage ${other.distance.toFixed(1)} m.`
      }
    />
  )
}
