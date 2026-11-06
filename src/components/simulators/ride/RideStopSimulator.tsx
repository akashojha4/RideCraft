import { Power } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ExerciseBar } from '@/components/simulation/ExerciseBar'
import { CauseEffectChain } from '@/components/simulation/CauseEffectChain'
import { ExplanationPanel } from '@/components/simulation/ExplanationPanel'
import { GearLever } from '@/components/simulation/GearLever'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { SimCard } from '@/components/simulation/SimCard'
import { TopicCards } from '@/components/simulation/TopicCards'
import { DualTach } from '@/components/simulators/clutch/DualTach'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { assumptions, exerciseProgress, exercises, explainRide, gradeAt, leadAt, topics, type RideExercise } from '@/content/simulators/rideStop'
import { useExercises } from '@/hooks/useExercises'
import { useGearLever } from '@/hooks/useGearLever'
import { usePowertrainSim, VISUAL_SLOWDOWN } from '@/hooks/usePowertrainSim'
import { cn } from '@/lib/cn'
import { G, GRIP, WHEELBASE, frontShare } from '@/lib/mechanics/braking'
import { clampingForce } from '@/lib/mechanics/clutch'
import { canRestart, drivelineSpeed, radToRpm, type PowertrainInputs } from '@/lib/mechanics/powertrain'
import { BrakingView } from './BrakingView'
import { RoadView, type Skid } from './RoadView'
import { SpeedChart } from './SpeedChart'
import { StoppingDistances } from './StoppingDistances'
import { TyreGrip } from './TyreGrip'
import { AssumptionsPanel } from '@/components/simulation/AssumptionsPanel'
import type { Stage } from '@/lib/simulation/model'
import { powertrainChain, sideViewParts, type PowertrainPart } from '@/lib/simulation/models/powertrain'

const FREE_RIDE: PowertrainInputs = { gear: 0, clutch: 0, throttle: 0, brake: 0, grade: 0, front: 0, rear: 0, abs: false, cbs: false, grip: GRIP.dry }
const GEAR_NAME = ['Neutral', '1st', '2nd', '3rd', '4th', '5th']
/** Motorcycle and rider, kg (as in the powertrain model). */
const WEIGHT = 225 * G
const pct = (x = 0) => `${Math.round(x * 100)} %`

export function RideStopSimulator() {
  const sim = usePowertrainSim(FREE_RIDE)
  const { state: s, inputs, t, history } = sim.snapshot
  const { active, verdict, start, freeRide, reset, startedAt, progress } = useExercises<RideExercise>(sim, FREE_RIDE, 'ride-and-stop')
  const gearLever = useGearLever(sim)
  const [skids, setSkids] = useState<Skid[]>([])
  const course = active?.course
  const exerciseTime = t - startedAt

  const engineRpm = Math.max(0, radToRpm(s.engine))
  const wheelSideRpm = Math.max(0, radToRpm(drivelineSpeed(s.speed, inputs.gear)))
  const slipping = s.running && inputs.gear > 0 && !s.locked && clampingForce(inputs.clutch) > 0
  const speedKmh = Math.abs(s.speed) < 0.003 ? 0 : s.speed * 3.6
  const decel = -s.acceleration
  const braking = (s.brakes.front.force > 1 || s.brakes.rear.force > 1) && s.speed > 0.3

  // The road climbs under the motorcycle where the course has a hill.
  const { onStep, setInputs, inputs: inputsRef } = sim
  useEffect(() => {
    const hill = active?.course?.hill
    if (!hill) return
    return onStep((st) => {
      const g = gradeAt(hill, st.distance)
      if (Math.abs(g - inputsRef.current.grade) > 0.001 || (g === hill.grade && inputsRef.current.grade !== g)) setInputs({ grade: g })
    })
  }, [active, onStep, setInputs, inputsRef])

  // Skid marks wherever a wheel slid while locked.
  const open = useRef<{ front: number | null; rear: number | null }>({ front: null, rear: null })
  useEffect(
    () =>
      onStep((st) => {
        for (const wheel of ['front', 'rear'] as const) {
          const at = wheel === 'front' ? st.distance : st.distance - WHEELBASE
          const index = open.current[wheel]
          if (st.brakes[wheel].locked) {
            if (index === null) {
              setSkids((k) => {
                open.current[wheel] = k.length
                return [...k, { wheel, from: at, to: at }]
              })
            } else setSkids((k) => k.map((sk, i) => (i === index ? { ...sk, to: at } : sk)))
          } else if (index !== null) open.current[wheel] = null
        }
      }),
    [onStep],
  )
  const clearSkids = () => {
    open.current = { front: null, rear: null }
    setSkids([])
  }

  const startExercise = (ex: RideExercise) => {
    clearSkids()
    gearLever.setNotice(null)
    start(ex)
  }
  const goFree = () => {
    clearSkids()
    gearLever.setNotice(null)
    freeRide()
  }
  const resetAll = () => {
    clearSkids()
    reset()
  }
  const restart = () => {
    if (!canRestart(inputs)) return gearLever.setNotice({ text: 'To restart, select neutral or pull the clutch in fully.', warn: true })
    gearLever.setNotice(null)
    sim.restart()
  }

  const lead = course?.lead ? leadAt(course.lead, exerciseTime) : null
  const leadBraking = course?.lead && lead ? lead.speed < leadAt(course.lead, exerciseTime - 0.1).speed - 0.01 : false
  const story = explainRide(s, inputs)
  const [focus, setFocus] = useState<{ stage: Stage | null; parts: PowertrainPart[] }>({ stage: null, parts: [] })
  const chain = powertrainChain(s, inputs, sim.snapshot.derived)
  const focusParts = focus.parts.length ? sideViewParts(focus.parts) : null
  const live = active && progress ? exerciseProgress(active, progress, s) : null
  const share = frontShare(s.loadAccel)

  return (
    <div className="space-y-6">
      <ExerciseBar
        exercises={exercises}
        active={active}
        verdict={verdict}
        onStart={startExercise}
        onFreeRide={goFree}
        extra={live && <p className="tabular font-mono text-sm text-coolant-300" data-live>{live}</p>}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="space-y-4">
          <SimCard title="The road">
            <RoadView distance={s.distance} course={course} leadPosition={lead?.position} leadBraking={leadBraking} skids={skids} />
          </SimCard>
          <SimCard title={`Load and brake forces · wheels shown ${VISUAL_SLOWDOWN}× slower`}>
            <div className="bg-blueprint rounded-xl">
              <BrakingView state={s} weight={WEIGHT} frontWheel={sim.angles.frontWheel} rearWheel={sim.angles.rearWheel} road={sim.angles.wheel} highlighted={focusParts ?? undefined} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 sm:grid-cols-4">
              <Readout label={decel >= 0 ? 'Deceleration' : 'Acceleration'} value={`${(Math.abs(s.acceleration) / G).toFixed(2)} g`} />
              <Readout label="Front / rear load" value={`${pct(share)} / ${pct(1 - share)}`} tone="coolant" />
              <Readout label="Front brake force" value={`${Math.round(s.brakes.front.force)} N`} tone={s.brakes.front.locked ? 'danger' : 'ink'} />
              <Readout label="Rear brake force" value={`${Math.round(s.brakes.rear.force)} N`} tone={s.brakes.rear.locked ? 'danger' : 'ink'} />
              <Readout label="Distance to stop" value={braking && decel > 0.3 ? `${((s.speed * s.speed) / (2 * decel)).toFixed(1)} m` : '—'} className="col-span-2" />
              <Readout label="Travelled" value={`${s.distance.toFixed(1)} m`} />
              <Readout label="Gradient" value={inputs.grade ? `${(inputs.grade * 100).toFixed(1)} %` : 'Flat'} />
            </dl>
          </SimCard>
          <CauseEffectChain chain={chain} active={focus.stage} onActiveChange={(stage, parts) => setFocus({ stage, parts })} />
          <ExplanationPanel tone={story.tone} title={story.title} text={story.text} />
          <SimCard title="Speed · last 12 s">
            <SpeedChart samples={history} now={t} band={course?.band} />
          </SimCard>
        </div>

        <div className="space-y-4">
          <SimCard title="Instruments">
            <DualTach engineRpm={engineRpm} wheelRpm={wheelSideRpm} slipping={slipping} />
            <dl className="mt-2 grid grid-cols-3 gap-3">
              <Readout label="Speed" value={`${speedKmh.toFixed(1)} km/h`} tone="coolant" />
              <Readout label="Engine" value={`${Math.round(engineRpm).toLocaleString('en')} RPM`} />
              <Readout label="Gear" value={GEAR_NAME[inputs.gear]} tone={inputs.gear ? 'ink' : 'ok'} />
            </dl>
          </SimCard>
          <SimCard title="Gear lever">
            <GearLever control={gearLever} />
          </SimCard>
          <SimCard title="Throttle, clutch and brakes">
            <div className="space-y-4">
              <Slider label="Throttle" value={Math.round(inputs.throttle * 100)} onChange={(v) => sim.setInputs({ throttle: v / 100 })} valueText={pct(inputs.throttle)} />
              <Slider label="Clutch lever (pull in)" value={Math.round(inputs.clutch * 100)} onChange={(v) => sim.setInputs({ clutch: v / 100 })} valueText={pct(inputs.clutch)} />
              <Slider label="Front brake lever" value={Math.round((inputs.front ?? 0) * 100)} onChange={(v) => sim.setInputs({ front: v / 100 })} valueText={pct(inputs.front)} hint="Right hand. Squeeze progressively." />
              <Slider label="Rear brake pedal" value={Math.round((inputs.rear ?? 0) * 100)} onChange={(v) => sim.setInputs({ rear: v / 100 })} valueText={pct(inputs.rear)} hint="Right foot." />
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant={s.running ? 'ghost' : 'primary'} onClick={restart} disabled={s.running} leadingIcon={<Power className="size-4" />}>
                  Restart engine
                </Button>
                <PlaybackControls clock={sim.clock} onReset={resetAll} />
              </div>
            </div>
          </SimCard>
          <SimCard title="Tyre grip and brake system">
            <TyreGrip state={s} />
            <div className="mt-4 space-y-2 border-t border-line pt-4">
              {(
                [
                  ['abs', 'ABS (anti-lock brakes)'],
                  ['cbs', 'CBS (pedal also applies front)'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="switch"
                  aria-checked={Boolean(inputs[key])}
                  disabled={Boolean(active)}
                  onClick={() => sim.setInputs({ [key]: !inputs[key] })}
                  className={cn('flex h-8 w-full items-center justify-between rounded-lg border px-3 text-xs disabled:opacity-40', inputs[key] ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted')}
                >
                  {label} <span className="font-mono">{inputs[key] ? 'ON' : 'OFF'}</span>
                </button>
              ))}
              <div role="group" aria-label="Road surface" className="flex gap-1.5">
                {(['dry', 'wet'] as const).map((surface) => (
                  <button
                    key={surface}
                    type="button"
                    aria-pressed={inputs.grip === GRIP[surface]}
                    disabled={Boolean(active)}
                    onClick={() => sim.setInputs({ grip: GRIP[surface] })}
                    className={cn('h-8 flex-1 rounded-lg border px-3 text-xs disabled:opacity-40', inputs.grip === GRIP[surface] ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted')}
                  >
                    {surface === 'dry' ? `Dry road · μ ${GRIP.dry}` : `Wet road · μ ${GRIP.wet}`}
                  </button>
                ))}
              </div>
              {active && <p className="text-xs text-ink-subtle">The exercise sets the brake system and the road: no ABS or CBS, dry asphalt.</p>}
            </div>
          </SimCard>
        </div>
      </div>

      <StoppingDistances />

      <TopicCards topics={topics} exercises={exercises} onStart={startExercise} onFreeRide={goFree} />

      <AssumptionsPanel assumptions={assumptions} />
    </div>
  )
}
