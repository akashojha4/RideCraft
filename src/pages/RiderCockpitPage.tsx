import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, CircleAlert, Compass, Eye, GraduationCap, Info, Keyboard, PartyPopper, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { NO_HIGHLIGHT, crossHighlight } from '@/components/cockpit/crossView'
import { InsideTheMachine } from '@/components/cockpit/machine/InsideTheMachine'
import { MachineSummary } from '@/components/cockpit/machine/MachineSummary'
import { ModeSwitcher, type CockpitMode } from '@/components/cockpit/ModeSwitcher'
import { RiderCockpit } from '@/components/cockpit/RiderCockpit'
import { roadSceneFor } from '@/components/cockpit/roadScene'
import { RoadPreview } from '@/components/cockpit/road/RoadPreview'
import { ScenarioCard } from '@/components/cockpit/scenario/ScenarioCard'
import { TopDownMap } from '@/components/cockpit/road/TopDownMap'
import { GuidedSteps } from '@/components/simulation/GuidedSteps'
import { DemoDriver, type DemoHandle } from '@/components/cockpit/DemoDriver'
import { lessonForScenario } from '@/content/curriculum'
import { cockpitScenarioGroups, cockpitScenarios, getCockpitScenario, withWorld } from '@/content/scenarios/cockpit'
import { demoPlan, runScenario } from '@/content/scenarios/cockpit/run'
import type { DemoStatus } from '@/hooks/useDemoPlayer'
import type { RideNudge } from '@/lib/simulation/rideNudge'
import { useRideSounds } from '@/hooks/useRideSounds'
import type { CockpitScenario } from '@/content/scenarios/cockpit/types'
import { useGuidedMode } from '@/hooks/useGuidedMode'
import { useRidingMistakes } from '@/hooks/useRidingMistakes'
import { RoadResponseView } from '@/components/cockpit/road/RoadResponseView'
import { CauseEffectChain } from '@/components/simulation/CauseEffectChain'
import { AssumptionsPanel } from '@/components/simulation/AssumptionsPanel'
import { ExplanationPanel } from '@/components/simulation/ExplanationPanel'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useCockpitSim } from '@/hooks/useCockpitSim'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/lib/cn'
import { leverForClamp } from '@/lib/mechanics/clutch'
import { REDLINE_RPM, REVERSED_PATTERN, STANDARD_PATTERN } from '@/lib/mechanics/gearbox'
import { nextHint } from '@/lib/simulation/cockpitHints'
import { progress as progressStore } from '@/lib/progress/store'
import { guidedComplete } from '@/lib/simulation/guided'
import type { MistakeId } from '@/lib/simulation/ridingMistakes'
import type { Stage } from '@/lib/simulation/model'
import { explainPowertrain, powertrainAssumptions, powertrainChain, type PowertrainPart } from '@/lib/simulation/models/powertrain'

const FRICTION_ZONE: [number, number] = [leverForClamp(0.999), leverForClamp(0.001)]

/** Watch starts every scenario from step 1; leftover index from a longer run must not leak. */
const WATCH_IDLE = {
  index: 0,
  status: 'ready' as DemoStatus,
  done: [] as boolean[],
  nudge: { text: 'Now: watch the controls' } satisfies RideNudge,
}

const MODE_KEY = 'ridecraft:cockpit-mode'

const ASSUMPTIONS = [
  ...powertrainAssumptions,
  { id: 'suspension', text: 'Fork 14 kN/m with 110 mm of travel, rear 20 kN/m with 90 mm, both at 30 % sag; the suspension follows the load transfer directly, without damping.', effect: 'Real suspension rates, travel and damping vary widely between motorcycles.' },
  { id: 'straight', text: 'The road is straight and the motorcycle stays upright: the cockpit has no steering yet.' },
]

const HANDS_AND_FEET = [
  { control: 'Clutch lever', by: 'Left hand', where: 'Top left' },
  { control: 'Throttle (twist grip)', by: 'Right hand', where: 'Top right' },
  { control: 'Front brake lever', by: 'Right hand', where: 'Top right' },
  { control: 'Starter button and engine stop switch', by: 'Right thumb', where: 'Top right' },
  { control: 'Gear lever', by: 'Left foot', where: 'Bottom left' },
  { control: 'Rear brake pedal', by: 'Right foot', where: 'Bottom right' },
]

const PATTERNS = [
  { id: 'standard', label: 'Standard 1-N-2-3-4-5', pattern: STANDARD_PATTERN, note: 'Press down for first, lift for every other gear — almost all road motorcycles.' },
  { id: 'reversed', label: 'Reversed (race) 5-4-3-2-N-1', pattern: REVERSED_PATTERN, note: 'Lift for first, press down for every other gear — used on race tracks and some motorcycles converted for racing.' },
] as const

const KEYS = [
  ['I', 'Start the engine'],
  ['A / Z', 'Clutch: hold A to pull it in further, hold Z to let it out'],
  ['↑ / ↓', 'Throttle: hold ↑ to open it further, hold ↓ to close it'],
  ['Space', 'Front brake (hold)'],
  ['S', 'Rear brake (hold)'],
  ['E / D', 'Gear lever: lift / press'],
  ['N', 'Half-shift to neutral'],
  ['Shift', 'Hold with any control key to move it slowly — for the biting point'],
  ['← / →', 'Handlebar: full lock left · straight · full lock right (U-turn)'],
  ['Enter', 'Next step of a guided scenario'],
  ['Tab', 'Move between controls; then arrows, Page Up/Down, Home/End'],
] as const

/** The keys a beginner needs most, shown beside the cockpit. */
const KEY_LEGEND = [
  ['I', 'start'],
  ['A/Z', 'clutch in/out'],
  ['↑/↓', 'throttle'],
  ['E/D', 'gear up/down'],
  ['N', 'neutral'],
  ['Space', 'front brake'],
  ['S', 'rear brake'],
  ['Shift', 'slower'],
] as const

const DETAIL_KEY = 'ridecraft:cockpit-detail'

/** Whether the learner chose to see the machine readouts in the rider view (if storage is available). */
function savedDetail() {
  try {
    return localStorage.getItem(DETAIL_KEY) === '1'
  } catch {
    return false
  }
}

const PICK = 'flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm'
const PICKED = 'border-coolant-500/60 bg-coolant-950 text-coolant-200'
const UNPICKED = 'border-line text-ink-muted hover:text-ink'

export default function RiderCockpitPage() {
  usePageTitle('Rider cockpit')
  // A lesson can link straight to a scenario or drill: ?practice=<id>&from=<lesson path>.
  const [params] = useSearchParams()
  const linked = getCockpitScenario(params.get('practice'))
  const fromRaw = params.get('from')
  const fromLesson = fromRaw && (fromRaw.startsWith('/learn/') || fromRaw.startsWith('/scenarios/')) ? fromRaw : null
  const cockpitSim = useCockpitSim(linked?.setup, linked?.world)
  const { sim, controls, road, notice, start, stop, reset, setStage, lastDownshift, signal, getWorld, worldSpec, crossing } = cockpitSim
  const [watchingDemo, setWatchingDemo] = useState(false)
  const [watchState, setWatchState] = useState<{ index: number; status: DemoStatus; done: readonly boolean[]; nudge: RideNudge }>(WATCH_IDLE)
  const sound = useRideSounds(sim, { hush: watchingDemo && watchState.status === 'done' })
  const { state: s, inputs, derived: d } = sim.snapshot
  const patternId = controls.pattern === REVERSED_PATTERN ? 'reversed' : 'standard'
  const story = s.running || s.stallCause ? explainPowertrain(s, inputs, d) : { tone: 'info' as const, title: 'Engine off', text: 'Select neutral (or pull the clutch in) and press Start.', chain: [] }
  const [mode, setModeState] = useState<CockpitMode>('rider')
  const setMode = (m: CockpitMode) => {
    setModeState(m)
    try {
      localStorage.setItem(MODE_KEY, m)
    } catch {
      // Not remembered; the switch still works.
    }
  }
  const [pickerOpen, setPickerOpen] = useState(false)
  const [focus, setFocus] = useState<{ stage: Stage | null; parts: PowertrainPart[] }>({ stage: null, parts: [] })

  // Guided scenarios and drills: the steps run on the same simulation; mistakes are explained, not failed.
  const [scenarioId, setScenarioId] = useState(() => linked?.id ?? cockpitScenarios[0].id)
  const scenario = getCockpitScenario(scenarioId) ?? cockpitScenarios[0]
  const guide = useGuidedMode(sim, withWorld(scenario.steps, getWorld), { startActive: !!linked, follow: true, autoAdvanceMs: 3500 })
  const [detail, setDetailState] = useState(savedDetail)
  const setDetail = (on: boolean) => {
    setDetailState(on)
    try {
      localStorage.setItem(DETAIL_KEY, on ? '1' : '0')
    } catch {
      // Not remembered; the toggle still works.
    }
  }
  const hintRef = useRef<HTMLDivElement>(null)
  // The running scenario's own mistakes (traffic, signals, bumps) are judged with the world in view.
  const watching = useRef<CockpitScenario | undefined>(linked)
  const worldWatch = useMemo(() => ({ watch: () => watching.current?.watch, world: getWorld }), [getWorld])
  const mistakes = useRidingMistakes(sim, worldWatch)
  const run = useRef(linked ? 1 : 0)
  const demoRef = useRef<DemoHandle>(null)
  const demoRun = useMemo(() => (scenario.demo?.length ? runScenario(scenario, demoPlan(scenario)) : null), [scenario])
  const onWatchChange = useCallback((next: { index: number; status: DemoStatus; done: readonly boolean[]; nudge: RideNudge }) => setWatchState(next), [])
  const demoDriving = useRef(false)
  useEffect(() => {
    demoDriving.current = watchingDemo
  }, [watchingDemo])

  const startGuide = (sc: CockpitScenario) => {
    setWatchingDemo(false)
    setWatchState(WATCH_IDLE)
    run.current += 1
    watching.current = sc
    setScenarioId(sc.id)
    reset(sc.setup, sc.world)
    mistakes.clear()
    guide.start(withWorld(sc.steps, getWorld))
    // Stay in the rider’s view; the learner can switch to machine or road themselves.
    // Bring the instruction and the controls into view together.
    requestAnimationFrame(() => hintRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  // The road world sees which guided step the learner is on (a traffic light waits until they move on).
  const stageNow = guide.active ? guide.progress.index : undefined
  // While a demonstration is riding, it sets the stage itself; the guide takes it back afterwards.
  const pauseGuide = guide.setPaused
  useEffect(() => {
    pauseGuide(watchingDemo)
    if (!watchingDemo) setStage(stageNow)
  }, [setStage, stageNow, watchingDemo, pauseGuide])
  const goTo = (n: number) => {
    mistakes.clear()
    guide.goTo(n)
  }
  const refusedShift = controls.shiftIsLatest && controls.shift?.moved === false && /clutch/i.test(controls.shift.note)
  const mistakeId: MistakeId | null = notice ? 'start-in-gear' : refusedShift ? 'shift-without-clutch' : (mistakes.mistake?.id ?? null)
  const mistake = guide.active && mistakeId ? scenario.mistakes.find((m) => m.id === mistakeId) : undefined
  const complete = guide.active && guidedComplete(guide.progress)
  const taught = lessonForScenario(scenario.id)

  // Record each completed run once in the learner's progress.
  const recorded = useRef(0)
  useEffect(() => {
    if (!complete || recorded.current === run.current || demoDriving.current) return
    recorded.current = run.current
    progressStore.recordPractice({ kind: 'exercise', source: 'cockpit', item: scenario.id, title: scenario.title, result: 'pass' })
  }, [complete, scenario.id, scenario.title])

  // A warning first; then the gear lever's message if that was the last thing the rider did; then what to do next.
  const freeMessage = notice ?? (controls.shiftIsLatest ? controls.shift?.note : null) ?? nextHint(s, inputs, d)
  // In a guided scenario the line under the cockpit carries the current step, so it is read where the controls are.
  const n = guide.progress.index + 1
  // A scenario can say what to do right now (e.g. waiting for the light), in place of the step text.
  const scenarioHint = guide.active ? (scenario.hint?.(s, inputs, getWorld()) ?? null) : null
  const watchCaption = scenario.demo?.[watchState.index]
  const watchTitle = guide.steps[watchState.index]?.title ?? scenario.steps[watchState.index]?.title
  const message = watchingDemo
    ? watchState.status === 'done'
      ? 'That’s how a careful rider does it. Press “Try it myself” and do the same moves.'
      : null
    : !guide.active
    ? freeMessage
    : mistake && !guide.stepDone
      ? `${mistake.title}: ${mistake.text}`
      : complete
        ? 'Scenario complete — well done.'
        : !sim.clock.playing && sim.snapshot.state.distance === 0
          ? `Paused — the scenario starts when you touch a control (or press Play). ${guide.step?.title}: ${guide.step?.instruction}`
          : guide.stepDone
            ? guide.autoNext
              ? `Step ${n} done — the next step follows in a moment (or press Enter).`
              : `Step ${n} done — press “Next step” or Enter when you’re ready.`
            : (scenarioHint ?? `Step ${n} of ${guide.steps.length} · ${guide.step?.title}: ${guide.step?.instruction}`)

  const guideParts = watchingDemo ? (scenario.steps[watchState.index]?.highlight ?? []) : guide.active ? (guide.step?.highlight ?? []) : []
  const hl = focus.parts.length ? crossHighlight(focus.parts) : guideParts.length ? crossHighlight(guideParts) : NO_HIGHLIGHT
  const chain = powertrainChain(s, inputs, d)
  const downshiftAge = sim.snapshot.t - lastDownshift.get()

  // "I" starts the engine; everything else goes to the controls.
  const keyHandlers = {
    ...controls.keyHandlers,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'i' && !e.repeat && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        start()
        return
      }
      if (e.key === 'Enter' && e.target === e.currentTarget && guide.active && guide.stepDone && !e.repeat) {
        e.preventDefault()
        if (guide.progress.index < guide.steps.length - 1) goTo(guide.progress.index + 1)
        return
      }
      controls.keyHandlers.onKeyDown(e)
    },
  }

  // The road the scenario sets: gradient and surface from the model's inputs, signal and bump from its world.
  const scene = roadSceneFor(inputs, worldSpec, signal)
  const cockpit = (
    <RiderCockpit
      values={{
        kmh: Math.max(0, d.kmh),
        rpm: d.engineRpm,
        redline: REDLINE_RPM,
        engineRunning: s.running,
        clutch: watchingDemo ? inputs.clutch : 0,
        throttle: watchingDemo ? inputs.throttle : 0,
        frontBrake: watchingDemo ? (inputs.front ?? 0) : 0,
        rearBrake: watchingDemo ? (inputs.rear ?? 0) : 0,
        gear: watchingDemo ? inputs.gear : 0,
        frictionZone: FRICTION_ZONE,
      }}
      controls={watchingDemo ? undefined : { ...controls, keyHandlers }}
      road={{ motion: road, idling: s.running && Math.abs(s.speed) < 0.3, scene }}
      engine={watchingDemo ? undefined : { running: s.running, onStart: start, onStop: stop }}
      highlight={hl.zones}
      nudge={watchingDemo && watchState.status !== 'done' ? watchState.nudge : undefined}
    />
  )
  // The instruction sits directly above the controls, so the learner reads it where they act.
  const warning = !!notice || controls.shift?.moved === false || (guide.active && !!mistake && !guide.stepDone)
  const hint = (
    <div ref={hintRef} className="flex scroll-mt-20 flex-wrap items-center justify-between gap-3">
      <div
        aria-live="polite"
        data-hint
        data-watch-status={watchingDemo ? watchState.status : undefined}
        data-watch-step={watchingDemo ? watchState.index : undefined}
        data-watch-done={watchingDemo ? watchState.done.map((x) => (x ? 1 : 0)).join('') : undefined}
        className={cn(
          'min-h-5 flex-1 text-sm',
          (guide.active || watchingDemo) && 'rounded-xl border px-4 py-3 text-base',
          (guide.active || watchingDemo) && (watchingDemo ? 'border-coolant-500/40 bg-coolant-950/40 text-ink' : warning ? 'border-caution-500/40 bg-caution-950/30' : guide.stepDone ? 'border-ok-500/30 bg-ok-950/30 text-ink' : 'border-coolant-500/40 bg-coolant-950/40 text-ink'),
          warning && !watchingDemo ? 'text-caution-400' : !guide.active && !watchingDemo && 'text-ink-muted',
        )}
      >
        {watchingDemo && watchState.status !== 'done' ? (
          <p className="text-sm text-ink-muted">
            Step {watchState.index + 1} of {scenario.steps.length} · {watchTitle}
            {watchCaption?.watch ? `. ${watchCaption.watch}` : ''}
          </p>
        ) : (
          (message ?? 'Ride as you like — or point at a stage below to see where it happens.')
        )}
      </div>
      {guide.active && !!scenario.demo?.length &&
        (watchingDemo ? (
          <>
            <button
              type="button"
              onClick={() => (watchState.status === 'playing' ? demoRef.current?.pause() : watchState.status === 'done' ? demoRef.current?.replay() : demoRef.current?.play())}
              className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-sm text-ink"
            >
              {watchState.status === 'playing' ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              {watchState.status === 'playing' ? 'Pause' : watchState.status === 'done' ? 'Watch again' : 'Resume'}
            </button>
            <button
              type="button"
              onClick={() => startGuide(scenario)}
              data-try-scenario
              className="flex min-h-11 items-center gap-1.5 rounded-xl bg-ignition-500 px-3 text-sm font-medium text-bg hover:bg-ignition-400"
            >
              Try it myself
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setWatchState(WATCH_IDLE)
              setWatchingDemo(true)
            }}
            data-watch-demo
            className="flex min-h-11 items-center gap-1.5 rounded-xl border border-coolant-500/50 bg-coolant-950 px-3 text-sm font-medium text-coolant-200 hover:border-coolant-400"
          >
            <Eye className="size-4" aria-hidden /> Watch how it’s done
          </button>
        ))}
      <button
        type="button"
        aria-pressed={!sound.muted}
        data-audio={sound.muted ? 'muted' : sound.audible ? 'on' : 'off'}
        onClick={() => sound.setMuted(!sound.muted)}
        title={sound.muted ? 'Sound is off' : 'Sound is on'}
        className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm text-ink-muted hover:text-ink"
      >
        {sound.muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
        {sound.muted ? 'Sound off' : 'Sound on'}
      </button>
      <PlaybackControls
        showPlay={!watchingDemo}
        clock={sim.clock}
        onReset={() => {
          setWatchingDemo(false)
          setWatchState(WATCH_IDLE)
          if (guide.active) reset(scenario.setup, scenario.world)
          else reset()
        }}
      />
    </div>
  )
  const legend = (
    <p className="hidden flex-wrap gap-x-4 gap-y-1 text-xs text-ink-subtle pointer-fine:flex" data-key-legend>
      <span className="text-ink-muted">Both hands (click the cockpit first):</span>
      {KEY_LEGEND.map(([k, what]) => (
        <span key={k}>
          <kbd className="rounded border border-line bg-surface px-1 font-mono text-ink">{k}</kbd> {what}
        </span>
      ))}
    </p>
  )
  const map = worldSpec?.pose && road.pose ? <TopDownMap pose={road.pose} steer={controls.steer} onSteer={controls.setSteer} /> : null
  const status = (
    <>
      {legend}
      {map}
    </>
  )
  const chainStrip = <CauseEffectChain chain={chain} active={focus.stage} onActiveChange={(stage, parts) => setFocus({ stage, parts })} />
  const explanation = <ExplanationPanel tone={story.tone} title={story.title} text={story.text} />
  const machineFull = <InsideTheMachine sim={sim} highlight={{ cards: hl.cards, stages: hl.stages }} />
  const machineSmall = <MachineSummary sim={sim} highlight={hl.stages} onExpand={() => setMode('machine')} />
  const roadFull = <RoadResponseView sim={sim} downshiftAge={downshiftAge} highlighted={hl.sideView} crossing={crossing} />
  const roadSmall = <RoadPreview sim={sim} downshiftAge={downshiftAge} highlighted={hl.sideView} onExpand={() => setMode('road')} crossing={crossing} />

  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Rider cockpit"
        title="Sit in the rider’s seat"
        description="The road ahead fills the view, and every control is where it is on a real motorcycle: the clutch under your left hand, the throttle and front brake under your right, the gear lever at your left foot and the rear brake at your right."
      />
      {fromLesson && (
        <Link to={fromLesson} className="inline-flex items-center gap-1.5 text-sm text-ignition-400 hover:text-ignition-300">
          <ArrowLeft className="size-4" aria-hidden /> {fromLesson.startsWith('/scenarios/') ? 'Back to the scenario' : 'Back to the lesson'}
        </Link>
      )}
      <p role="note" className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted">
        <Info className="mt-0.5 size-5 shrink-0 text-coolant-400" aria-hidden />
        <span>
          <span className="font-medium text-ink">New here? </span>
          Choose <span className="text-ink">Starting and moving off</span> below: the guide tells you what to do one step at a time and moves on as you do it.{' '}
          <span className="font-medium text-ink">On a computer, use the keyboard</span> — it is how you work more than one control at once. Your left hand holds the clutch (A, Z) and changes gear (E, D); your right hand opens the
          throttle (↑) and brakes (Space, S). A control stays where you leave it, so set the clutch, then use the throttle; hold Shift to move a control slowly. Not sure of the order? Choose a scenario and press “Watch how it’s done” — the cockpit rides it for you, with the sound of the starter, the engine, the brakes and the gear lever. On a phone, tap “Fill the screen” and turn it sideways. A simplified
          model for learning — practise real riding only with qualified instruction.
        </span>
      </p>

      <div className="space-y-3">
        {/* On a phone the list folds away behind one button, so the cockpit isn't far down the page. */}
        <button
          type="button"
          aria-expanded={pickerOpen}
          aria-controls="scenario-picker"
          onClick={() => setPickerOpen((o) => !o)}
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-line px-4 text-left text-sm text-ink sm:hidden"
        >
          <span className="min-w-0 truncate">{guide.active ? scenario.title : 'Explore freely'}</span>
          <span className="flex shrink-0 items-center gap-1 text-ink-muted">
            Scenarios ({cockpitScenarios.length}) <ChevronDown className={cn('size-4 transition-transform', pickerOpen && 'rotate-180')} aria-hidden />
          </span>
        </button>
        <div id="scenario-picker" role="group" aria-label="How to learn" className={cn('space-y-3', pickerOpen ? 'block' : 'hidden sm:block')}>
          <button
            type="button"
            aria-pressed={!guide.active}
            onClick={() => {
              // Leave a scenario's hill, surface and traffic behind as well as its steps.
              const sc = watching.current
              watching.current = undefined
              setWatchingDemo(false)
              setWatchState(WATCH_IDLE)
              guide.exit()
              setPickerOpen(false)
              if (sc && (sc.world || sc.setup.grade || (sc.setup.surface && sc.setup.surface !== 'dry'))) reset()
            }}
            className={cn(PICK, !guide.active ? PICKED : UNPICKED)}
          >
            <Compass className="size-4" aria-hidden /> Explore freely
          </button>
          {cockpitScenarioGroups.map((g) => (
            <div key={g.title}>
              <p className="text-xs font-medium tracking-wide text-ink-subtle uppercase">{g.title}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {g.ids.map((id) => getCockpitScenario(id)).filter((sc): sc is CockpitScenario => !!sc).map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    aria-pressed={guide.active && scenario.id === sc.id}
                    title={sc.summary}
                    onClick={() => {
                      setPickerOpen(false)
                      startGuide(sc)
                    }}
                    className={cn(PICK, guide.active && scenario.id === sc.id ? PICKED : UNPICKED)}
                  >
                    <GraduationCap className="size-4" aria-hidden /> {sc.title}
                    {sc.id === cockpitScenarios[0].id && !(guide.active && scenario.id === sc.id) && (
                      <span className="rounded-md bg-ignition-500 px-1.5 py-0.5 text-[11px] font-medium text-bg">Start here</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {guide.active && guide.step && (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <GuidedSteps
            steps={guide.steps}
            progress={
              watchingDemo
                ? { index: watchState.index, done: scenario.steps.map((_, i) => watchState.done[i] ?? false) }
                : guide.progress
            }
            watching={watchingDemo}
            onGoTo={goTo}
            onExit={guide.exit}
          >
            {mistake && !guide.stepDone && (
              <div role="status" data-mistake={mistake.id} className="mt-3 flex gap-2 rounded-xl border border-caution-500/40 bg-caution-950/30 p-3 text-sm leading-relaxed">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-caution-400" aria-hidden />
                <span>
                  <span className="font-medium text-ink">{mistake.title}. </span>
                  <span className="text-ink-muted">{mistake.text}</span>
                </span>
              </div>
            )}
            {complete && (
              <p role="status" data-complete className="mt-3 flex gap-2 rounded-xl border border-ok-500/30 bg-ok-950/30 p-3 text-sm text-ink">
                <PartyPopper className="mt-0.5 size-4 shrink-0 text-ok-400" aria-hidden /> {scenario.title} complete — saved to your progress.
              </p>
            )}
          </GuidedSteps>
          <div className="space-y-3">
            <ScenarioCard scenario={scenario} />
            {/* Each scenario has a lesson that teaches it; offer it unless the learner has just come from it. */}
            {taught && !fromLesson?.startsWith(taught.path) && (
              <Link to={taught.path} data-learn-link className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm hover:border-line-strong">
                <span className="flex items-center gap-2 text-ink">
                  <BookOpen className="size-4 shrink-0 text-ignition-400" aria-hidden />
                  <span>
                    <span className="text-ink-muted">Learn it first: </span>
                    {taught.lesson.title}
                    <span className="text-ink-muted"> — each control explained, and watch it done</span>
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      )}

      {watchingDemo && demoRun && (
        <DemoDriver cockpit={cockpitSim} scenario={scenario} run={demoRun} handle={demoRef} onChange={onWatchChange} />
      )}

      <ModeSwitcher mode={mode} onChange={setMode} />

      {/* One simulation, four layouts: switching only rearranges these pieces. */}
      <div data-mode={mode} className="space-y-6">
        {mode === 'rider' && (
          <>
            {/* Sized so the instruction and the whole cockpit fit on one laptop screen. */}
            <div className="mx-auto max-w-[max(42rem,calc((100svh-13rem)*16/9))] space-y-3">
              {hint}
              {cockpit}
              {status}
            </div>
            {explanation}
            {detail ? (
              <>
                {chainStrip}
                <div className="grid gap-4 lg:grid-cols-2">
                  {machineSmall}
                  {roadSmall}
                </div>
              </>
            ) : null}
            <button
              type="button"
              aria-expanded={detail}
              onClick={() => setDetail(!detail)}
              data-detail-toggle
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm text-ink-muted hover:text-ink"
            >
              <ChevronDown className={cn('size-4 transition-transform', detail && 'rotate-180')} aria-hidden />
              {detail ? 'Hide the machine readouts' : 'Show what happens inside the machine (engine, clutch, gearbox, chain)'}
            </button>
          </>
        )}
        {(mode === 'machine' || mode === 'road') && (
          <>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
              {/* The controls come first (narrow screens: above the full view); on wide screens they sit in the right-hand column. */}
              <aside aria-label="Your controls" className="min-w-0 space-y-3 lg:col-start-2 lg:row-start-1">
                {hint}
                {cockpit}
                {status}
                {mode === 'machine' ? roadSmall : machineSmall}
              </aside>
              <div className="min-w-0 lg:col-start-1 lg:row-start-1">{mode === 'machine' ? machineFull : roadFull}</div>
            </div>
            {chainStrip}
            {explanation}
          </>
        )}
        {mode === 'split' && (
          <>
            <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
              <div className="min-w-0 space-y-3">
                {hint}
                {cockpit}
                {status}
              </div>
              {roadSmall}
            </div>
            {machineSmall}
            {chainStrip}
            {explanation}
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-labelledby="cockpit-settings" className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <h2 id="cockpit-settings" className="text-lg font-semibold text-ink">
            Settings
          </h2>
          <label className="flex items-start gap-3">
            <input type="checkbox" role="switch" checked={controls.springBack} onChange={(e) => controls.setSpringBack(e.target.checked)} className="mt-1 size-4 accent-[var(--color-ignition-500)]" />
            <span>
              <span className="block text-ink">Levers spring back when released</span>
              <span className="block text-sm text-ink-muted">
                As on a real motorcycle: let go and the throttle closes, the clutch and brakes release. Best on a touch screen with several fingers. With a mouse or the keyboard, leave it off: each control stays where you leave it, so you can hold the clutch while you work the throttle.
              </span>
            </span>
          </label>
          <fieldset>
            <legend className="text-ink">Gear pattern</legend>
            <div className="mt-2 space-y-2">
              {PATTERNS.map((p) => (
                <label key={p.id} className="flex items-start gap-3">
                  <input type="radio" name="gear-pattern" checked={patternId === p.id} onChange={() => controls.setPattern(p.pattern)} className="mt-1 size-4 accent-[var(--color-coolant-500)]" />
                  <span>
                    <span className="block text-ink">{p.label}</span>
                    <span className="block text-sm text-ink-muted">{p.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>
        <section aria-labelledby="cockpit-keys" className="rounded-2xl border border-line bg-surface p-5">
          <h2 id="cockpit-keys" className="flex items-center gap-2 text-lg font-semibold text-ink">
            <Keyboard className="size-5 text-ink-muted" aria-hidden /> Keyboard
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Click or tab into the cockpit first.</p>
          <dl className="mt-3 space-y-1.5 text-sm">
            {KEYS.map(([k, what]) => (
              <div key={k} className="flex gap-3">
                <dt className="w-16 shrink-0 font-mono text-ink">{k}</dt>
                <dd className="text-ink-muted">{what}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section aria-labelledby="hands-feet" className="rounded-2xl border border-line bg-surface p-5">
        <h2 id="hands-feet" className="text-lg font-semibold text-ink">
          Which hand or foot does what
        </h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-ink-subtle">
            <tr>
              <th className="py-1.5 font-medium">Control</th>
              <th className="py-1.5 font-medium">Operated by</th>
              <th className="py-1.5 font-medium">On screen</th>
            </tr>
          </thead>
          <tbody className="text-ink-muted">
            {HANDS_AND_FEET.map((r) => (
              <tr key={r.control} className="border-t border-line">
                <td className="py-1.5 text-ink">{r.control}</td>
                <td className="py-1.5">{r.by}</td>
                <td className="py-1.5">{r.where}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm text-ink-subtle">This is the conventional layout of a geared motorcycle. Some motorcycles differ — check your own owner’s manual.</p>
      </section>

      <AssumptionsPanel assumptions={ASSUMPTIONS} />
    </Container>
  )
}
