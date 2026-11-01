import { Mountain, Power, TriangleAlert } from 'lucide-react'
import { useTransform } from 'motion/react'
import { useState } from 'react'
import { Cockpit } from '@/components/mechanics/Cockpit'
import { MotorcycleSideView } from '@/components/motorcycle/MotorcycleSideView'
import { ExerciseBar } from '@/components/simulation/ExerciseBar'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { SimCard } from '@/components/simulation/SimCard'
import { TopicCards } from '@/components/simulation/TopicCards'
import { DrivetrainPanel } from '@/components/simulators/starting/DrivetrainPanel'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { HILL_GRADE, exercises, explain, topics } from '@/content/simulators/clutchThrottle'
import { useExercises } from '@/hooks/useExercises'
import { usePowertrainSim, VISUAL_SLOWDOWN } from '@/hooks/usePowertrainSim'
import { cn } from '@/lib/cn'
import type { Exercise } from '@/lib/simulation/exercises'
import { clampingForce } from '@/lib/mechanics/clutch'
import { canRestart, clutchCapacity, drivelineSpeed, radToRpm, type PowertrainInputs } from '@/lib/mechanics/powertrain'
import { DualTach } from './DualTach'
import { StripChart } from './StripChart'

const FREE_RIDE: PowertrainInputs = { gear: 0, clutch: 0, throttle: 0, brake: 0, grade: 0 }

function clutchLabel(pull: number) {
  const c = clampingForce(pull)
  if (c === 1) return 'engaged'
  if (c === 0) return 'disengaged'
  return 'friction zone'
}

export function ClutchThrottleSimulator() {
  const sim = usePowertrainSim(FREE_RIDE)
  const { state: s, inputs, t, history } = sim.snapshot
  const { active, verdict, start, freeRide, reset } = useExercises(sim, FREE_RIDE, 'clutch-throttle')
  const [notice, setNotice] = useState<string | null>(null)
  const startExercise = (ex: Exercise) => {
    setNotice(null)
    start(ex)
  }

  const changeGear = (gear: number) => {
    if (gear === inputs.gear) return
    if (s.running && clampingForce(inputs.clutch) > 0) return setNotice('Pull the clutch in fully to change gear.')
    setNotice(null)
    sim.setInputs({ gear })
  }
  const restart = () => {
    if (!canRestart(inputs)) return setNotice('To restart, select neutral or pull the clutch in fully.')
    setNotice(null)
    sim.restart()
  }

  const engineRpm = Math.max(0, radToRpm(s.engine))
  // Avoid showing “-0.0” for tiny negative speeds.
  const speedKmh = Math.abs(s.speed) < 0.01 ? 0 : s.speed * 3.6
  const wheelRpm = Math.max(0, radToRpm(drivelineSpeed(s.speed, inputs.gear)))
  const slipping = s.running && inputs.gear > 0 && !s.locked && clampingForce(inputs.clutch) > 0
  const heat = slipping ? Math.abs(s.clutchTorque * (s.engine - drivelineSpeed(s.speed, inputs.gear))) : 0
  const story = explain(s, inputs)
  const wheelAngle = useTransform(sim.angles.wheel, (a) => -a)
  const pitch = -Math.atan(inputs.grade) * (180 / Math.PI)

  return (
    <div className="space-y-6">
      <ExerciseBar exercises={exercises} active={active} verdict={verdict} onStart={startExercise} onFreeRide={freeRide} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="space-y-4">
          <SimCard title={`The motorcycle · moving parts shown ${VISUAL_SLOWDOWN}× slower`}>
            <div className="bg-blueprint overflow-hidden rounded-xl">
              <div style={{ transform: `rotate(${pitch}deg)` }} className="origin-center transition-transform duration-500">
                <MotorcycleSideView wheelAngle={wheelAngle} highlighted={slipping ? 'clutch' : null} title="Motorcycle" />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Readout label="Speed" value={`${speedKmh.toFixed(1)} km/h`} tone={speedKmh < -0.2 ? 'danger' : 'ink'} />
              <Readout label="Gear" value={inputs.gear ? '1st' : 'Neutral'} tone={inputs.gear ? 'coolant' : 'ok'} />
              <Readout label="Road" value={inputs.grade ? `${Math.round(inputs.grade * 100)} % uphill` : 'Flat'} />
              <Readout label="Acceleration" value={`${(Math.abs(s.acceleration) < 0.05 ? 0 : s.acceleration).toFixed(1)} m/s²`} />
            </dl>
          </SimCard>
          <SimCard title="Engine vs wheel side · last 12 s">
            <StripChart samples={history} now={t} />
          </SimCard>
        </div>

        <div className="space-y-4">
          <SimCard title="Rev counter">
            <DualTach engineRpm={engineRpm} wheelRpm={wheelRpm} slipping={slipping} />
          </SimCard>
          <SimCard title="Your controls">
            <div className="space-y-5">
              <Slider label="Clutch lever (pull in)" value={Math.round(inputs.clutch * 100)} onChange={(v) => sim.setInputs({ clutch: v / 100 })} valueText={`${Math.round(inputs.clutch * 100)} % · ${clutchLabel(inputs.clutch)}`} />
              <Slider label="Throttle" value={Math.round(inputs.throttle * 100)} onChange={(v) => sim.setInputs({ throttle: v / 100 })} valueText={`${Math.round(inputs.throttle * 100)} %`} />
              <Slider label="Brake" value={Math.round(inputs.brake * 100)} onChange={(v) => sim.setInputs({ brake: v / 100 })} valueText={`${Math.round(inputs.brake * 100)} %`} />
              <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Gear" className="flex rounded-lg border border-line bg-surface p-0.5">
                  {[0, 1].map((g) => (
                    <button key={g} type="button" aria-pressed={inputs.gear === g} onClick={() => changeGear(g)} className={cn('h-8 rounded-md px-3 text-sm', inputs.gear === g ? 'bg-surface-overlay text-ink' : 'text-ink-subtle hover:text-ink')}>
                      {g ? '1st gear' : 'Neutral'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={inputs.grade > 0}
                  onClick={() => sim.setInputs({ grade: inputs.grade > 0 ? 0 : HILL_GRADE })}
                  className={cn('flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm', inputs.grade > 0 ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}
                >
                  <Mountain className="size-4" aria-hidden /> Hill
                </button>
                <Button size="sm" variant={s.running ? 'ghost' : 'primary'} onClick={restart} disabled={s.running} leadingIcon={<Power className="size-4" />}>
                  Restart engine
                </Button>
              </div>
              {notice && (
                <p className="flex items-center gap-2 text-sm text-caution-400">
                  <TriangleAlert className="size-4" aria-hidden /> {notice}
                </p>
              )}
              <PlaybackControls clock={sim.clock} onReset={reset} />
            </div>
          </SimCard>
        </div>
      </div>

      {/* What is happening */}
      <section aria-live="polite" aria-label="What is happening" className={cn('rounded-2xl border p-5', story.tone === 'danger' ? 'border-danger-500/40 bg-danger-950/40' : story.tone === 'caution' ? 'border-caution-500/40 bg-caution-950/30' : story.tone === 'ok' ? 'border-ok-500/30 bg-ok-950/30' : 'border-line bg-surface')}>
        <h2 className={cn('text-lg font-semibold', story.tone === 'danger' ? 'text-danger-400' : story.tone === 'caution' ? 'text-caution-400' : story.tone === 'ok' ? 'text-ok-400' : 'text-ink')}>{story.title}</h2>
        <p className="mt-1 leading-relaxed text-ink-muted">{story.text}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Readout label="Engine" value={`${Math.round(engineRpm).toLocaleString('en')} RPM`} tone="coolant" />
          <Readout label="Wheel side" value={`${Math.round(wheelRpm).toLocaleString('en')} RPM`} />
          <Readout label="Clutch can pass" value={`${clutchCapacity(inputs.gear ? inputs.clutch : 0).toFixed(1)} N·m`} />
          <Readout label="Clutch passing" value={`${Math.abs(s.clutchTorque).toFixed(1)} N·m`} />
          <Readout label="Slip heat" value={`${Math.round(heat)} W`} tone={heat > 500 ? 'caution' : 'ink'} />
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SimCard title="Rider’s view">
          <Cockpit
            active={null}
            state={{
              ignition: true,
              kill: 'run',
              clutch: inputs.clutch,
              throttle: inputs.throttle,
              starter: false,
              gear: inputs.gear,
              rpm: engineRpm,
              speed: Math.max(0, s.speed * 3.6),
              lights: { neutral: inputs.gear === 0, oil: !s.running, charge: !s.running, engine: false },
            }}
          />
        </SimCard>
        <SimCard title="Clutch, gearbox and rear wheel">
          <DrivetrainPanel clamp={inputs.gear ? clampingForce(inputs.clutch) : 0} gear={inputs.gear} angles={{ basket: sim.angles.basket, mainshaft: sim.angles.mainshaft, countershaft: sim.angles.countershaft, wheel: sim.angles.wheel }} />
        </SimCard>
      </div>

      <TopicCards topics={topics} exercises={exercises} onStart={startExercise} onFreeRide={freeRide} />
    </div>
  )
}
