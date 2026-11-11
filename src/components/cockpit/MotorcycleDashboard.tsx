import { cn } from '@/lib/cn'

/*
 * The instrument cluster: a rev dial, big speed, big gear and the engine lamp, in one housing.
 * The rider's own inputs (clutch, throttle, brakes) are on the control drawings, not repeated
 * here. Values are whatever the simulation passes in.
 */

export interface DashboardValues {
  kmh: number
  rpm: number
  redline: number
  gear: number
  engineRunning: boolean
  clutch: number
  throttle: number
  frontBrake: number
  rearBrake: number
}

/** The dial sweeps 240°, from lower left round over the top to lower right. */
const START = 150
const SWEEP = 240

function at(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}
function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const a = at(cx, cy, r, from)
  const b = at(cx, cy, r, to)
  return `M${a.x.toFixed(2)},${a.y.toFixed(2)} A${r},${r} 0 ${to - from > 180 ? 1 : 0} 1 ${b.x.toFixed(2)},${b.y.toFixed(2)}`
}

function RevDial({ rpm, redline }: { rpm: number; redline: number }) {
  const max = Math.ceil((redline * 1.1) / 1000) * 1000
  const k = (v: number) => START + (Math.min(Math.max(v, 0), max) / max) * SWEEP
  const c = { x: 50, y: 50 }
  const ticks = Array.from({ length: max / 1000 + 1 }, (_, i) => i)
  const needle = at(c.x, c.y, 36, k(rpm))
  return (
    <svg viewBox="0 0 100 90" className="h-full w-auto" aria-hidden>
      <path d={arc(c.x, c.y, 42, START, START + SWEEP)} fill="none" strokeWidth={6} className="stroke-surface-overlay" strokeLinecap="round" />
      <path d={arc(c.x, c.y, 42, k(redline), START + SWEEP)} fill="none" strokeWidth={6} className="stroke-danger-500/70" />
      {rpm > 30 && <path d={arc(c.x, c.y, 42, START, k(rpm))} fill="none" strokeWidth={6} className={rpm > redline ? 'stroke-danger-400' : 'stroke-coolant-400'} strokeLinecap="round" />}
      {ticks.map((i) => {
        const a = at(c.x, c.y, 36, k(i * 1000))
        const b = at(c.x, c.y, 31, k(i * 1000))
        const t = at(c.x, c.y, 24, k(i * 1000))
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={1.4} className={i * 1000 >= redline ? 'stroke-danger-400' : 'stroke-ink-subtle'} />
            {i % 2 === 0 && i > 0 && (
              <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="middle" className={cn('font-mono text-[8.5px]', i * 1000 >= redline ? 'fill-danger-400' : 'fill-ink-muted')}>
                {i}
              </text>
            )}
          </g>
        )
      })}
      <line x1={c.x} y1={c.y} x2={needle.x} y2={needle.y} strokeWidth={2.4} strokeLinecap="round" className="stroke-ignition-400" />
      <circle cx={c.x} cy={c.y} r={4} className="fill-surface-raised stroke-ignition-400" strokeWidth={1.2} />
      <text x={c.x} y={c.y + 27} textAnchor="middle" className="fill-ink font-mono text-[10px]">
        {Math.round(rpm).toLocaleString('en')}
      </text>
      <text x={c.x} y={c.y + 36} textAnchor="middle" className="fill-ink-subtle font-mono text-[6px] tracking-widest">
        RPM
      </text>
    </svg>
  )
}

export function MotorcycleDashboard({ values, className }: { values: DashboardValues; className?: string }) {
  const { kmh, rpm, redline, gear, engineRunning } = values
  return (
    <section
      aria-label="Instrument cluster"
      data-cluster
      className={cn('origin-bottom rounded-[28px] border border-white/10 [@media(max-height:520px)]:scale-[0.7] bg-gradient-to-b from-[#181c23] to-[#07090c] p-2 shadow-[0_12px_40px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.06)]', className)}
    >
      <div className="flex h-28 items-stretch gap-2 rounded-[22px] bg-black/60 px-3 py-1.5 ring-1 ring-white/5 @5xl:h-36">
        <RevDial rpm={rpm} redline={redline} />
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
          <p className="tabular font-mono text-5xl leading-none font-semibold text-ink @5xl:text-6xl" aria-label={`Speed ${Math.round(kmh)} kilometres per hour`}>
            {Math.round(kmh)}
          </p>
          <p className="mt-1 font-mono text-[11px] tracking-widest text-ink-subtle">KM/H</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-1.5">
          <p
            className={cn('flex size-14 items-center justify-center rounded-xl border-2 font-mono text-4xl font-semibold @5xl:size-16 @5xl:text-5xl', gear === 0 ? 'border-ok-500/60 bg-ok-950/60 text-ok-400' : 'border-coolant-500/60 bg-coolant-950/60 text-coolant-300')}
            aria-label={gear === 0 ? 'Neutral' : `Gear ${gear}`}
          >
            {gear === 0 ? 'N' : gear}
          </p>
          <p data-engine={engineRunning ? 'run' : 'off'} className={cn('flex items-center gap-1 font-mono text-[11px] font-semibold tracking-wider', engineRunning ? 'text-ok-400' : 'text-danger-400')}>
            <span className={cn('size-2 rounded-full', engineRunning ? 'bg-ok-400 shadow-[0_0_6px_var(--color-ok-400)]' : 'bg-danger-500')} aria-hidden />
            <span className="sr-only">Engine </span>
            {engineRunning ? 'RUN' : 'OFF'}
          </p>
        </div>
      </div>
    </section>
  )
}
