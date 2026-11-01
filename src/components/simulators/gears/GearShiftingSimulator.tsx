import { Power } from 'lucide-react'
import { useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { MotorcycleSideView } from '@/components/motorcycle/MotorcycleSideView'
import { ExerciseBar } from '@/components/simulation/ExerciseBar'
import { GearLever } from '@/components/simulation/GearLever'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { SimCard } from '@/components/simulation/SimCard'
import { TopicCards } from '@/components/simulation/TopicCards'
import { DualTach } from '@/components/simulators/clutch/DualTach'
import { StripChart } from '@/components/simulators/clutch/StripChart'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { exercises, explainGears, topics, type ShiftRecord } from '@/content/simulators/gears'
import { useExercises } from '@/hooks/useExercises'
import { useGearLever } from '@/hooks/useGearLever'
import { usePowertrainSim, VISUAL_SLOWDOWN } from '@/hooks/usePowertrainSim'
import { cn } from '@/lib/cn'
import { clampingForce } from '@/lib/mechanics/clutch'
import { gearRatio } from '@/lib/mechanics/gearbox'
import { EFFICIENCY, canRestart, drivelineSpeed, overallRatioFor, radToRpm, type PowertrainInputs } from '@/lib/mechanics/powertrain'
import { SHIFT_DURATION } from '@/lib/simulation/autoShift'
import type { Exercise } from '@/lib/simulation/exercises'
import { GearboxView } from './GearboxView'
import { GearChooser } from './GearChooser'

const FREE_RIDE: PowertrainInputs = { gear: 0, clutch: 0, throttle: 0, brake: 0, grade: 0 }
const GEAR_NAME = ['Neutral', '1st', '2nd', '3rd', '4th', '5th']

export function GearShiftingSimulator() {
  const sim = usePowertrainSim(FREE_RIDE)
  const { state: s, inputs, t, history, busy } = sim.snapshot
  const { active, verdict, start, freeRide, reset } = useExercises(sim, FREE_RIDE, 'gears')
  const [lastShift, setLastShift] = useState<ShiftRecord | null>(null)

  const engineRpm = Math.max(0, radToRpm(s.engine))
  const wheelSideRpm = Math.max(0, radToRpm(drivelineSpeed(s.speed, inputs.gear)))
  const clamp = clampingForce(inputs.clutch)
  const slipping = s.running && inputs.gear > 0 && !s.locked && clamp > 0
  const speedKmh = Math.abs(s.speed) < 0.01 ? 0 : s.speed * 3.6

  // After a shift, record the RPM once the change is complete and the clutch has locked in the new gear.
  const pending = useRef<{ to: number; readyAt: number } | null>(null)
  const { onStep, inputs: inputsRef } = sim
  useEffect(
    () =>
      onStep((state, now) => {
        const p = pending.current
        if (!p || now < p.readyAt || !state.locked || inputsRef.current.gear !== p.to) return
        pending.current = null
        setLastShift((ls) => (ls ? { ...ls, rpmAfter: radToRpm(state.engine) } : ls))
      }),
    [onStep, inputsRef],
  )

  const gearLever = useGearLever(sim, {
    onShift: (from, to, autoClutch) => {
      const measure = to > 0 && s.running
      setLastShift({ from, to, rpmBefore: engineRpm, rpmAfter: measure ? null : 0, speedKmh })
      pending.current = measure ? { to, readyAt: sim.clock.time.get() + (autoClutch ? SHIFT_DURATION : 0) } : null
    },
  })
  const { setNotice } = gearLever

  const startExercise = (ex: Exercise) => {
    pending.current = null
    setNotice(null)
    setLastShift(null)
    start(ex)
  }
  const goFree = () => {
    setLastShift(null)
    freeRide()
  }

  const restart = () => {
    if (!canRestart(inputs)) return setNotice({ text: 'To restart, select neutral or pull the clutch in fully.', warn: true })
    setNotice(null)
    sim.restart()
  }

  const overall = overallRatioFor(inputs.gear)
  const passing = inputs.gear ? s.clutchTorque : 0
  const enginePower = (passing * s.engine) / 1000
  const wheelPower = (passing * drivelineSpeed(s.speed, inputs.gear) * EFFICIENCY) / 1000
  const story = explainGears(s, inputs, lastShift)
  const wheelAngle = useTransform(sim.angles.wheel, (a) => -a)

  return (
    <div className="space-y-6">
      <ExerciseBar exercises={exercises} active={active} verdict={verdict} onStart={startExercise} onFreeRide={goFree} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="space-y-4">
          <SimCard title={`Gearbox · moving parts shown ${VISUAL_SLOWDOWN}× slower`}>
            <GearboxView gear={inputs.gear} clamp={clamp} basket={sim.angles.basket} mainshaft={sim.angles.mainshaft} countershaft={sim.angles.countershaft} />
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 sm:grid-cols-4">
              <Readout label="Selected" value={GEAR_NAME[inputs.gear]} tone={inputs.gear ? 'coolant' : 'ok'} />
              <Readout label="Gear ratio" value={inputs.gear ? `${gearRatio(inputs.gear).toFixed(2)} : 1` : '—'} />
              <Readout label="Overall ratio" value={inputs.gear ? `${overall.toFixed(1)} : 1` : '—'} />
              <Readout label="Torque ×" value={inputs.gear ? `${(overall * EFFICIENCY).toFixed(1)}` : '—'} />
              <Readout label="Engine torque" value={`${Math.abs(passing).toFixed(1)} N·m`} />
              <Readout label="Wheel torque" value={inputs.gear ? `${Math.round(Math.abs(passing * overall * EFFICIENCY))} N·m` : '—'} tone="coolant" />
              <Readout label="Engine power" value={`${Math.max(0, enginePower).toFixed(1)} kW`} />
              <Readout label="Wheel power" value={inputs.gear ? `${Math.max(0, wheelPower).toFixed(1)} kW` : '—'} />
            </dl>
          </SimCard>
          <section aria-live="polite" aria-label="What is happening" className={cn('rounded-2xl border p-5', story.tone === 'danger' ? 'border-danger-500/40 bg-danger-950/40' : story.tone === 'caution' ? 'border-caution-500/40 bg-caution-950/30' : story.tone === 'ok' ? 'border-ok-500/30 bg-ok-950/30' : 'border-line bg-surface')}>
            <h2 className={cn('text-lg font-semibold', story.tone === 'danger' ? 'text-danger-400' : story.tone === 'caution' ? 'text-caution-400' : story.tone === 'ok' ? 'text-ok-400' : 'text-ink')}>{story.title}</h2>
            <p className="mt-1 leading-relaxed text-ink-muted">{story.text}</p>
          </section>
          <SimCard title="The motorcycle">
            <div className="bg-blueprint rounded-xl">
              <MotorcycleSideView wheelAngle={wheelAngle} highlighted={busy ? ['clutch', 'gearbox'] : slipping ? 'clutch' : null} title="Motorcycle" />
            </div>
          </SimCard>
          <SimCard title="Engine vs wheel side · last 12 s">
            <StripChart samples={history} now={t} />
          </SimCard>
        </div>

        <div className="space-y-4">
          <SimCard title="Rev counter and speed">
            <DualTach engineRpm={engineRpm} wheelRpm={wheelSideRpm} slipping={slipping} />
            <dl className="mt-2 grid grid-cols-3 gap-3">
              <Readout label="Engine" value={`${Math.round(engineRpm).toLocaleString('en')} RPM`} tone="coolant" />
              <Readout label="Speed" value={`${speedKmh.toFixed(1)} km/h`} />
              <Readout label="Wheel" value={`${Math.round((s.speed / 1.88) * 60)} RPM`} />
            </dl>
          </SimCard>
          <SimCard title="Gear lever">
            <GearLever control={gearLever} />
          </SimCard>
          <SimCard title="Clutch, throttle and brake">
            <div className="space-y-4">
              <Slider label="Clutch lever (pull in)" value={Math.round(inputs.clutch * 100)} onChange={(v) => sim.setInputs({ clutch: v / 100 })} valueText={`${Math.round(inputs.clutch * 100)} %`} />
              <Slider label="Throttle" value={Math.round(inputs.throttle * 100)} onChange={(v) => sim.setInputs({ throttle: v / 100 })} valueText={`${Math.round(inputs.throttle * 100)} %`} />
              <Slider label="Brake" value={Math.round(inputs.brake * 100)} onChange={(v) => sim.setInputs({ brake: v / 100 })} valueText={`${Math.round(inputs.brake * 100)} %`} />
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant={s.running ? 'ghost' : 'primary'} onClick={restart} disabled={s.running} leadingIcon={<Power className="size-4" />}>
                  Restart engine
                </Button>
                <PlaybackControls clock={sim.clock} onReset={reset} />
              </div>
            </div>
          </SimCard>
        </div>
      </div>


      <GearChooser />

      <TopicCards topics={topics} exercises={exercises} onStart={startExercise} onFreeRide={goFree} />
    </div>
  )
}
