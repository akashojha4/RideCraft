import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { RearView } from '@/components/handling/RearView'
import { TopBike } from '@/components/handling/TopBike'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { G, WHEELBASE } from '@/lib/mechanics/braking'
import { CG_HEIGHT_TURN, ROAD_LOCK, ms, steerFor } from '@/lib/mechanics/cornering'

/*
 * Handling lesson 8: why slow is hard. A motorcycle that starts to lean is caught by
 * steering towards the lean, which turns it and creates a cornering force that pushes it
 * back up. That force grows with speed squared, so the steering needed to catch a lean is
 * steer = atan(g·L·tan(lean) / v²): tiny at road speed, enormous at walking pace — and
 * beyond the steering lock below a few km/h. Meanwhile an uncaught lean grows as
 * lean(t) = lean₀·cosh(t·√(g/h)), doubling in about a third of a second.
 */

const CHART = { left: 40, right: 400, top: 14, bottom: 150 }
const MAX_STEER = 60
const SPEEDS = [2, 30] as const
const cx = (kmh: number) => CHART.left + ((kmh - SPEEDS[0]) / (SPEEDS[1] - SPEEDS[0])) * (CHART.right - CHART.left)
const cy = (steer: number) => CHART.bottom - (Math.min(steer, MAX_STEER) / MAX_STEER) * (CHART.bottom - CHART.top)

export default function SlowBalance() {
  const [kmh, setKmh] = useState(10)
  const [lean, setLean] = useState(5)
  const steer = steerFor(ms(kmh), lean)
  const beyond = steer > ROAD_LOCK
  const doubleTime = Math.acosh(2) / Math.sqrt(G / CG_HEIGHT_TURN)
  // Slowest speed at which this lean can still be caught within the steering lock.
  const minKmh = Math.sqrt((G * WHEELBASE * Math.tan((lean * Math.PI) / 180)) / Math.tan((ROAD_LOCK * Math.PI) / 180)) * 3.6
  const curve: string[] = []
  for (let k = SPEEDS[0]; k <= SPEEDS[1]; k += 0.25) curve.push(`${curve.length ? 'L' : 'M'}${cx(k).toFixed(1)},${cy(steerFor(ms(k), lean)).toFixed(1)}`)

  return (
    <DiagramFrame
      stage={
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_2fr]">
          <svg viewBox="0 0 200 200" className="w-full" role="img" aria-label={`Motorcycle leaning ${lean} degrees, front wheel steered ${Math.min(steer, ROAD_LOCK).toFixed(0)} degrees`}>
            <line x1={0} x2={110} y1={185} y2={185} strokeWidth={1.5} className="stroke-line-strong" />
            <RearView x={55} y={185} scale={95} lean={lean} />
            <TopBike x={160} y={110} scale={46} heading={0} steer={Math.min(steer, ROAD_LOCK)} />
            <DiagramLabel x={4} y={14}>Leaning</DiagramLabel>
            <DiagramLabel x={122} y={14}>Steering</DiagramLabel>
          </svg>
          <figure>
            <svg viewBox="0 0 440 180" className="w-full" role="img" aria-label={`Steering needed to catch a ${lean} degree lean: ${steer.toFixed(0)} degrees at ${kmh} km/h`}>
              {[0, 20, 40, 60].map((s) => (
                <g key={s}>
                  <line x1={CHART.left} x2={CHART.right} y1={cy(s)} y2={cy(s)} strokeWidth={1} className="stroke-line" />
                  <text x={CHART.left - 6} y={cy(s) + 3.5} textAnchor="end" className="tabular fill-ink-subtle font-mono text-[9px]">
                    {s}°
                  </text>
                </g>
              ))}
              {[5, 10, 15, 20, 25, 30].map((k) => (
                <text key={k} x={cx(k)} y={CHART.bottom + 14} textAnchor="middle" className="tabular fill-ink-subtle font-mono text-[9px]">
                  {k}
                </text>
              ))}
              <text x={CHART.right} y={CHART.bottom + 26} textAnchor="end" className="fill-ink-subtle text-[9px]">
                speed, km/h
              </text>
              <line x1={CHART.left} x2={CHART.right} y1={cy(ROAD_LOCK)} y2={cy(ROAD_LOCK)} strokeWidth={1.5} strokeDasharray="5 4" className="stroke-danger-400" />
              <text x={CHART.right} y={cy(ROAD_LOCK) - 5} textAnchor="end" className="fill-ink-muted text-[10px]">
                steering lock ({Math.round(ROAD_LOCK)}° at the road)
              </text>
              <path d={curve.join(' ')} fill="none" strokeWidth={2} className="stroke-coolant-400" />
              <circle cx={cx(kmh)} cy={cy(steer)} r={5} strokeWidth={2} className={beyond ? 'fill-danger-400 stroke-bg' : 'fill-coolant-400 stroke-bg'} />
              <text x={cx(kmh) + 8} y={cy(steer) - 6} className="tabular fill-ink font-mono text-[10px]">
                {steer > MAX_STEER ? `>${MAX_STEER}°` : `${steer.toFixed(1)}°`}
              </text>
            </svg>
            <figcaption className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="h-0.5 w-4 bg-coolant-400" aria-hidden /> Steering needed to catch a {lean}° lean
            </figcaption>
          </figure>
        </div>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Speed" value={kmh} onChange={setKmh} min={2} max={30} valueText={`${kmh} km/h`} tone="coolant" />
            <Slider label="Lean to catch" value={lean} onChange={setLean} min={2} max={10} valueText={`${lean}°`} tone="coolant" />
          </div>
          <dl className="grid grid-cols-3 gap-4">
            <Readout label="Steering needed" value={steer > MAX_STEER ? `>${MAX_STEER}°` : `${steer.toFixed(1)}°`} tone={beyond ? 'danger' : 'ink'} />
            <Readout label="Slowest catchable" value={`${minKmh.toFixed(1)} km/h`} />
            <Readout label="Lean doubles in" value={`${doubleTime.toFixed(2)} s`} />
          </dl>
        </>
      }
      status={
        beyond
          ? `At ${kmh} km/h, catching a ${lean}° lean would need ${steer > MAX_STEER ? 'more than 60°' : `${steer.toFixed(0)}°`} of steering — past the ${Math.round(ROAD_LOCK)}° lock (measured at the road). Steering alone can’t save it: keep moving with steady drive from the clutch, use the rear brake to control speed, and put a foot down when you stop.`
          : kmh < 10
            ? `At ${kmh} km/h a ${lean}° lean needs ${steer.toFixed(0)}° of handlebar — big, quick movements. And an uncaught lean doubles in ${doubleTime.toFixed(2)} s. This is why walking pace feels wobbly: keep the engine pulling gently against the rear brake, eyes up, and steer early.`
            : `At ${kmh} km/h only ${steer.toFixed(1)}° of steering catches a ${lean}° lean — the cornering force grows with speed squared, so the motorcycle feels steadier the faster it goes.`
      }
    />
  )
}
