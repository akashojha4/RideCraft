import { useState } from 'react'
import { Meter, Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { DiagramFrame, DiagramLabel } from '../DiagramFrame'

/*
 * Hydraulic disc brake: lever (front) or pedal (rear) → master cylinder → hose →
 * opposed-piston caliper → pads → disc.
 *
 * The first 15 % of travel moves the pads across their small running clearance; after
 * that the pads touch the disc and further travel builds pressure. The force
 * multiplication shown is the hydraulic area ratio of two 25 mm caliper pistons per side
 * to a 12.7 mm master-cylinder piston — about 8 × (on top of the lever's own leverage).
 */

const CONTACT = 0.15
const CLEARANCE = 4
const MASTER_D = 12.7
const CALIPER_D = 25
const AREA_RATIO = (2 * CALIPER_D ** 2) / MASTER_D ** 2
const DISC_X = 390
const DISC_W = 10

export default function BrakeDiagram({ variant }: { variant: 'front' | 'rear' }) {
  const [travel, setTravel] = useState(0)
  const p = travel / 100
  const padMove = Math.min(p / CONTACT, 1) * CLEARANCE
  const pressure = p <= CONTACT ? 0 : (p - CONTACT) / (1 - CONTACT)
  const pistonX = 128 + p * 18
  const control = variant === 'front' ? 'Brake lever' : 'Brake pedal'

  // Rear pedal: pivots at (112,170) and its foot end swings down as it is pressed. A rod
  // attached 26 units along the arm pushes the master-cylinder piston.
  const pedalAngle = p * 16
  const a = (-pedalAngle * Math.PI) / 180
  const dir = { x: -0.97, y: -0.243 } // pivot → foot pad, at rest
  const arm = {
    x: 112 + 26 * (dir.x * Math.cos(a) - dir.y * Math.sin(a)),
    y: 170 + 26 * (dir.x * Math.sin(a) + dir.y * Math.cos(a)),
  }

  const status =
    p === 0
      ? `${control} released: the pads sit just clear of the disc, which turns freely with the wheel.`
      : p <= CONTACT
        ? 'Taking up the clearance: the master cylinder piston pushes fluid along the hose and the caliper pistons move the pads towards the disc.'
        : `Pads clamping the disc. Fluid pressure is equal everywhere in the system, so the larger caliper pistons push with about ${Math.round(AREA_RATIO)} times the force on the master piston. Friction turns the wheel’s energy of motion into heat.` +
          (variant === 'rear'
            ? ' Weight shifts forward under braking, so the rear tyre has less grip — modest pressure is enough before it locks.'
            : '')

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 480 230" className="w-full" role="img" aria-label={`${variant} disc brake, ${travel} percent applied`}>
          <g strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
            {variant === 'front' ? (
              <>
                {/* Handlebar grip and lever */}
                <line x1={14} y1={58} x2={118} y2={58} strokeWidth={14} className="stroke-surface-overlay" />
                <g transform={`rotate(${p * 14} 122 76)`}>
                  <path d="M122,76 L28,92" fill="none" strokeWidth={6} className="stroke-ignition-400" />
                </g>
                <circle cx={122} cy={76} r={4} className="fill-bg stroke-ink-subtle" />
              </>
            ) : (
              <>
                {/* Foot pedal and pushrod */}
                <g transform={`rotate(${-pedalAngle} 112 170)`}>
                  <path d="M112,170 L32,150 M24,144 L40,156" fill="none" strokeWidth={6} className="stroke-ignition-400" />
                </g>
                <circle cx={112} cy={170} r={4} className="fill-bg stroke-ink-subtle" />
                <line x1={arm.x} y1={arm.y} x2={pistonX} y2={90} strokeWidth={3} className="stroke-ink-subtle" />
              </>
            )}

            {/* Master cylinder with reservoir */}
            <rect x={140} y={54} width={40} height={22} rx={3} className="fill-surface-raised stroke-line-strong" />
            <rect x={120} y={76} width={82} height={28} rx={4} className="fill-surface-raised stroke-line-strong" />
            <rect x={pistonX + 16} y={80} width={202 - pistonX - 20} height={20} className="fill-coolant-400" style={{ opacity: 0.15 + 0.6 * pressure }} />
            <rect x={pistonX} y={80} width={16} height={20} rx={2} className="fill-surface-overlay stroke-coolant-400" />

            {/* Hose */}
            <path d="M202,90 C262,90 300,44 372,60" fill="none" strokeWidth={8} className="stroke-surface-overlay" />
            <path d="M202,90 C262,90 300,44 372,60" fill="none" strokeWidth={3} className="stroke-coolant-400" style={{ opacity: 0.2 + 0.8 * pressure }} />

            {/* Caliper body */}
            <rect x={350} y={56} width={90} height={80} rx={8} className="fill-surface-raised stroke-line-strong" />
            {/* Disc, edge-on */}
            <rect x={DISC_X} y={24} width={DISC_W} height={190} rx={2} className="fill-ink-subtle" />
            <rect x={DISC_X} y={70} width={DISC_W} height={52} className="fill-caution-400" style={{ opacity: pressure * 0.6 }} />
            {/* Pistons and pads, both sides */}
            <rect x={358 + padMove} y={74} width={18} height={44} rx={2} className="fill-surface-overlay stroke-coolant-400" />
            <rect x={DISC_X - CLEARANCE - 10 + padMove} y={70} width={10} height={52} rx={1.5} className="fill-coolant-950 stroke-coolant-300" />
            <rect x={DISC_X + DISC_W + CLEARANCE - padMove} y={70} width={10} height={52} rx={1.5} className="fill-coolant-950 stroke-coolant-300" />
            <rect x={DISC_X + DISC_W + CLEARANCE + 10 - padMove} y={74} width={18} height={44} rx={2} className="fill-surface-overlay stroke-coolant-400" />

            <DiagramLabel x={variant === 'front' ? 60 : 74} y={variant === 'front' ? 120 : 200} anchor="middle" tone="ignition">
              {variant === 'front' ? 'Lever (right hand)' : 'Pedal (right foot)'}
            </DiagramLabel>
            <DiagramLabel x={161} y={46} anchor="middle">Master cylinder</DiagramLabel>
            <DiagramLabel x={286} y={46} anchor="middle">Hose</DiagramLabel>
            <DiagramLabel x={395} y={160} anchor="middle" tone="coolant">Caliper &amp; pads</DiagramLabel>
            <DiagramLabel x={408} y={210}>Disc</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <Slider
            label={variant === 'front' ? 'Squeeze the lever' : 'Press the pedal'}
            value={travel}
            onChange={setTravel}
            valueText={`${travel} %`}
          />
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Meter label="Fluid pressure" value={pressure} />
            <Meter label="Clamping force" value={pressure} tone="ok" />
            <dl>
              <Readout label="Hydraulic multiplication" value={`≈ ${AREA_RATIO.toFixed(1)} ×`} tone="coolant" />
            </dl>
          </div>
        </>
      }
      status={status}
    />
  )
}

export function FrontBrakeDiagram() {
  return <BrakeDiagram variant="front" />
}

export function RearBrakeDiagram() {
  return <BrakeDiagram variant="rear" />
}
