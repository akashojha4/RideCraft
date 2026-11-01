import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { ControlId } from './controls'

/*
 * The rider's view of the controls: handlebar from above (forward = up), plus the two
 * foot controls. Without `state` it is a static map of the controls (lesson 3); with
 * `state` it shows live positions, needles and warning lights (the simulators).
 */

export interface CockpitState {
  ignition: boolean
  kill: 'off' | 'run'
  /** Clutch lever pull, 0 (released) – 1 (at the grip). */
  clutch: number
  /** Throttle opening, 0 – 1. */
  throttle: number
  starter: boolean
  /** 0 = neutral. */
  gear: number
  rpm: number
  speed: number
  lights: { neutral: boolean; oil: boolean; charge: boolean; engine: boolean }
}

const needle = (cx: number, cy: number, r: number, fraction: number) => {
  const a = ((-210 + Math.min(Math.max(fraction, 0), 1) * 240) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function Control({
  id,
  active,
  onSelect,
  children,
}: {
  id: ControlId
  active: boolean
  onSelect?: (id: ControlId) => void
  children: ReactNode
}) {
  return (
    <g
      data-control={id}
      onClick={onSelect ? () => onSelect(id) : undefined}
      className={cn('cockpit-control', active && 'is-active', onSelect && 'cursor-pointer')}
    >
      {children}
    </g>
  )
}

export function Cockpit({
  active,
  onSelect,
  state,
  className,
}: {
  active: ControlId | null
  onSelect?: (id: ControlId) => void
  state?: CockpitState
  className?: string
}) {
  const speedNeedle = state && needle(216, 78, 16, state.speed / 140)
  const rpmNeedle = state && needle(264, 78, 16, state.rpm / 10000)
  const c = (id: ControlId, children: ReactNode) => (
    <Control id={id} active={active === id} onSelect={onSelect}>
      {children}
    </Control>
  )
  return (
    <svg viewBox="0 0 480 300" className={cn('cockpit w-full', className)} role="img" aria-label="Rider’s view of the handlebar and foot controls">
      <g strokeLinejoin="round" strokeLinecap="round" strokeWidth={1.5}>
        {c(
          'mirrors',
          <>
            <path d="M120,128 L92,52 M360,128 L388,52" fill="none" strokeWidth={4} className="stroke-ink-subtle" />
            <ellipse cx={84} cy={40} rx={34} ry={18} className="fill-surface-raised stroke-ink-subtle" />
            <ellipse cx={396} cy={40} rx={34} ry={18} className="fill-surface-raised stroke-ink-subtle" />
          </>,
        )}
        {c(
          'instruments',
          <>
            <rect x={186} y={46} width={108} height={64} rx={20} className="fill-surface-raised stroke-ink-subtle" />
            <circle cx={216} cy={78} r={20} fill="none" className="stroke-ink-subtle" />
            <circle cx={264} cy={78} r={20} fill="none" className="stroke-ink-subtle" />
            {state ? (
              <>
                {state.ignition && (
                  <>
                    <line x1={216} y1={78} x2={speedNeedle!.x} y2={speedNeedle!.y} strokeWidth={2} className="stroke-ignition-500" />
                    <line x1={264} y1={78} x2={rpmNeedle!.x} y2={rpmNeedle!.y} strokeWidth={2} className="stroke-ignition-500" />
                  </>
                )}
                {(
                  [
                    ['neutral', 222, 'fill-ok-500'],
                    ['oil', 234, 'fill-danger-500'],
                    ['charge', 246, 'fill-danger-500'],
                    ['engine', 258, 'fill-caution-500'],
                  ] as const
                ).map(([key, x, on]) => (
                  <circle key={key} data-light={key} cx={x} cy={102} r={3.5} className={state.lights[key] ? on : 'fill-surface-overlay'} />
                ))}
              </>
            ) : (
              <circle cx={240} cy={100} r={4} className="fill-ok-500" />
            )}
          </>,
        )}
        {/* Handlebar */}
        <path d="M44,160 C120,150 180,136 240,136 C300,136 360,150 436,160" fill="none" strokeWidth={10} className="stroke-surface-overlay" />
        {c(
          'ignition',
          <>
            <circle cx={240} cy={156} r={11} className="fill-surface-raised stroke-ink-subtle" />
            {state && <line x1={240} y1={148} x2={240} y2={164} strokeWidth={3} transform={`rotate(${state.ignition ? 90 : 0} 240 156)`} className={state.ignition ? 'stroke-ignition-400' : 'stroke-ink-muted'} />}
          </>,
        )}
        {c(
          'clutch-lever',
          // Pulling the lever swings its free end back towards the grip.
          <g transform={`rotate(${-(state?.clutch ?? 0) * 16} 126 148)`}>
            <path d="M126,148 C100,126 72,118 40,120" fill="none" strokeWidth={6} className="stroke-ink-muted" />
          </g>,
        )}
        {c(
          'front-brake-lever',
          <path d="M354,148 C380,126 408,118 440,120" fill="none" strokeWidth={6} className="stroke-ink-muted" />,
        )}
        {c(
          'left-switches',
          <>
            <rect x={110} y={148} width={40} height={30} rx={6} className="fill-surface-raised stroke-ink-subtle" />
            <circle cx={122} cy={163} r={4} className="fill-ink-subtle" />
            <circle cx={138} cy={163} r={4} className="fill-ink-subtle" />
          </>,
        )}
        {c(
          'right-switches',
          <>
            <rect x={330} y={146} width={40} height={34} rx={6} className="fill-surface-raised stroke-ink-subtle" />
            <rect x={342} y={state?.kill === 'run' ? 154 : 150} width={16} height={8} rx={2} className="fill-danger-500" />
            <circle cx={350} cy={170} r={state?.starter ? 6 : 5} className={state?.starter ? 'fill-ignition-400' : 'fill-ink-subtle'} />
            {state && (
              <text x={350} y={141} textAnchor="middle" className="fill-ink-muted font-mono text-[9px]">
                {state.kill === 'run' ? 'RUN' : 'OFF'}
              </text>
            )}
          </>,
        )}
        {/* Left grip (fixed) and right grip (throttle) */}
        <rect x={34} y={150} width={72} height={22} rx={10} className="fill-surface-overlay stroke-line-strong" />
        {c(
          'throttle',
          <>
            <rect x={374} y={150} width={72} height={22} rx={10} className="fill-surface-overlay stroke-ink-muted" />
            {state && state.throttle > 0 && <rect x={376} y={152} width={68 * state.throttle} height={18} rx={8} className="fill-ignition-500/50" />}
            <path d="M396,186 C410,194 426,192 436,184" fill="none" strokeWidth={2} className="stroke-ink-subtle" />
            <path d="M436,184 l-2,-7 M436,184 l-7,0" fill="none" strokeWidth={2} className="stroke-ink-subtle" />
          </>,
        )}

        {/* Foot controls */}
        <line x1={20} x2={460} y1={222} y2={222} className="stroke-line" />
        {c(
          'gear-lever',
          <>
            <rect x={70} y={238} width={120} height={46} rx={10} className="fill-surface-raised stroke-ink-subtle" />
            <path d="M96,261 L164,261" strokeWidth={6} className="stroke-ink-muted" />
            {state && (
              <text x={84} y={252} className="fill-ink-muted font-mono text-[10px]">
                {state.gear ? `GEAR ${state.gear}` : 'NEUTRAL'}
              </text>
            )}
            <path d="M176,248 l0,-0 M176,254 l-5,-6 l-5,6 M176,268 l-5,6 l-5,-6" fill="none" strokeWidth={2} className="stroke-ink-subtle" />
          </>,
        )}
        {c(
          'rear-brake-pedal',
          <>
            <rect x={290} y={238} width={120} height={46} rx={10} className="fill-surface-raised stroke-ink-subtle" />
            <path d="M316,261 L384,261" strokeWidth={6} className="stroke-ink-muted" />
          </>,
        )}
        <text x={130} y={232} textAnchor="middle" className="fill-ink-subtle font-mono text-[10px]">LEFT FOOT</text>
        <text x={350} y={232} textAnchor="middle" className="fill-ink-subtle font-mono text-[10px]">RIGHT FOOT</text>
        <text x={70} y={196} textAnchor="middle" className="fill-ink-subtle font-mono text-[10px]">LEFT HAND</text>
        <text x={410} y={208} textAnchor="middle" className="fill-ink-subtle font-mono text-[10px]">RIGHT HAND</text>
      </g>
    </svg>
  )
}
