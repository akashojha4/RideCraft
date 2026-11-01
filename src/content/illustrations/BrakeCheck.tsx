import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'

/*
 * Pre-ride lesson 6: three brake checks.
 *  - Pads: friction material about 4–5 mm when new; a wear groove disappears at about
 *    1.5 mm. Replace at ~1.5 mm or if the groove has gone (use the manufacturer's limit).
 *  - Fluid: level in the reservoir window between MIN and MAX. The level falls slowly as
 *    pads wear; a sudden drop suggests a leak. Dark fluid is old and absorbs water.
 *  - Lever: should feel firm and stop well short of the grip.
 */

type Station = 'pads' | 'fluid' | 'lever'
type Tone = 'ok' | 'caution' | 'danger'
const MM = 14
const GROOVE_LIMIT = 1.5

function padStatus(mm: number): { tone: Tone; label: string; text: string } {
  if (mm <= GROOVE_LIMIT) return { tone: 'danger', label: 'Replace now', text: 'The wear groove has gone. Worn pads brake poorly and soon reach metal, which damages the disc. Have them replaced before riding.' }
  if (mm <= 2.5) return { tone: 'caution', label: 'Replace soon', text: 'Getting thin — book new pads before they reach the limit.' }
  return { tone: 'ok', label: 'Good', text: 'Plenty of friction material, and the wear groove is still visible.' }
}

const leverStates = [
  { id: 'firm', name: 'Firm', travel: 0.35, tone: 'ok' as Tone, text: 'Firm, and stops well short of the grip — the hydraulic system is healthy.' },
  { id: 'spongy', name: 'Spongy', travel: 0.7, tone: 'danger' as Tone, text: 'Soft and travels further than usual — often air in the brake fluid. Braking power is unreliable; have it bled before riding.' },
  { id: 'grip', name: 'Reaches the grip', travel: 1, tone: 'danger' as Tone, text: 'The lever touches the grip: the brake may barely work. Do not ride — get it inspected.' },
]

export default function BrakeCheck() {
  const [station, setStation] = useState<Station>('pads')
  const [pad, setPad] = useState(3.5)
  const [level, setLevel] = useState(60)
  const [dark, setDark] = useState(false)
  const [lever, setLever] = useState('firm')

  const padInfo = padStatus(pad)
  const fluidInfo: { tone: Tone; label: string; text: string } =
    level < 25
      ? { tone: 'danger', label: 'Below MIN', text: 'Low fluid can let air into the system. Do not ride — it usually means very worn pads or a leak.' }
      : dark
        ? { tone: 'caution', label: 'Old fluid', text: 'The level is fine, but dark fluid has absorbed water, which lowers its boiling point. Have it changed (typically every two years).' }
        : { tone: 'ok', label: 'Good', text: 'Between MIN and MAX, and clear. The level drops slowly as the pads wear.' }
  const leverInfo = leverStates.find((l) => l.id === lever)!
  const current = station === 'pads' ? padInfo : station === 'fluid' ? fluidInfo : leverInfo
  const stroke = (t: Tone) => (t === 'ok' ? 'stroke-ok-400' : t === 'caution' ? 'stroke-caution-400' : 'stroke-danger-400')

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 480 220" className="w-full" role="img" aria-label={`Brake check: ${station}`}>
          <g strokeLinejoin="round" strokeLinecap="round">
            {station === 'pads' && (
              <>
                <rect x={232} y={20} width={16} height={180} rx={2} className="fill-ink-subtle" />
                {[-1, 1].map((side) => {
                  const inner = 240 + side * 12
                  const outer = inner + side * pad * MM
                  const x = Math.min(inner, outer)
                  return (
                    <g key={side}>
                      <rect x={x} y={60} width={pad * MM} height={100} rx={2} strokeWidth={2} className={cn('fill-surface-raised', stroke(padInfo.tone))} />
                      {pad > GROOVE_LIMIT && <line x1={x + (pad * MM) / 2} x2={x + (pad * MM) / 2} y1={64} y2={156} strokeWidth={2} className="stroke-bg" />}
                      <rect x={side < 0 ? x - 10 : x + pad * MM} y={56} width={10} height={108} className="fill-surface-overlay stroke-line-strong" />
                    </g>
                  )
                })}
                <DiagramLabel x={240} y={214} anchor="middle">Disc (edge-on) between two pads</DiagramLabel>
                <DiagramLabel x={60} y={110}>{`Friction material ${pad.toFixed(1)} mm`}</DiagramLabel>
              </>
            )}
            {station === 'fluid' && (
              <>
                <rect x={170} y={30} width={140} height={160} rx={12} className="fill-surface-raised stroke-line-strong" strokeWidth={2} />
                <rect x={200} y={60} width={80} height={110} rx={6} className="fill-surface-sunken stroke-ink-subtle" />
                <rect x={202} y={168 - (level / 100) * 106} width={76} height={(level / 100) * 106} rx={4} className={dark ? 'fill-ignition-700' : 'fill-caution-400'} opacity={dark ? 0.9 : 0.45} />
                {[
                  { y: 168 - 0.75 * 106, label: 'MAX' },
                  { y: 168 - 0.25 * 106, label: 'MIN' },
                ].map((m) => (
                  <g key={m.label}>
                    <line x1={196} x2={284} y1={m.y} y2={m.y} strokeWidth={1.5} className="stroke-ink" />
                    <DiagramLabel x={292} y={m.y + 4}>{m.label}</DiagramLabel>
                  </g>
                ))}
                <DiagramLabel x={240} y={208} anchor="middle">Master cylinder reservoir window</DiagramLabel>
              </>
            )}
            {station === 'lever' && (
              <>
                <rect x={80} y={70} width={320} height={26} rx={12} className="fill-surface-overlay stroke-line-strong" />
                <circle cx={380} cy={110} r={6} className="fill-bg stroke-ink-subtle" />
                <g transform={`rotate(${-leverInfo.travel * 9} 380 110)`}>
                  <path d="M380,110 L90,140" strokeWidth={8} className={stroke(leverInfo.tone)} />
                </g>
                <DiagramLabel x={240} y={58} anchor="middle">Grip</DiagramLabel>
                <DiagramLabel x={240} y={190} anchor="middle">Brake lever, squeezed firmly</DiagramLabel>
              </>
            )}
          </g>
        </svg>
      }
      controls={
        <>
          <div role="group" aria-label="Brake check" className="flex flex-wrap gap-1.5">
            {(
              [
                ['pads', 'Pads'],
                ['fluid', 'Fluid'],
                ['lever', 'Lever feel'],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={station === id} onClick={() => setStation(id)} className={cn('h-8 rounded-lg border px-3 text-sm transition-colors', station === id ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                {label}
              </button>
            ))}
          </div>
          {station === 'pads' && <Slider label="Pad thickness" value={pad * 10} onChange={(v) => setPad(v / 10)} min={5} max={50} valueText={`${pad.toFixed(1)} mm`} tone="coolant" />}
          {station === 'fluid' && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Slider label="Fluid level" value={level} onChange={setLevel} valueText={`${level} %`} tone="coolant" className="flex-1" />
              <button type="button" role="switch" aria-checked={dark} onClick={() => setDark((d) => !d)} className={cn('h-8 rounded-lg border px-3 text-sm', dark ? 'border-caution-500/50 bg-caution-950 text-caution-400' : 'border-line text-ink-muted')}>
                Dark, old fluid
              </button>
            </div>
          )}
          {station === 'lever' && (
            <div role="group" aria-label="Lever feel" className="flex flex-wrap gap-1.5">
              {leverStates.map((l) => (
                <button key={l.id} type="button" aria-pressed={lever === l.id} onClick={() => setLever(l.id)} className={cn('h-8 rounded-lg border px-3 text-sm', lever === l.id ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink')}>
                  {l.name}
                </button>
              ))}
            </div>
          )}
          <dl className="grid grid-cols-3 gap-4">
            <Readout label="Pads" value={padInfo.label} tone={padInfo.tone} />
            <Readout label="Fluid" value={fluidInfo.label} tone={fluidInfo.tone} />
            <Readout label="Lever" value={leverInfo.name} tone={leverInfo.tone} />
          </dl>
        </>
      }
      status={current.text}
    />
  )
}
