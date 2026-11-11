import { ChevronDown, ChevronUp, Keyboard, Maximize2, Minimize2, Power, Smartphone, Square } from 'lucide-react'
import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from 'react'
import type { CockpitControls } from '@/hooks/useCockpitControls'
import type { RideNudge } from '@/lib/simulation/rideNudge'
import { cn } from '@/lib/cn'
import { GearLadder, GearSelector, RearBrakeControl } from './FootControls'
import { ClutchControl, ThrottleBrakeControl } from './HandControls'
import { MotorcycleDashboard, type DashboardValues } from './MotorcycleDashboard'
import { RoadAhead, type RoadMotion, type RoadScene } from './RoadAhead'

/*
 * The rider's seat: the road ahead fills the view, and each control sits in the corner that
 * matches where it is on a real motorcycle — left hand top-left, right hand top-right, left
 * foot bottom-left, right foot bottom-right — with the instrument cluster bottom-centre.
 * The middle of the road stays clear.
 *
 * In a narrow space (container query) the road comes first, then the cluster, then the four controls in a
 * 2 × 2 grid that keeps the same left/right and hand/foot arrangement.
 *
 * With `controls`, the controls are live: drag them, or click into the cockpit and use the
 * keyboard. Without, it is a static picture of whatever `values` say.
 */

export type CockpitZone = 'clutch' | 'throttle' | 'gear' | 'rear-brake'

/** What the cluster shows beyond the rider's own inputs (engine, speed, …). */
export type CockpitReadings = Omit<DashboardValues, 'clutch' | 'throttle' | 'frontBrake' | 'rearBrake' | 'gear'>

export interface CockpitValues extends DashboardValues {
  pattern?: readonly number[]
  frictionZone?: [number, number]
}

function Zone({
  zone,
  label,
  title,
  value,
  align = 'left',
  lit,
  nudge,
  bare,
  className,
  children,
}: {
  zone: CockpitZone
  label: string
  title: string
  value: string
  align?: 'left' | 'right'
  lit?: boolean
  nudge?: string
  /** Full screen: no card, no title — just the control drawn over the road (the value stays for screen readers). */
  bare?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <section
      data-zone={zone}
      data-lit={lit || undefined}
      aria-label={label}
      className={cn(
        'transition-shadow',
        bare ? 'rounded-2xl p-1' : 'rounded-xl border bg-bg/80 p-2 backdrop-blur-sm',
        bare ? lit && 'bg-ignition-500/10 ring-2 ring-ignition-400/80 shadow-[0_0_24px_rgb(255_106_26/0.35)]' : lit ? 'border-ignition-400 ring-2 ring-ignition-500/60' : 'border-line/70',
        className,
      )}
    >
      <header className={cn('flex flex-wrap items-baseline gap-x-2 font-mono', align === 'right' && 'flex-row-reverse text-right', bare && 'sr-only')}>
        <p className="text-xs tracking-wide text-ink">{title}</p>
        <p className="text-xs text-ink-muted" data-value={zone}>
          {value}
        </p>
      </header>
      {nudge && (
        <p className="mb-1 rounded-md bg-ignition-500/15 px-1.5 py-0.5 text-[11px] font-medium text-ignition-300" data-zone-nudge>
          {nudge}
        </p>
      )}
      {children}
    </section>
  )
}

const pct = (x: number) => `${Math.round(x * 100)} %`

/** What the first-person road shows: its motion, the bend, the lean and whether the engine idles. */
export interface CockpitRoad {
  motion?: RoadMotion
  curvature?: number
  lean?: number
  idling?: boolean
  scene?: RoadScene
}

/** The starter button and engine stop switch on the right switch block. */
export interface CockpitEngine {
  running: boolean
  onStart: () => void
  onStop: () => void
}

export function RiderCockpit({
  values,
  controls,
  road,
  engine,
  highlight = [],
  nudge,
  className,
}: {
  values: CockpitValues
  controls?: CockpitControls
  road?: CockpitRoad
  engine?: CockpitEngine
  /** Control zones to highlight (from the cause-and-effect strip). */
  highlight?: readonly CockpitZone[]
  /** A live "Now: …" line from a demonstration, shown on the control that is moving. */
  nudge?: RideNudge
  className?: string
}) {
  const v: CockpitValues = controls
    ? {
        ...values,
        clutch: controls.axes.clutch,
        throttle: controls.axes.throttle,
        frontBrake: controls.axes.front,
        rearBrake: controls.axes.rear,
        gear: controls.gear,
        pattern: controls.pattern,
      }
    : values
  const inZone = !!v.frictionZone && v.clutch >= v.frictionZone[0] && v.clutch <= v.frictionZone[1]
  const clutchText = `${pct(v.clutch)} pulled${inZone ? ' · friction zone' : ''}`
  // A full-screen view: on a phone turned sideways the road fills the screen and the controls sit
  // at its corners, so both hands can work while watching the road.
  const [expanded, setExpanded] = useState(false)
  const [portrait, setPortrait] = useState(false)
  // The keyboard works only while the cockpit has focus, so say which it is (computers only).
  const [keyboardOn, setKeyboardOn] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!expanded) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    const onChange = () => setPortrait(window.innerHeight > window.innerWidth)
    onChange()
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onChange)
    window.addEventListener('orientationchange', onChange)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onChange)
      window.removeEventListener('orientationchange', onChange)
    }
  }, [expanded])

  const blur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    setKeyboardOn(false)
    controls?.keyHandlers.onBlur()
  }

  return (
    // Sized by the space it is given (a container query), so it also works in a narrow column.
    <div className={cn('@container', expanded && 'fixed inset-0 z-50 bg-bg')}>
      <div
        ref={frameRef}
        data-cockpit
        data-keyboard={controls ? (keyboardOn ? 'on' : 'off') : undefined}
        data-expanded={expanded || undefined}
        onFocus={controls ? () => setKeyboardOn(true) : undefined}
        tabIndex={controls ? 0 : undefined}
        aria-label={
          controls ? 'Rider cockpit. Drag the controls, or use the keyboard: A and Z clutch, arrow up and down throttle, Space front brake, S rear brake, E and D gears, N neutral.' : undefined
        }
        onKeyDown={controls?.keyHandlers.onKeyDown}
        onKeyUp={controls?.keyHandlers.onKeyUp}
        onBlur={controls ? blur : undefined}
        className={cn(
          'relative overflow-hidden bg-bg outline-none @2xl:aspect-[16/9]',
          expanded ? 'cockpit-expanded h-full overflow-y-auto' : 'rounded-2xl border border-line focus-visible:ring-2 focus-visible:ring-ignition-500',
          className,
        )}
      >
        {controls && (
          <div className={cn('absolute z-20 flex flex-col items-center gap-1', expanded ? 'top-2 right-2 items-end' : 'top-2 left-1/2 -translate-x-1/2')}>
            <button
              type="button"
              onClick={() => setExpanded((on) => !on)}
              aria-pressed={expanded}
              aria-label={expanded ? 'Exit full screen' : undefined}
              data-expand-cockpit
              className={cn(
                'flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-bg/85 px-3 text-xs font-medium text-ink backdrop-blur hover:border-line-strong',
                // Full screen is also the recording view: the exit button stays small and faint until pointed at.
                expanded && 'min-w-11 justify-center border-transparent bg-bg/40 px-0 opacity-40 hover:opacity-100 focus-visible:opacity-100',
              )}
            >
              {expanded ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-3.5" aria-hidden />}
              {!expanded && 'Fill the screen'}
            </button>
            {keyboardOn ? (
              <p data-keyboard-badge className={cn('hidden items-center gap-1.5 rounded-full border border-ok-500/40 bg-bg/85 px-3 py-1 text-xs text-ok-400 backdrop-blur', !expanded && 'pointer-fine:flex')}>
                <Keyboard className="size-3.5" aria-hidden /> Keyboard on — hold A to pull the clutch in
              </p>
            ) : (
              <button
                type="button"
                data-keyboard-badge
                onClick={() => frameRef.current?.focus({ preventScroll: true })}
                className="hidden min-h-9 items-center gap-1.5 rounded-full border border-caution-500/50 bg-bg/85 px-3 text-xs font-medium text-caution-400 backdrop-blur hover:border-caution-400 pointer-fine:flex"
              >
                <Keyboard className="size-3.5" aria-hidden /> Click here to use the keyboard
              </button>
            )}
            {expanded && portrait && (
              <p className="flex items-center gap-1.5 rounded-full bg-bg/85 px-3 py-1 text-xs text-ink-muted backdrop-blur">
                <Smartphone className="size-3.5" aria-hidden /> Turn your phone sideways — the road fills the screen and the controls move to the corners.
              </p>
            )}
          </div>
        )}
        <div data-zone="road" className="relative aspect-[16/10] @2xl:absolute @2xl:inset-0 @2xl:aspect-auto">
          <RoadAhead motion={road?.motion} curvature={road?.curvature} lean={road?.lean} idling={road?.idling} scene={road?.scene} />
          {nudge && (
            <p
              data-nudge
              className="pointer-events-none absolute top-[30%] left-1/2 z-10 w-[min(90%,28rem)] -translate-x-1/2 rounded-full border border-ignition-500/40 bg-bg/80 px-4 py-2 text-center text-sm font-semibold text-ignition-300 shadow-lg backdrop-blur-sm sm:text-base"
            >
              {nudge.text}
            </p>
          )}
        </div>

        <MotorcycleDashboard values={v} className="m-2 @2xl:absolute @2xl:bottom-3 @2xl:left-1/2 @2xl:m-0 @2xl:w-[40%] @2xl:-translate-x-1/2" />

        {/* Narrow: the right hand (two controls in one drawing) and the gear lever take the full width, so every control is at least 44 px to touch. */}
        <div className={cn('grid grid-flow-row-dense grid-cols-2 gap-2 p-2 pt-0 @2xl:contents', expanded && 'contents')}>
          <Zone zone="clutch" bare={expanded} lit={highlight.includes('clutch') || nudge?.zone === 'clutch'} nudge={nudge?.zone === 'clutch' ? nudge.text : undefined} label="Left hand: clutch lever" title="CLUTCH" value={clutchText} className="@2xl:absolute @2xl:top-3 @2xl:left-3 @2xl:w-[32%] @5xl:w-[29%]">
            <ClutchControl pull={v.clutch} valueText={clutchText} zone={v.frictionZone} onChange={controls && ((x) => controls.set('clutch', x))} onRelease={controls && (() => controls.release('clutch'))} />
          </Zone>
          <Zone
            zone="throttle"
            bare={expanded}
            lit={highlight.includes('throttle') || nudge?.zone === 'throttle'}
            nudge={nudge?.zone === 'throttle' ? nudge.text : undefined}
            label="Right hand: throttle and front brake"
            title="THROTTLE · FRONT BRAKE"
            value={`${pct(v.throttle)} · brake ${pct(v.frontBrake)}`}
            align="right"
            className="order-first col-span-2 @md:order-none @md:col-span-1 @2xl:absolute @2xl:top-3 @2xl:right-3 @2xl:w-[32%] @5xl:w-[29%]"
          >
            <ThrottleBrakeControl
              throttle={v.throttle}
              brake={v.frontBrake}
              onThrottle={controls && ((x) => controls.set('throttle', x))}
              onBrake={controls && ((x) => controls.set('front', x))}
              onThrottleRelease={controls && (() => controls.release('throttle'))}
              onBrakeRelease={controls && (() => controls.release('front'))}
            />
            {engine && (
              <div className={cn('flex justify-end gap-1', expanded ? '-mt-2 opacity-70 hover:opacity-100' : 'mt-1')} role="group" aria-label="Right switch block">
                {engine.running ? (
                  <button
                    type="button"
                    onClick={engine.onStop}
                    className={cn('flex items-center gap-1 rounded-lg border border-danger-500/50 px-2 text-xs text-danger-400 hover:border-danger-400', expanded ? 'min-h-8 bg-bg/50' : 'min-h-11 bg-surface')}
                  >
                    <Square className="size-3.5" aria-hidden /> Engine stop
                  </button>
                ) : (
                  <button type="button" onClick={engine.onStart} className={cn('flex items-center gap-1 rounded-lg border border-ok-500/50 px-2 text-xs text-ok-400 hover:border-ok-400', expanded ? 'min-h-8 bg-bg/50' : 'min-h-11 bg-surface')}>
                    <Power className="size-3.5" aria-hidden /> Start
                  </button>
                )}
              </div>
            )}
          </Zone>
          <Zone
            zone="gear"
            bare={expanded}
            lit={highlight.includes('gear') || nudge?.zone === 'gear'}
            nudge={nudge?.zone === 'gear' ? nudge.text : undefined}
            label="Left foot: gear lever"
            title="GEAR"
            value={v.gear === 0 ? 'Neutral' : `Gear ${v.gear}`}
            className="col-span-2 @md:col-span-1 @2xl:absolute @2xl:bottom-3 @2xl:left-3 @2xl:w-[27%]"
          >
            <div className="flex items-center gap-2">
              <GearSelector gear={v.gear} pattern={v.pattern} kick={controls?.shift} onShift={controls?.lever} className="min-w-0 flex-1" />
              <GearLadder gear={v.gear} pattern={v.pattern} className={cn(expanded && '-order-1')} />
            </div>
            {/* Beginners get buttons; full screen (the recording view) relies on the keyboard and the lever itself. */}
            {controls && !expanded && (
              <div className="mt-1 flex flex-wrap gap-1" role="group" aria-label="Gear lever">
                <button
                  type="button"
                  onClick={() => controls.lever('up')}
                  className="flex min-h-11 items-center gap-1 rounded-lg border border-line bg-surface px-2 text-xs text-ink hover:border-line-strong"
                >
                  <ChevronUp className="size-4" aria-hidden /> Lift
                </button>
                <button
                  type="button"
                  onClick={() => controls.lever('down')}
                  className="flex min-h-11 items-center gap-1 rounded-lg border border-line bg-surface px-2 text-xs text-ink hover:border-line-strong"
                >
                  <ChevronDown className="size-4" aria-hidden /> Press
                </button>
                <button type="button" onClick={() => controls.lever('half')} className="min-h-11 rounded-lg border border-line bg-surface px-2 text-xs text-ok-400 hover:border-line-strong">
                  Neutral
                </button>
              </div>
            )}
          </Zone>
          <Zone
            zone="rear-brake"
            bare={expanded}
            lit={highlight.includes('rear-brake') || nudge?.zone === 'rear-brake'}
            nudge={nudge?.zone === 'rear-brake' ? nudge.text : undefined}
            label="Right foot: rear brake"
            title="REAR BRAKE"
            value={`${pct(v.rearBrake)} pressed`}
            align="right"
            className="@2xl:absolute @2xl:right-3 @2xl:bottom-3 @2xl:w-[27%]"
          >
            <RearBrakeControl pressure={v.rearBrake} onChange={controls && ((x) => controls.set('rear', x))} onRelease={controls && (() => controls.release('rear'))} />
          </Zone>
        </div>
      </div>
    </div>
  )
}
