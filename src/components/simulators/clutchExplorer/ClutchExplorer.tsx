import { ArrowLeftRight, CircleStop, Cog, GraduationCap, Power, TriangleAlert, Wind } from 'lucide-react'
import { useState } from 'react'
import { AssumptionsPanel } from '@/components/simulation/AssumptionsPanel'
import { CauseEffectChain } from '@/components/simulation/CauseEffectChain'
import { ExplanationPanel } from '@/components/simulation/ExplanationPanel'
import { GuidedSteps } from '@/components/simulation/GuidedSteps'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { SimCard } from '@/components/simulation/SimCard'
import { DrivetrainPanel } from '@/components/simulators/starting/DrivetrainPanel'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import {
  START,
  assumptions,
  bitingPoint,
  clutchExplorerModel,
  guidedSteps,
  sourceText,
  type DriveSource,
  type ExplorerPart,
} from '@/content/simulators/clutchExplorer'
import { useGuidedMode } from '@/hooks/useGuidedMode'
import { useSimulation } from '@/hooks/useSimulation'
import { cn } from '@/lib/cn'
import { CLUTCH, type Actuation } from '@/lib/mechanics/clutch'
import { canRestart, drivelineSpeed, initialPowertrain } from '@/lib/mechanics/powertrain'
import type { Stage } from '@/lib/simulation/model'
import { ClampCurve } from './ClampCurve'
import { ClutchMechanismView } from './ClutchMechanismView'

const PARTS = ['basket', 'hub', 'mainshaft', 'countershaft', 'wheel'] as const satisfies readonly ExplorerPart[]
const VISUAL_SLOWDOWN = 28
const GEARS = [0, 1, 2, 3]
const SOURCE_ICON: Record<DriveSource, typeof Cog> = { engine: Cog, 'engine-braking': ArrowLeftRight, momentum: Wind, stopped: CircleStop }

export function ClutchExplorer() {
  const sim = useSimulation(clutchExplorerModel, START, { parts: PARTS, visualSlowdown: VISUAL_SLOWDOWN, publishWhen: (a, b) => a.running !== b.running || a.locked !== b.locked })
  const guide = useGuidedMode(sim, guidedSteps)
  const { state: s, inputs, derived: d } = sim.snapshot
  const actuation: Actuation = inputs.actuation ?? 'cable'
  const [focus, setFocus] = useState<{ stage: Stage | null; parts: ExplorerPart[] }>({ stage: null, parts: [] })
  const [notice, setNotice] = useState<string | null>(null)

  const story = clutchExplorerModel.explain(s, inputs, d)
  const highlight = focus.parts.length ? focus.parts : guide.active ? (guide.step?.highlight ?? []) : []
  const source = sourceText[d.source]
  const SourceIcon = SOURCE_ICON[d.source]

  const changeGear = (gear: number) => {
    if (gear === inputs.gear) return
    if (s.running && d.mech.clamp > 0) return setNotice('Pull the clutch in fully to change gear.')
    setNotice(null)
    sim.setInputs({ gear })
  }
  const restart = () => {
    if (s.running) return
    if (!canRestart(inputs)) return setNotice('To restart, select neutral or pull the clutch in fully.')
    setNotice(null)
    sim.replaceState((st) => initialPowertrain({ speed: st.speed, distance: st.distance }))
  }
  const reset = () => {
    setNotice(null)
    sim.load({ ...START, actuation })
    sim.clock.play()
  }
  const rolling = () => {
    setNotice(null)
    const speed = 40 / 3.6
    sim.load({ ...START, actuation, gear: 3, throttle: 0.18 }, { speed, engine: drivelineSpeed(speed, 3), locked: true })
    sim.clock.play()
  }

  return (
    <div className="space-y-6">
      {guide.active && guide.step ? (
        <GuidedSteps steps={guidedSteps} progress={guide.progress} onGoTo={guide.goTo} onExit={guide.exit} />
      ) : (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4">
          <GraduationCap className="size-5 text-coolant-400" aria-hidden />
          <p className="min-w-0 flex-1 text-sm text-ink-muted">New to the clutch? The guide walks you through pulling in, the biting point, engaging and rolling on momentum.</p>
          <Button size="sm" onClick={() => guide.start()}>
            Start guided mode
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-start">
        <div className="min-w-0">
            <SimCard title={`Inside the clutch · movements enlarged, rotation ${VISUAL_SLOWDOWN}× slower`}>
              <div className="bg-blueprint overflow-hidden rounded-xl">
                <ClutchMechanismView mech={d.mech} actuation={actuation} basketAngle={sim.angles.basket} hubAngle={sim.angles.hub} highlight={highlight} slipping={d.slipping} basketRpm={d.basketRpm} hubRpm={d.hubRpm} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Readout label="Pushrod travel" value={`${d.mech.travel.toFixed(2)} mm`} />
                <Readout label="Clamp load" value={`${Math.round(d.mech.clampN)} N`} tone={d.mech.clamp === 1 ? 'ok' : d.mech.clamp > 0 ? 'caution' : 'ink'} />
                <Readout label="Can pass" value={`${d.capacityNm.toFixed(1)} N·m`} />
                <Readout label="Passing" value={`${Math.abs(d.passingNm).toFixed(1)} N·m`} tone="coolant" />
              </dl>
            </SimCard>
        </div>
        <div className="min-w-0 lg:sticky lg:top-20">
            <SimCard title="Your controls">
              <div className="space-y-5">
                <Slider label="Clutch lever (pull in)" value={Math.round(inputs.clutch * 100)} onChange={(v) => sim.setInputs({ clutch: v / 100 })} valueText={`${Math.round(inputs.clutch * 100)} % · ${d.mech.stage === 'friction' ? 'friction zone' : d.mech.stage}`} />
                <Slider label="Throttle" value={Math.round(inputs.throttle * 100)} onChange={(v) => sim.setInputs({ throttle: v / 100 })} valueText={`${Math.round(inputs.throttle * 100)} %`} />
                <Slider label="Brake" value={Math.round(inputs.brake * 100)} onChange={(v) => sim.setInputs({ brake: v / 100 })} valueText={`${Math.round(inputs.brake * 100)} %`} />
                <div role="group" aria-label="Gear" className="flex w-fit rounded-lg border border-line bg-surface p-0.5">
                  {GEARS.map((g) => (
                    <button key={g} type="button" aria-pressed={inputs.gear === g} onClick={() => changeGear(g)} className={cn('h-8 min-w-11 rounded-md px-3 text-sm', inputs.gear === g ? 'bg-surface-overlay text-ink' : 'text-ink-subtle hover:text-ink')}>
                      {g ? `${g}` : 'N'}
                    </button>
                  ))}
                </div>
                <fieldset>
                  <legend className="mb-1.5 text-sm text-ink-muted">Clutch type</legend>
                  <div className="flex w-fit rounded-lg border border-line bg-surface p-0.5">
                    {(['cable', 'hydraulic'] as const).map((a) => (
                      <button key={a} type="button" aria-pressed={actuation === a} onClick={() => sim.setInputs({ actuation: a })} className={cn('h-8 rounded-md px-3 text-sm capitalize', actuation === a ? 'bg-surface-overlay text-ink' : 'text-ink-subtle hover:text-ink')}>
                        {a}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-ink-subtle">
                    Freeplay {Math.round(CLUTCH.freeplay[actuation] * 100)} % · biting point about {bitingPoint(actuation)} % of lever pull
                  </p>
                </fieldset>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={rolling}>
                    Rolling at 40 km/h
                  </Button>
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

      <div className="grid gap-4 lg:grid-cols-2">
          <SimCard title="Clamp load vs lever pull">
            <ClampCurve actuation={actuation} pull={inputs.clutch} />
          </SimCard>
          <SimCard title="Engine to rear wheel">
            <div
              role="status"
              aria-label="What is turning the rear wheel"
              className={cn('mb-3 flex items-start gap-3 rounded-xl border p-3', d.source === 'engine' ? 'border-coolant-500/40 bg-coolant-950/40' : d.source === 'momentum' ? 'border-caution-500/30 bg-caution-950/20' : 'border-line bg-surface-sunken')}
            >
              <SourceIcon className="mt-0.5 size-5 shrink-0 text-ink-muted" aria-hidden />
              <div>
                <p className="font-medium text-ink">{source.title}</p>
                <p className="text-sm text-ink-muted">{source.text}</p>
              </div>
            </div>
            <div className="mx-auto max-w-md">
              <DrivetrainPanel clamp={inputs.gear ? d.mech.clamp : 0} status={!inputs.gear || d.mech.clamp === 0 ? 'Disengaged' : d.slipping ? 'Slipping' : 'Engaged'} gear={inputs.gear} angles={{ basket: sim.angles.basket, mainshaft: sim.angles.mainshaft, countershaft: sim.angles.countershaft, wheel: sim.angles.wheel }} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Readout label="Engine" value={`${Math.round(d.engineRpm).toLocaleString('en')} RPM`} tone={s.running ? 'coolant' : 'danger'} />
              <Readout label="Basket" value={`${Math.round(d.basketRpm).toLocaleString('en')} RPM`} />
              <Readout label="Hub" value={`${Math.round(d.hubRpm).toLocaleString('en')} RPM`} />
              <Readout label="Speed" value={`${d.kmh.toFixed(1)} km/h`} />
            </dl>
          </SimCard>
      </div>

      <CauseEffectChain chain={story.chain} active={focus.stage} onActiveChange={(stage, parts) => setFocus({ stage, parts })} />

      <ExplanationPanel tone={story.tone} title={story.title} text={story.text} />

      <AssumptionsPanel assumptions={assumptions} />
    </div>
  )
}
