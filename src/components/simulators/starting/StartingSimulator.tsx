import { Check, ChevronLeft, ChevronRight, Eye, Hand, RotateCcw, ShieldAlert, TriangleAlert } from 'lucide-react'
import { useMotionValueEvent, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Cockpit } from '@/components/mechanics/Cockpit'
import type { ControlId } from '@/components/mechanics/controls'
import { FourStrokeEngine } from '@/components/mechanics/FourStrokeEngine'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { actionLabels, assumptions, derive, diagnose, startingSteps as steps, startingTimeline as tl, VISUAL_SLOWDOWN, type ActionId } from '@/content/simulators/starting'
import { useSimulationClock } from '@/hooks/useSimulationClock'
import { cn } from '@/lib/cn'
import { strokeIndex, strokes } from '@/lib/mechanics/engine'
import { DrivetrainPanel } from './DrivetrainPanel'
import { ElectricalPanel } from './ElectricalPanel'
import { AssumptionsPanel } from '@/components/simulation/AssumptionsPanel'

type Mode = 'watch' | 'diy'
const ACTION_ORDER = steps.map((s) => s.action)
/** The fuel pump primes for about two seconds after the ignition is switched on. */
const PUMP_PRIME = 2

function Panel({ title, tone, children, className }: { title: string; tone: 'ignition' | 'coolant'; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-line bg-surface-sunken', className)} aria-label={title}>
      <h2 className={cn('border-b border-line px-4 py-2.5 font-mono text-[11px] tracking-[0.16em] uppercase', tone === 'ignition' ? 'text-ignition-400' : 'text-coolant-400')}>
        {title}
      </h2>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  )
}

export function StartingSimulator() {
  const clock = useSimulationClock()
  const [T, setT] = useState(0)
  const [mode, setMode] = useState<Mode>('watch')
  // Do-it-yourself progress: the step waiting for the rider's action, and the step currently animating.
  const [waiting, setWaiting] = useState(0)
  const [armed, setArmed] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'mistake'; text: string } | null>(null)
  // The clock's frame listener reads the latest mode and armed step through this ref.
  const gate = useRef({ mode, armed })
  useEffect(() => {
    gate.current = { mode, armed }
  }, [mode, armed])

  useMotionValueEvent(clock.time, 'change', (t) => {
    const g = gate.current
    if (g.mode === 'diy' && g.armed !== null && t >= tl.ends[g.armed]) {
      clock.time.set(tl.ends[g.armed])
      clock.pause()
      setWaiting(g.armed + 1)
      setArmed(null)
      setT(tl.ends[g.armed])
      return
    }
    if (t >= tl.total) {
      clock.time.set(tl.total)
      clock.pause()
      setT(tl.total)
      return
    }
    setT(t)
  })

  const angle = (key: keyof ReturnType<typeof tl.anglesAt>) => (t: number) => tl.anglesAt(t)[key]
  const crank = useTransform(clock.time, angle('crank'))
  const starterAngle = useTransform(clock.time, angle('starterMotor'))
  const basket = useTransform(clock.time, angle('basket'))
  const mainshaft = useTransform(clock.time, angle('mainshaft'))
  const countershaft = useTransform(clock.time, angle('countershaft'))
  const wheel = useTransform(clock.time, angle('wheel'))
  const flowOffset = useTransform(clock.time, (t) => -t * 60)

  const v = tl.valuesAt(T)
  const d = derive(v)
  const located = tl.locate(T)
  const finished = mode === 'diy' ? waiting >= steps.length : T >= tl.total
  const current = mode === 'diy' ? Math.min(armed ?? waiting, steps.length - 1) : located.index
  const step = steps[current]
  const stepProgress = Math.min(1, Math.max(0, (T - tl.starts[current]) / (tl.ends[current] - tl.starts[current])))
  const stroke = strokeIndex(tl.anglesAt(T).crank)
  const pumpOn = v.ignition > 0 && (d.running || (T >= tl.starts[0] + 0.3 && T < tl.starts[0] + 0.3 + PUMP_PRIME))

  const jump = (i: number) => {
    clock.time.set(tl.starts[i])
    setT(tl.starts[i])
  }
  const reset = () => {
    clock.reset()
    setT(0)
    setWaiting(0)
    setArmed(null)
    setFeedback(null)
  }
  const switchMode = (m: Mode) => {
    reset()
    setMode(m)
  }
  const replay = () => {
    if (mode === 'watch') {
      jump(located.index)
      clock.play()
      return
    }
    const k = armed ?? waiting - 1
    if (k < 0) return
    jump(k)
    setArmed(k)
    clock.play()
  }
  const act = (action: ActionId) => {
    if (armed !== null || waiting >= steps.length) return
    if (action === steps[waiting].action) {
      setFeedback({ tone: 'ok', text: `${actionLabels[action]} — correct.` })
      jump(waiting)
      setArmed(waiting)
      clock.play()
    } else {
      setFeedback({ tone: 'mistake', text: diagnose(action, v) })
    }
  }
  const onControl = (id: ControlId) => {
    if (mode !== 'diy') return
    const expected = steps[Math.min(waiting, steps.length - 1)]
    if (id === expected.control) return act(expected.action)
    const map: Partial<Record<ControlId, ActionId>> = {
      ignition: 'ignition',
      'right-switches': v.kill ? 'starter' : 'kill',
      'clutch-lever': v.clutch > 0.9 ? 'release-clutch' : 'clutch-in',
      'gear-lever': 'first-gear',
      throttle: 'bite',
    }
    const action = map[id]
    if (action) act(action)
    else setFeedback({ tone: 'mistake', text: `That isn’t needed now. Next: ${expected.riderAction}` })
  }

  const clutchState = d.clamp >= 0.999 ? 'Engaged' : d.clamp <= 0.001 ? 'Disengaged' : 'Slipping'

  return (
    <div className="space-y-6">
      {/* Mode and playback */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Mode" className="flex rounded-xl border border-line bg-surface-sunken p-0.5">
          {(
            [
              ['watch', 'Watch', Eye],
              ['diy', 'Do it yourself', Hand],
            ] as const
          ).map(([m, label, Icon]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => switchMode(m)}
              className={cn('flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-medium', mode === m ? 'bg-surface-overlay text-ink' : 'text-ink-subtle hover:text-ink')}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mode === 'watch' && (
            <>
              <Button size="sm" variant="ghost" aria-label="Previous step" onClick={() => jump(Math.max(0, located.index - (T - tl.starts[located.index] < 0.3 ? 1 : 0)))} leadingIcon={<ChevronLeft className="size-4" />}>
                Prev
              </Button>
              <Button size="sm" variant="ghost" aria-label="Next step" onClick={() => jump(Math.min(steps.length - 1, located.index + 1))} trailingIcon={<ChevronRight className="size-4" />} disabled={located.index >= steps.length - 1}>
                Next
              </Button>
            </>
          )}
          <Button size="sm" variant="secondary" onClick={replay} leadingIcon={<RotateCcw className="size-4" />} disabled={mode === 'diy' && armed === null && waiting === 0}>
            Replay step
          </Button>
          <PlaybackControls clock={clock} onReset={reset} showPlay={mode === 'watch'} />
        </div>
      </div>

      {/* Step timeline */}
      <ol aria-label="Steps" className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
        {steps.map((s, i) => {
          const done = mode === 'diy' ? i < waiting && armed !== i : T >= tl.ends[i]
          const isCurrent = i === current && !finished
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => mode === 'watch' && jump(i)}
                disabled={mode === 'diy'}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex h-full w-full flex-col gap-1 rounded-lg border p-2 text-left transition-colors disabled:cursor-default',
                  isCurrent ? 'border-ignition-500/60 bg-ignition-950/60' : done ? 'border-ok-500/30 bg-ok-950/40' : 'border-line bg-surface',
                )}
              >
                <span className="flex items-center gap-1 font-mono text-[10px] text-ink-subtle">
                  {done ? <Check className="size-3 text-ok-400" aria-hidden /> : i + 1}
                </span>
                <span className="text-[11px] leading-tight text-ink-muted">{s.title}</span>
              </button>
            </li>
          )
        })}
      </ol>

      {/* B. Internal mechanical perspective — the centrepiece, full width */}
      <Panel title={`Inside the motorcycle · shown ${VISUAL_SLOWDOWN}× slower`} tone="coolant">
        <div className="grid gap-3 sm:grid-cols-[1fr_1.1fr_1.4fr] sm:items-center">
          <ElectricalPanel
            voltage={v.voltage}
            current={v.current}
            relayClosed={v.starter > 0 && v.ignition > 0 && v.kill > 0}
            pumpOn={pumpOn}
            charging={d.charging}
            starterAngle={starterAngle}
            flowOffset={flowOffset}
          />
          <div>
            <FourStrokeEngine crankAngle={crank} stroke={stroke} className="mx-auto max-h-80" />
            <p className="text-center text-xs text-ink-muted">
              {d.running ? `${strokes[stroke].name} stroke` : d.cranking ? `Cranking · ${strokes[stroke].name.toLowerCase()} stroke` : 'Engine stopped'}
            </p>
          </div>
          <DrivetrainPanel clamp={d.clamp} gear={v.gear} angles={{ basket, mainshaft, countershaft, wheel }} />
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3">
          <Readout label="Battery" value={`${v.voltage.toFixed(1)} V`} tone={d.charging ? 'ok' : v.voltage < 11 ? 'caution' : 'ink'} />
          <Readout label="Starter current" value={`${Math.round(v.current)} A`} tone={v.current > 50 ? 'caution' : 'ink'} />
          <Readout label="Clutch" value={clutchState} tone={clutchState === 'Slipping' ? 'caution' : 'ink'} />
        </dl>
      </Panel>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* A. Rider perspective */}
        <Panel title="Rider’s view" tone="ignition">
          <Cockpit
            active={finished ? null : step.control}
            onSelect={mode === 'diy' ? onControl : undefined}
            state={{
              ignition: v.ignition > 0,
              kill: v.kill ? 'run' : 'off',
              clutch: v.clutch,
              throttle: v.throttle,
              starter: v.starter > 0,
              gear: v.gear,
              rpm: v.rpm,
              speed: v.speed,
              lights: { neutral: d.neutralLight, oil: d.oilLight, charge: d.chargeLight, engine: d.engineLight },
            }}
          />
          <dl className="mt-3 grid grid-cols-3 gap-3">
            <Readout label="Engine" value={`${Math.round(v.rpm).toLocaleString('en')} RPM`} tone={d.running ? 'coolant' : 'ink'} />
            <Readout label="Speed" value={`${v.speed.toFixed(1)} km/h`} />
            <Readout label="Gear" value={v.gear ? '1st' : 'Neutral'} tone={v.gear ? 'coolant' : 'ok'} />
          </dl>
        </Panel>

        {/* C. Instruction panel */}
        <section aria-label="Instructions" aria-live="polite" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          {finished ? (
            <div className="space-y-2">
              <p className="font-mono text-xs tracking-[0.16em] text-ok-400 uppercase">Sequence complete</p>
              <h2 className="text-2xl font-semibold text-ink">You’re moving in first gear</h2>
              <p className="text-ink-muted">
                From key off to riding away: ignition, kill switch, clutch, starter, idle, first gear, biting point, clutch fully out. Replay any step,
                try it yourself, or reset to start again.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs tracking-[0.16em] text-ignition-400 uppercase">
                    Step {current + 1} of {steps.length}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-ink">{step.title}</h2>
                </div>
                <ProgressBar value={stepProgress * 100} label="Step progress" className="mt-3 w-32" />
              </div>

              {mode === 'diy' && (
                <div className="space-y-3 rounded-xl border border-line bg-surface-sunken p-4">
                  <p className="text-sm text-ink-muted">
                    {armed !== null ? 'Watch what happens…' : 'Your move: choose the next action, or click the control in the rider’s view.'}
                  </p>
                  <div role="group" aria-label="Rider actions" className="flex flex-wrap gap-1.5">
                    {ACTION_ORDER.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => act(a)}
                        disabled={armed !== null}
                        className="h-8 rounded-lg border border-line px-3 text-xs text-ink-muted transition-colors hover:border-ignition-500/60 hover:text-ink disabled:opacity-40"
                      >
                        {actionLabels[a]}
                      </button>
                    ))}
                  </div>
                  {feedback && (
                    <p className={cn('flex items-start gap-2 text-sm', feedback.tone === 'ok' ? 'text-ok-400' : 'text-caution-400')}>
                      {feedback.tone === 'ok' ? <Check className="mt-0.5 size-4 shrink-0" aria-hidden /> : <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />}
                      {feedback.text}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-ignition-300">Rider action</h3>
                    <p className="leading-relaxed text-ink">{step.riderAction}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-coolant-300">What happens inside</h3>
                    <p className="leading-relaxed text-ink-muted">{step.mechanical}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-ink">Why it’s necessary</h3>
                    <p className="leading-relaxed text-ink-muted">{step.why}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-caution-400">Common mistakes</h3>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted marker:text-caution-400">
                      {step.mistakes.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-950/50 p-3 text-sm text-ink-muted">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger-400" aria-hidden />
                    <span>
                      <span className="font-semibold text-danger-400">Safety: </span>
                      {step.safety}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      <AssumptionsPanel assumptions={assumptions} />
    </div>
  )
}
