import { useMemo, useState } from 'react'
import { GRIP } from '@/lib/mechanics/braking'
import { REACTION_TIME, stoppingDistance, type BrakeTechnique } from '@/lib/simulation/stopping'
import { cn } from '@/lib/cn'

/*
 * Stopping distance by braking technique, simulated on the same model as the simulator.
 * One axis (metres), stacked horizontal bars: reaction distance (muted) then braking
 * distance (accent), with the total labelled at the end of each bar. A table view follows.
 */

const TECHNIQUES: { id: BrakeTechnique; label: string }[] = [
  { id: 'rear', label: 'Rear brake only' },
  { id: 'front', label: 'Front brake only' },
  { id: 'both', label: 'Both brakes' },
]
const SPEEDS = [30, 50, 70]
const ROW = 40
const LABEL_W = 120
const CHART_W = 460

export function StoppingDistances() {
  const [kmh, setKmh] = useState(50)
  const [surface, setSurface] = useState<keyof typeof GRIP>('dry')
  const [hover, setHover] = useState<BrakeTechnique | null>(null)
  const rows = useMemo(() => TECHNIQUES.map((t) => ({ ...t, ...stoppingDistance(kmh, GRIP[surface], t.id) })), [kmh, surface])
  // A fixed scale across settings, so switching speed or surface shows the real change.
  const scaleMax = 140
  const px = (m: number) => (m / scaleMax) * (CHART_W - LABEL_W - 50)
  const chip = (on: boolean) => cn('h-8 rounded-lg border px-3 text-sm', on ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')

  return (
    <section aria-labelledby="stopping-heading" className="space-y-4 rounded-2xl border border-line bg-surface p-5">
      <div className="space-y-1">
        <h2 id="stopping-heading" className="text-2xl font-semibold text-ink">
          Stopping distance by technique
        </h2>
        <p className="text-ink-muted">Simulated with this motorcycle: {REACTION_TIME} second to react, then each brake held at the limit of grip.</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <div role="group" aria-label="Speed" className="flex gap-1.5">
          {SPEEDS.map((v) => (
            <button key={v} type="button" aria-pressed={kmh === v} onClick={() => setKmh(v)} className={chip(kmh === v)}>
              {v} km/h
            </button>
          ))}
        </div>
        <div role="group" aria-label="Road surface" className="flex gap-1.5">
          {(['dry', 'wet'] as const).map((s) => (
            <button key={s} type="button" aria-pressed={surface === s} onClick={() => setSurface(s)} className={chip(surface === s)}>
              {s === 'dry' ? 'Dry road' : 'Wet road'}
            </button>
          ))}
        </div>
      </div>

      <figure className="max-w-2xl space-y-2">
        <svg viewBox={`0 0 ${CHART_W} ${rows.length * ROW + 24}`} className="w-full" role="img" aria-label={`Stopping distances from ${kmh} km/h on a ${surface} road`}>
          {[0, 20, 40, 60, 80, 100, 120, 140].map((m) => (
            <g key={m}>
              <line x1={LABEL_W + px(m)} x2={LABEL_W + px(m)} y1={0} y2={rows.length * ROW} strokeWidth={1} className="stroke-line" />
              <text x={LABEL_W + px(m)} y={rows.length * ROW + 14} textAnchor="middle" className="tabular fill-ink-subtle font-mono text-[9px]">
                {m} m
              </text>
            </g>
          ))}
          {rows.map((r, i) => {
            const y0 = i * ROW + 10
            const total = r.reaction + r.braking
            return (
              <g key={r.id} data-technique={r.id} onPointerEnter={() => setHover(r.id)} onPointerLeave={() => setHover(null)} opacity={hover && hover !== r.id ? 0.5 : 1}>
                <rect x={0} y={i * ROW} width={CHART_W} height={ROW} fill="transparent" />
                <text x={0} y={y0 + 14} className="fill-ink text-[11px]">
                  {r.label}
                </text>
                <rect x={LABEL_W} y={y0} width={px(r.reaction)} height={20} rx={2} className="fill-line-strong" />
                <rect x={LABEL_W + px(r.reaction) + 2} y={y0} width={Math.max(0, px(r.braking) - 2)} height={20} rx={4} className="fill-ignition-500" />
                <text x={LABEL_W + px(total) + 6} y={y0 + 14} className="tabular fill-ink font-mono text-[11px]">
                  {hover === r.id ? `${r.reaction.toFixed(0)} + ${r.braking.toFixed(1)} = ${total.toFixed(0)} m` : `${total.toFixed(0)} m`}
                </text>
              </g>
            )
          })}
        </svg>
        <figcaption className="flex flex-wrap gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-line-strong" aria-hidden /> Reaction ({REACTION_TIME} s)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-ignition-500" aria-hidden /> Braking
          </span>
        </figcaption>
      </figure>

      <details className="text-sm">
        <summary className="cursor-pointer text-ink-muted hover:text-ink">Show as a table</summary>
        <table className="mt-2 w-full text-left">
          <thead className="text-xs text-ink-subtle">
            <tr>
              <th className="py-1 font-normal">Technique</th>
              <th className="py-1 text-right font-normal">Reaction</th>
              <th className="py-1 text-right font-normal">Braking</th>
              <th className="py-1 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody className="tabular font-mono">
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="py-1 font-sans">{r.label}</td>
                <td className="py-1 text-right">{r.reaction.toFixed(1)} m</td>
                <td className="py-1 text-right">{r.braking.toFixed(1)} m</td>
                <td className="py-1 text-right">{(r.reaction + r.braking).toFixed(1)} m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <p className="text-sm text-ink-muted">
        Braking shifts the weight forward, so the front tyre can do far more than the rear. Both brakes together stop shortest. Doubling speed roughly quadruples the braking distance, and a wet road roughly doubles it. Locking a wheel is not a shortcut: a sliding front tyre can’t steer or hold the motorcycle up.
      </p>
    </section>
  )
}
