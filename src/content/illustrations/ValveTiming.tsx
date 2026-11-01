import { useMotionValueEvent, useTransform } from 'motion/react'
import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { LineChart } from '@/components/charts/LineChart'
import { FourStrokeEngine } from '@/components/mechanics/FourStrokeEngine'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { useSimulationClock } from '@/hooks/useSimulationClock'
import { cycleAngle, strokeIndex, strokes } from '@/lib/mechanics/engine'

/*
 * Mechanics lesson 1: real valve timing. The cutaway shows the four strokes; the chart shows
 * when the valves actually open and close on a typical small four-stroke. Valves open early
 * and close late to use the inertia of the moving gases — the intake keeps filling the
 * cylinder after the piston has passed the bottom — and around top dead centre both are
 * open at once (overlap), so the outgoing exhaust helps draw in the fresh charge.
 * Crank angle 0° = TDC at the start of intake; one cycle = 720°.
 */

const DEG_PER_SEC = 60
const MAX_LIFT = 7
const INTAKE = { open: -10, close: 220 }
const EXHAUST = { open: 500, close: 730 }
const SPARK = 340

function liftCurve(open: number, close: number): [number, number][] {
  const pts: [number, number][] = []
  for (let a = open; a <= close; a += 4) pts.push([a, MAX_LIFT * Math.sin((Math.PI * (a - open)) / (close - open)) ** 2])
  return pts
}
const liftAt = (a: number, open: number, close: number) => {
  const x = [a, a + 720, a - 720].find((v) => v >= open && v <= close)
  return x === undefined ? 0 : MAX_LIFT * Math.sin((Math.PI * (x - open)) / (close - open)) ** 2
}
const intakePts = liftCurve(INTAKE.open, INTAKE.close).map(([a, l]) => [a < 0 ? a + 720 : a, l] as [number, number])
const intakeSeries = intakePts.filter(([a]) => a < 360).sort((a, b) => a[0] - b[0])
const intakeWrap = intakePts.filter(([a]) => a >= 360).sort((a, b) => a[0] - b[0])
const exhaustPts = liftCurve(EXHAUST.open, EXHAUST.close).map(([a, l]) => [a > 720 ? a - 720 : a, l] as [number, number])
const exhaustMain = exhaustPts.filter(([a]) => a >= 360).sort((a, b) => a[0] - b[0])
const exhaustWrap = exhaustPts.filter(([a]) => a < 360).sort((a, b) => a[0] - b[0])

export default function ValveTiming() {
  const clock = useSimulationClock()
  const crank = useTransform(clock.time, (t) => t * DEG_PER_SEC)
  const [angle, setAngle] = useState(0)
  useMotionValueEvent(crank, 'change', (a) => setAngle(Math.round(cycleAngle(a))))
  const intakeLift = liftAt(angle, INTAKE.open, INTAKE.close)
  const exhaustLift = liftAt(angle, EXHAUST.open, EXHAUST.close)
  const event =
    intakeLift > 0.05 && exhaustLift > 0.05
      ? 'Overlap: both valves open — the outgoing exhaust helps pull the fresh charge in'
      : angle >= 180 && angle <= 220
        ? 'Intake still open after bottom dead centre: the moving air keeps filling the cylinder'
        : angle >= 500 && angle < 540
          ? 'Exhaust opens before bottom dead centre: pressure blows the gases out early'
          : Math.abs(angle - SPARK) < 6
            ? 'Spark: 20° before top dead centre, so peak pressure arrives just after it'
            : strokes[strokeIndex(angle)].text

  return (
    <DiagramFrame
      stage={
        <div className="grid items-center gap-4 sm:grid-cols-[2fr_3fr]">
          <FourStrokeEngine crankAngle={crank} stroke={strokeIndex(angle)} className="mx-auto max-h-72" />
          <LineChart
            label={`Valve lift against crank angle; now ${angle} degrees`}
            height={210}
            x={{ min: 0, max: 720, ticks: [0, 180, 360, 540, 720], label: 'crank angle, °', format: (v) => `${v}°` }}
            y={{ min: 0, max: 8, ticks: [0, 2, 4, 6, 8], label: 'valve lift, mm' }}
            series={[
              { id: 'intake', label: 'Intake', points: intakeSeries, tone: 'coolant' },
              { id: 'intake2', label: 'Intake ', points: intakeWrap, tone: 'coolant' },
              { id: 'exhaust', label: 'Exhaust', points: exhaustMain, tone: 'ignition' },
              { id: 'exhaust2', label: 'Exhaust ', points: exhaustWrap, tone: 'ignition' },
            ]}
            legend={false}
            directLabels={false}
            bands={[
              { from: 0, to: 180, label: 'intake' },
              { from: 360, to: 540, label: 'power', tone: 'ignition' },
            ]}
            marker={{ x: angle, label: `${angle}°` }}
            valueFormat={(v) => `${v.toFixed(1)} mm`}
          />
        </div>
      }
      controls={
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <dl className="flex flex-wrap gap-6">
              <Readout label="Crank angle" value={`${angle}°`} />
              <Readout label="Stroke" value={strokes[strokeIndex(angle)].name} tone="coolant" />
              <Readout label="Intake lift" value={`${intakeLift.toFixed(1)} mm`} />
              <Readout label="Exhaust lift" value={`${exhaustLift.toFixed(1)} mm`} />
            </dl>
            <PlaybackControls clock={clock} />
          </div>
          <p className="flex gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-coolant-400" aria-hidden /> Intake valve
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-ignition-400" aria-hidden /> Exhaust valve
            </span>
          </p>
        </>
      }
      status={`${event}. Typical timing: intake opens 10° before top dead centre and closes 40° after bottom dead centre; exhaust opens 40° before bottom dead centre and closes 10° after top dead centre. (The cutaway simplifies the valves to open exactly over their strokes.)`}
    />
  )
}
