import { useState } from 'react'
import { Meter, Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { clampingForce } from '@/lib/mechanics/clutch'
import { DiagramFrame, DiagramLabel } from '../DiagramFrame'

/*
 * Schematic cross-section of a wet multi-plate clutch (shaft horizontal). The lever →
 * clamping-force model lives in lib/mechanics/clutch.ts.
 */

const MAX_GAP = 14
const SHAFT_Y = 130
const PLATES = ['friction', 'steel', 'friction', 'steel', 'friction', 'steel', 'friction'] as const
const THICKNESS = { friction: 10, steel: 6 }
const STACK_START = 110

function springPath(x1: number, x2: number, y: number, coils = 6, amp = 7) {
  const step = (x2 - x1) / (coils * 2)
  let d = `M${x1},${y}`
  for (let i = 1; i < coils * 2; i++) d += ` L${x1 + i * step},${y + (i % 2 ? -amp : amp)}`
  return `${d} L${x2},${y}`
}

function PlateSegments({ x, kind }: { x: number; kind: (typeof PLATES)[number] }) {
  const w = THICKNESS[kind]
  // Friction plates reach out to the basket; steel plates reach in to the hub.
  const [top, bottom] = kind === 'friction' ? [[43, 100], [160, 217]] : [[54, 96], [164, 206]]
  const cls = kind === 'friction' ? 'fill-coolant-950 stroke-coolant-400' : 'fill-surface-overlay stroke-ink-subtle'
  return (
    <>
      <rect x={x} y={top[0]} width={w} height={top[1] - top[0]} rx={1.5} className={cls} />
      <rect x={x} y={bottom[0]} width={w} height={bottom[1] - bottom[0]} rx={1.5} className={cls} />
    </>
  )
}

export default function ClutchDiagram() {
  const [pull, setPull] = useState(0)
  const p = pull / 100
  const clamp = clampingForce(p)
  const gap = (1 - clamp) * MAX_GAP

  // Engaged positions stack the plates face to face; the lift gap is shared out between them.
  const starts = PLATES.map((_, i) => STACK_START + PLATES.slice(0, i).reduce((sum, k) => sum + THICKNESS[k], 0))
  const plates = PLATES.map((kind, i) => ({ kind, x: starts[i] + (gap * i) / PLATES.length }))
  const pressureX = STACK_START + PLATES.reduce((sum, k) => sum + THICKNESS[k], 0) + gap

  const state = clamp >= 0.999 ? 'engaged' : clamp <= 0.001 ? 'disengaged' : 'friction'
  const status = {
    engaged:
      (p > 0 ? 'The first part of the lever’s travel is freeplay: the cable slack is taken up before the pressure plate moves. ' : '') +
      'The springs clamp the plates together, so the basket and hub turn as one and all of the engine’s torque reaches the gearbox.',
    friction:
      'The pressure plate is lifting. With less clamping force the plates slip, passing on only part of the engine’s torque. This is the friction zone — how you pull away smoothly.',
    disengaged:
      'The pressure plate has lifted clear and the plates spin independently. No torque reaches the gearbox, so you can change gear or stop without stalling.',
  }[state]

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 480 260" className="w-full" role="img" aria-label={`Clutch cross-section, ${state}`}>
          <g strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
            {/* Gearbox mainshaft (hollow) with the pushrod inside */}
            <line x1={20} y1={SHAFT_Y - 6} x2={470} y2={SHAFT_Y - 6} strokeWidth={2} className="stroke-line-strong" />
            <line x1={20} y1={SHAFT_Y + 6} x2={470} y2={SHAFT_Y + 6} strokeWidth={2} className="stroke-line-strong" />
            <line x1={28} y1={SHAFT_Y} x2={pressureX} y2={SHAFT_Y} strokeWidth={4} className="stroke-coolant-300" />

            {/* Basket, driven by the primary gear */}
            <rect x={56} y={30} width={14} height={200} className="fill-surface-raised stroke-ink-subtle" />
            {Array.from({ length: 10 }, (_, i) => (
              <line key={i} x1={56} x2={70} y1={38 + i * 20} y2={38 + i * 20} className="stroke-line-strong" />
            ))}
            <path d="M200,40 L70,40 L70,220 L200,220" fill="none" strokeWidth={6} className="stroke-ink-subtle" />

            {/* Hub, splined to the shaft, with spring bolts */}
            <rect x={104} y={96} width={64} height={68} className="fill-surface-raised stroke-line-strong" />
            <rect x={98} y={54} width={8} height={152} className="fill-surface-raised stroke-line-strong" />
            {[70, 190].map((y) => (
              <g key={y}>
                <line x1={150} y1={y} x2={232} y2={y} strokeWidth={3} className="stroke-line-strong" />
                <rect x={230} y={y - 9} width={7} height={18} rx={1} className="fill-surface-overlay stroke-ink-subtle" />
                <path d={springPath(pressureX + 16, 230, y)} fill="none" strokeWidth={2} className="stroke-ink-muted" />
              </g>
            ))}

            {plates.map((plate, i) => (
              <PlateSegments key={i} x={plate.x} kind={plate.kind} />
            ))}

            {/* Pressure plate */}
            <rect x={pressureX} y={50} width={16} height={160} rx={3} className="fill-surface-overlay stroke-coolant-300" />

            {/* Release mechanism, operated by the lever cable */}
            <path d={`M28,${SHAFT_Y} L14,96 L4,96`} fill="none" strokeWidth={4} className="stroke-ignition-400" />

            {/* Torque flow arrows */}
            <g style={{ opacity: 0.15 + 0.85 * clamp }}>
              <line x1={320} y1={SHAFT_Y} x2={440} y2={SHAFT_Y} strokeWidth={6} strokeDasharray="10 8" className="stroke-coolant-400" />
              <path d={`M440,${SHAFT_Y - 9} L456,${SHAFT_Y} L440,${SHAFT_Y + 9} Z`} className="fill-coolant-400" />
            </g>

            <DiagramLabel x={46} y={20}>From crankshaft</DiagramLabel>
            <DiagramLabel x={4} y={88} tone="ignition">From lever</DiagramLabel>
            <DiagramLabel x={252} y={74}>Springs</DiagramLabel>
            <DiagramLabel x={120} y={240} anchor="middle" tone="coolant">Friction &amp; steel plates</DiagramLabel>
            <DiagramLabel x={pressureX + 8} y={34} anchor="middle" tone="coolant">Pressure plate</DiagramLabel>
            <DiagramLabel x={380} y={SHAFT_Y - 16} anchor="middle">To gearbox</DiagramLabel>
            <DiagramLabel x={208} y={232}>Basket</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <Slider
            label="Clutch lever pull"
            value={pull}
            onChange={setPull}
            valueText={`${pull} %`}
            hint="Drag to pull the lever towards the grip."
          />
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Meter label="Clamping force" value={clamp} />
            <Meter label="Torque capacity" value={clamp} tone="ok" />
            <dl>
              <Readout
                label="State"
                value={state === 'engaged' ? 'Engaged' : state === 'friction' ? 'Friction zone' : 'Disengaged'}
                tone={state === 'engaged' ? 'ok' : state === 'friction' ? 'caution' : 'coolant'}
              />
            </dl>
          </div>
        </>
      }
      status={status}
    />
  )
}
