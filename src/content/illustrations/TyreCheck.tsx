import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { useState } from 'react'

/*
 * Pre-ride lesson 5: tyre tread depth and pressure.
 *
 * Tread: a groove cross-section with a tread-wear indicator (TWI) bar moulded at about
 * 1 mm. Many countries set a legal minimum of 1–1.6 mm for motorcycles; wet grip falls
 * well before that, so we advise replacing at about 2 mm.
 * Pressure: to a first approximation the contact patch area equals load ÷ pressure, so
 * the footprint ellipse is scaled by √(recommended ÷ actual). Example rear figure 29 psi
 * (cold) — always use the figure in your owner’s manual.
 */

const RECOMMENDED = 29
const NEW_DEPTH = 6
const TWI = 1
const MM = 12 // drawing units per mm of depth

function treadStatus(mm: number) {
  if (mm <= TWI) return { tone: 'danger' as const, label: 'At the limit', text: 'The tread is level with the wear indicator bars: replace the tyre before riding — it is likely below the legal minimum and has little wet grip.' }
  if (mm <= 2) return { tone: 'caution' as const, label: 'Replace soon', text: 'Shallow grooves can’t clear water quickly, so grip in the wet falls sharply. Plan a new tyre now.' }
  return { tone: 'ok' as const, label: 'Good', text: 'Plenty of tread: the grooves can channel water away from the contact patch.' }
}

function pressureStatus(psi: number) {
  const r = psi / RECOMMENDED
  if (r < 0.85) return { tone: 'danger' as const, label: 'Under-inflated', text: 'The sidewall flexes and bulges, the tyre overheats, steering feels heavy and the motorcycle may weave. Inflate to the recommended pressure before riding.' }
  if (r > 1.15) return { tone: 'caution' as const, label: 'Over-inflated', text: 'The contact patch shrinks and the tyre feels harsh and skittish, with less grip. Let some air out to the recommended figure.' }
  return { tone: 'ok' as const, label: 'Correct', text: 'At the recommended pressure the tyre keeps its designed shape and footprint. Check it cold, before riding.' }
}

export default function TyreCheck() {
  const [depth, setDepth] = useState(4)
  const [psi, setPsi] = useState(22)
  const tread = treadStatus(depth)
  const pressure = pressureStatus(psi)
  const patchScale = Math.sqrt(RECOMMENDED / psi)
  const bulge = Math.max(0, (RECOMMENDED - psi) / RECOMMENDED) * 40
  const grooveTop = 70
  const surfaceY = grooveTop + (NEW_DEPTH - depth) * MM
  const grooveFloorY = grooveTop + NEW_DEPTH * MM
  const toneClass = (t: 'ok' | 'caution' | 'danger') => (t === 'ok' ? 'stroke-ok-400' : t === 'caution' ? 'stroke-caution-400' : 'stroke-danger-400')

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 480 236" className="w-full" role="img" aria-label={`Tread depth ${depth} millimetres, pressure ${psi} psi`}>
          <g strokeLinejoin="round" strokeLinecap="round">
            {/* Tread cross-section: rubber with one groove */}
            <rect x={20} y={grooveTop - (NEW_DEPTH - depth) * MM} width={180} height={(NEW_DEPTH - depth) * MM} className="fill-surface-overlay" opacity={0.25} />
            <path
              d={`M20,${grooveTop} L90,${grooveTop} L90,${grooveTop + NEW_DEPTH * MM} L130,${grooveTop + NEW_DEPTH * MM} L130,${grooveTop} L200,${grooveTop} L200,170 L20,170 Z`}
              className="fill-surface-raised"
            />
            <rect x={90} y={grooveTop} width={40} height={NEW_DEPTH * MM} className="fill-surface-sunken" />
            {/* Worn surface */}
            <rect x={20} y={grooveTop} width={70} height={(NEW_DEPTH - depth) * MM} className="fill-bg" />
            <rect x={130} y={grooveTop} width={70} height={(NEW_DEPTH - depth) * MM} className="fill-bg" />
            <line x1={20} x2={90} y1={grooveTop + (NEW_DEPTH - depth) * MM} y2={grooveTop + (NEW_DEPTH - depth) * MM} strokeWidth={3} className={toneClass(tread.tone)} />
            <line x1={130} x2={200} y1={grooveTop + (NEW_DEPTH - depth) * MM} y2={grooveTop + (NEW_DEPTH - depth) * MM} strokeWidth={3} className={toneClass(tread.tone)} />
            {/* Wear indicator bar in the groove */}
            <rect x={90} y={grooveTop + (NEW_DEPTH - TWI) * MM} width={40} height={TWI * MM} className="fill-ink-subtle" />
            <line x1={210} x2={210} y1={surfaceY} y2={grooveFloorY} strokeWidth={1.5} className="stroke-ink-muted" />
            <DiagramLabel x={216} y={(surfaceY + grooveFloorY) / 2 + 4}>{`${depth.toFixed(1)} mm`}</DiagramLabel>
            <DiagramLabel x={110} y={196} anchor="middle">Wear indicator bar</DiagramLabel>
            <DiagramLabel x={110} y={30} anchor="middle">Tread groove</DiagramLabel>

            {/* Tyre profile and footprint */}
            <line x1={270} x2={470} y1={150} y2={150} strokeWidth={2} className="stroke-line-strong" />
            <path
              d={`M300,${70} C300,40 400,40 400,70 L${400 + bulge / 2},${130} C${400 + bulge / 2},${150} ${300 - bulge / 2},${150} ${300 - bulge / 2},${130} Z`}
              strokeWidth={2.5}
              className={`fill-surface-raised ${toneClass(pressure.tone)}`}
            />
            <rect x={330} y={58} width={40} height={10} rx={3} className="fill-surface-overlay stroke-ink-subtle" />
            <ellipse cx={350} cy={186} rx={22 * patchScale} ry={14 * patchScale} strokeWidth={2} className="fill-coolant-950 stroke-coolant-300" />
            <DiagramLabel x={350} y={26} anchor="middle">Tyre, from the front</DiagramLabel>
            <DiagramLabel x={350} y={230} anchor="middle">Contact patch</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Tread depth" value={depth * 10} onChange={(v) => setDepth(v / 10)} min={5} max={NEW_DEPTH * 10} valueText={`${depth.toFixed(1)} mm`} tone="coolant" />
            <Slider label="Tyre pressure (cold)" value={psi} onChange={setPsi} min={15} max={40} valueText={`${psi} psi (recommended ${RECOMMENDED})`} tone="coolant" />
          </div>
          <dl className="grid grid-cols-3 gap-4">
            <Readout label="Tread" value={tread.label} tone={tread.tone} />
            <Readout label="Pressure" value={pressure.label} tone={pressure.tone} />
            <Readout label="Patch area" value={`${Math.round(patchScale ** 2 * 100)} %`} />
          </dl>
        </>
      }
      status={
        <>
          <span className="block">
            <span className="font-medium text-ink">Tread:</span> {tread.text}
          </span>
          <span className="mt-1 block">
            <span className="font-medium text-ink">Pressure:</span> {pressure.text}
          </span>
          <span className="mt-1 block text-xs text-ink-subtle">
            Example recommended rear pressure {RECOMMENDED} psi — use the figures in your owner’s manual. Legal minimum tread varies by country (commonly 1–1.6 mm).
          </span>
        </>
      }
    />
  )
}
