import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, CircleAlert, Compass, GraduationCap, Info, Keyboard, PartyPopper } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
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
import { lessonForScenario } from '@/content/curriculum'
import { cockpitScenarioGroups, cockpitScenarios, getCockpitScenario, withWorld } from '@/content/scenarios/cockpit'
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

const MODE_KEY = 'ridecraft:cockpit-mode'
const MODE_IDS: readonly CockpitMode[] = ['rider', 'machine', 'road', 'split']

/** The learner's last view mode, remembered on this device (if storage is available). */
function savedMode(): CockpitMode {
  try {
    const m = localStorage.getItem(MODE_KEY) as CockpitMode | null
    if (m && MODE_IDS.includes(m)) return m
  } catch {
    // Storage blocked: start in the rider view.
  }
  return 'rider'
}

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
  ['A / Z', 'Pull in / let out the clutch (hold)'],
  ['↑ / ↓', 'Open / close the throttle (hold)'],
  ['Space', 'Front brake (hold)'],
  ['S', 'Rear brake (hold)'],
  ['E / D', 'Gear lever: lift / press'],
  ['N', 'Half-shift to neutral'],
  ['← / →', 'Handlebar: full lock left · straight · full lock right (U-turn)'],
  ['Tab', 'Move between controls; then arrows, Page Up/Down, Home/End'],
] as const

const PICK = 'flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm'
const PICKED = 'border-coolant-500/60 bg-coolant-950 text-coolant-200'
const UNPICKED = 'border-line text-ink-muted hover:text-ink'

export default function RiderCockpitPage() {
  usePageTitle('Rider cockpit')
  // A lesson can link straight to a scenario or drill: ?practice=<id>&from=<lesson path>.
  const [params] = useSearchParams()
  const linked = getCockpitScenario(params.get('practice'))
  const fromLesson = params.get('from')?.startsWith('/learn/') ? params.get('from') : null
  const { sim, controls, road, notice, start, stop, reset, setStage, lastDownshift, signal, getWorld, worldSpec, crossing } = useCockpitSim(linked?.setup, linked?.world)
  const { state: s, inputs, derived: d } = sim.snapshot
  const patternId = controls.pattern === REVERSED_PATTERN ? 'reversed' : 'standard'
  const story = s.running || s.stallCause ? explainPowertrain(s, inputs, d) : { tone: 'info' as const, title: 'Engine off', text: 'Select neutral (or pull the clutch in) and press Start.', chain: [] }
  const [mode, setModeState] = useState<CockpitMode>(() => linked?.view ?? savedMode())
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
  const guide = useGuidedMode(sim, withWorld(scenario.steps, getWorld), { startActive: !!linked })
  // The running scenario's own mistakes (traffic, signals, bumps) are judged with the world in view.
  const watching = useRef<CockpitScenario | undefined>(linked)
  const worldWatch = useMemo(() => ({ watch: () => watching.current?.watch, world: getWorld }), [getWorld])
  const mistakes = useRidingMistakes(sim, worldWatch)
  const run = useRef(linked ? 1 : 0)
  const startGuide = (sc: CockpitScenario) => {
    run.current += 1
    watching.current = sc
    setScenarioId(sc.id)
    reset(sc.setup, sc.world)
    mistakes.clear()
    guide.start(withWorld(sc.steps, getWorld))
    setMode(sc.view)
  }
  // The road world sees which guided step the learner is on (a traffic light waits until they move on).
  const stageNow = guide.active ? guide.progress.index : undefined
  useEffect(() => setStage(stageNow), [setStage, stageNow])
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
    if (!complete || recorded.current === run.current) return
    recorded.current = run.current
    progressStore.recordPractice({ kind: 'exercise', source: 'cockpit', item: scenario.id, title: scenario.title, result: 'pass' })
  }, [complete, scenario.id, scenario.title])

  // A warning first; then the gear lever's message if that was the last thing the rider did; then what to do next.
  const freeMessage = notice ?? (controls.shiftIsLatest ? controls.shift?.note : null) ?? nextHint(s, inputs, d)
  // In a guided scenario the line under the cockpit carries the current step, so it is read where the controls are.
  const n = guide.progress.index + 1
  // A scenario can say what to do right now (e.g. waiting for the light), in place of the step text.
  const scenarioHint = guide.active ? (scenario.hint?.(s, inputs, getWorld()) ?? null) : null
  const message = !guide.active
    ? freeMessage
    : mistake && !guide.stepDone
      ? `${mistake.title}: ${mistake.text}`
      : complete
        ? 'Scenario complete — well done.'
        : !sim.clock.playing && sim.snapshot.state.distance === 0
          ? `Paused — the scenario starts when you touch a control (or press Play). ${guide.step?.title}: ${guide.step?.instruction}`
          : guide.stepDone
            ? `Step ${n} done — press “Next step” above when you’re ready.`
            : (scenarioHint ?? `Step ${n} of ${guide.steps.length} · ${guide.step?.title}: ${guide.step?.instruction}`)

  const guideParts = guide.active ? (guide.step?.highlight ?? []) : []
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
      controls.keyHandlers.onKeyDown(e)
    },
  }

  // The road the scenario sets: gradient and surface from the model's inputs, signal and bump from its world.
  const scene = roadSceneFor(inputs, worldSpec, signal)
  const cockpit = (
    <RiderCockpit
      values={{ kmh: Math.max(0, d.kmh), rpm: d.engineRpm, redline: REDLINE_RPM, engineRunning: s.running, clutch: 0, throttle: 0, frontBrake: 0, rearBrake: 0, gear: 0, frictionZone: FRICTION_ZONE }}
      controls={{ ...controls, keyHandlers }}
      road={{ motion: road, idling: s.running && Math.abs(s.speed) < 0.3, scene }}
      engine={{ running: s.running, onStart: start, onStop: stop }}
      highlight={hl.zones}
    />
  )
  const status = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" data-hint className={cn('min-h-5 text-sm', notice || controls.shift?.moved === false ? 'text-caution-400' : 'text-ink-muted')}>
          {message ?? 'Ride as you like — or point at a stage below to see where it happens.'}
        </p>
        <PlaybackControls clock={sim.clock} onReset={() => (guide.active ? reset(scenario.setup, scenario.world) : reset())} />
      </div>
      {worldSpec?.pose && road.pose && <TopDownMap pose={road.pose} steer={controls.steer} onSteer={controls.setSteer} />}
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
          <ArrowLeft className="size-4" aria-hidden /> Back to the lesson
        </Link>
      )}
      <p role="note" className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted">
        <Info className="mt-0.5 size-5 shrink-0 text-coolant-400" aria-hidden />
        <span>
          Your controls drive the motorcycle, and three perspectives follow them live: the rider’s view, Inside the Machine and Road Response. Explore freely, or choose a guided scenario. Switch views at any time — the ride
          carries on. A simplified model for learning: practise real riding only with qualified instruction.
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
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {guide.active && guide.step && (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <GuidedSteps steps={guide.steps} progress={guide.progress} onGoTo={goTo} onExit={guide.exit}>
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

      <ModeSwitcher mode={mode} onChange={setMode} />

      {/* One simulation, four layouts: switching only rearranges these pieces. */}
      <div data-mode={mode} className="space-y-6">
        {mode === 'rider' && (
          <>
            {cockpit}
            {status}
            {chainStrip}
            {explanation}
            <div className="grid gap-4 lg:grid-cols-2">
              {machineSmall}
              {roadSmall}
            </div>
          </>
        )}
        {(mode === 'machine' || mode === 'road') && (
          <>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
              {/* The controls come first (narrow screens: above the full view); on wide screens they sit in the right-hand column. */}
              <aside aria-label="Your controls" className="min-w-0 space-y-3 lg:col-start-2 lg:row-start-1">
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
              <span className="block text-sm text-ink-muted">As on a real motorcycle. Best with the keyboard or several fingers on a touch screen; with a mouse, leave it off so each control stays where you leave it.</span>
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
