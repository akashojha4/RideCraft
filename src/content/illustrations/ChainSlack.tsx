import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { sprocketPath } from '@/lib/geometry'

/*
 * Pre-ride lesson 7: chain slack, measured as the total up-and-down movement at the
 * middle of the lower run (bike on its stand, engine off, in neutral). A typical
 * specification is 20–30 mm — always use the figure in your owner’s manual.
 */

const FRONT = { x: 110, y: 100, r: 20 }
const REAR = { x: 370, y: 100, r: 56 }
const SPEC = { min: 20, max: 30 }
const PX_PER_MM = 1.3

// Lower external tangent points (both centres at the same height).
const nx = (FRONT.r - REAR.r) / (REAR.x - FRONT.x)
const ny = Math.sqrt(1 - nx * nx)
const lowF = { x: FRONT.x + FRONT.r * nx, y: FRONT.y + FRONT.r * ny }
const lowR = { x: REAR.x + REAR.r * nx, y: REAR.y + REAR.r * ny }
const topF = { x: FRONT.x + FRONT.r * nx, y: FRONT.y - FRONT.r * ny }
const topR = { x: REAR.x + REAR.r * nx, y: REAR.y - REAR.r * ny }
const mid = { x: (lowF.x + lowR.x) / 2, y: (lowF.y + lowR.y) / 2 }

/** Lower run displaced by `offset` px at its midpoint (a quadratic's control is twice the midpoint offset). */
const lowerRun = (offset: number) => `M${lowF.x},${lowF.y} Q${mid.x},${mid.y + 2 * offset} ${lowR.x},${lowR.y}`

function status(mm: number) {
  if (mm < 12) return { tone: 'danger' as const, label: 'Far too tight', text: 'A tight chain strains the gearbox and wheel bearings, wears fast, and can snap when the suspension compresses and the swingarm pulls the sprockets further apart. Adjust before riding.' }
  if (mm < SPEC.min) return { tone: 'caution' as const, label: 'A little tight', text: 'Slightly under specification. Adjust it soon — check at the tightest point by turning the wheel.' }
  if (mm <= SPEC.max) return { tone: 'ok' as const, label: 'In specification', text: 'Within the typical 20–30 mm range. Check it at a few points around the chain, as wear is often uneven.' }
  if (mm <= 40) return { tone: 'caution' as const, label: 'A little loose', text: 'A slack chain snatches as you open and close the throttle and wears the sprockets. Adjust it soon.' }
  return { tone: 'danger' as const, label: 'Far too loose', text: 'A very slack chain can jump off the sprockets and lock the rear wheel. Do not ride until it is adjusted — and check the chain and sprockets for wear.' }
}

export default function ChainSlack() {
  const [slack, setSlack] = useState(45)
  const [lubed, setLubed] = useState(false)
  const s = status(slack)
  const half = (slack / 2) * PX_PER_MM
  const chainClass = lubed ? 'stroke-ink-muted' : 'stroke-caution-500'

  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 20 420 210" className="w-full" role="img" aria-label={`Chain with ${slack} millimetres of slack`}>
          <g strokeLinejoin="round" strokeLinecap="round">
            <g transform={`translate(${FRONT.x} ${FRONT.y})`}>
              <path d={sprocketPath(15, FRONT.r, 2, 2.5)} className="fill-surface-overlay stroke-ink-subtle" strokeWidth={1.5} />
            </g>
            <g transform={`translate(${REAR.x} ${REAR.y})`}>
              <path d={sprocketPath(42, REAR.r, 2, 2.5)} className="fill-surface-overlay stroke-ink-subtle" strokeWidth={1.5} />
              <circle r={10} className="fill-bg stroke-line-strong" />
            </g>
            <line x1={topF.x} y1={topF.y} x2={topR.x} y2={topR.y} strokeWidth={5} strokeDasharray="4 3" className={chainClass} />
            <path d={lowerRun(-half)} fill="none" strokeWidth={2} strokeDasharray="4 4" className="stroke-ink-subtle" />
            <path d={lowerRun(half)} fill="none" strokeWidth={5} strokeDasharray="4 3" className={chainClass} />

            {/* Measuring at the midpoint */}
            <line x1={mid.x + 30} x2={mid.x + 30} y1={mid.y - half} y2={mid.y + half} strokeWidth={2} className={s.tone === 'ok' ? 'stroke-ok-400' : s.tone === 'caution' ? 'stroke-caution-400' : 'stroke-danger-400'} />
            <line x1={mid.x + 24} x2={mid.x + 36} y1={mid.y - half} y2={mid.y - half} strokeWidth={2} className="stroke-ink-muted" />
            <line x1={mid.x + 24} x2={mid.x + 36} y1={mid.y + half} y2={mid.y + half} strokeWidth={2} className="stroke-ink-muted" />
            <DiagramLabel x={mid.x + 42} y={mid.y + 4}>{`${slack} mm`}</DiagramLabel>
            <path d={`M${mid.x},${mid.y + half + 6} l0,22 M${mid.x - 6},${mid.y + half + 14} l6,-8 l6,8`} fill="none" strokeWidth={2} className="stroke-ignition-400" />
            <DiagramLabel x={mid.x} y={mid.y + half + 44} anchor="middle" tone="ignition">Push up, then down</DiagramLabel>
            <DiagramLabel x={FRONT.x} y={50} anchor="middle">Front sprocket</DiagramLabel>
            <DiagramLabel x={REAR.x} y={34} anchor="middle">Rear sprocket</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Slider label="Measured slack" value={slack} onChange={setSlack} min={5} max={60} valueText={`${slack} mm (spec ${SPEC.min}–${SPEC.max})`} tone="coolant" className="flex-1" />
            <button type="button" role="switch" aria-checked={lubed} onClick={() => setLubed((l) => !l)} className={cn('h-8 rounded-lg border px-3 text-sm', lubed ? 'border-ok-500/50 bg-ok-950 text-ok-400' : 'border-caution-500/50 bg-caution-950 text-caution-400')}>
              {lubed ? 'Clean & lubricated' : 'Dry & rusty'}
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            <Readout label="Slack" value={s.label} tone={s.tone} />
            <Readout label="Lubrication" value={lubed ? 'Good' : 'Needs lubricating'} tone={lubed ? 'ok' : 'caution'} />
          </dl>
        </>
      }
      status={
        <>
          {s.text}{' '}
          {!lubed && <span className="text-caution-400">A dry, rusty chain wears quickly and can seize links — clean and lubricate it (roughly every 500–1,000 km, or after rain).</span>}
        </>
      }
    />
  )
}
