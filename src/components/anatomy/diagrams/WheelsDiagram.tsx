import { useState } from 'react'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { DiagramFrame, DiagramLabel } from '../DiagramFrame'

/*
 * Tyre cross-section and contact patch at lean.
 *
 * A motorcycle tyre's tread has a round profile. Treating the crown as a circular arc of
 * radius R, the tyre leans by rolling around the arc's centre, which stays a height R
 * above the road; the contact patch is always directly beneath that centre. So at lean
 * angle θ the patch sits an arc length R·θ from the tread centre. Drawn 1 unit = 1 mm.
 */

const GROUND_Y = 215
const CROWN_R = 60
const O = { x: 140, y: GROUND_Y - CROWN_R }
const TREAD_HALF_ANGLE = 55
const STRIP = { x: 300, y: 70, w: 150, h: 130 }
/** Arc length of the whole tread, mm, mapped onto the strip width. */
const TREAD_ARC = CROWN_R * ((2 * TREAD_HALF_ANGLE * Math.PI) / 180)

const at = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return `${(r * Math.sin(a)).toFixed(2)},${(r * Math.cos(a)).toFixed(2)}`
}

const TREAD = `M${at(CROWN_R, -TREAD_HALF_ANGLE)} A${CROWN_R},${CROWN_R} 0 0 0 ${at(CROWN_R, TREAD_HALF_ANGLE)}`
const PROFILE =
  `M-44,-38 C-60,-24 -62,8 ${at(CROWN_R, -TREAD_HALF_ANGLE)} ` +
  `A${CROWN_R},${CROWN_R} 0 0 0 ${at(CROWN_R, TREAD_HALF_ANGLE)} C62,8 60,-24 44,-38`
const CARCASS =
  `M-40,-36 C-54,-22 -55,6 ${at(CROWN_R - 7, -TREAD_HALF_ANGLE)} ` +
  `A${CROWN_R - 7},${CROWN_R - 7} 0 0 0 ${at(CROWN_R - 7, TREAD_HALF_ANGLE)} C55,6 54,-22 40,-36`

export default function WheelsDiagram() {
  const [lean, setLean] = useState(0)
  const offsetMm = CROWN_R * ((lean * Math.PI) / 180)
  // The tyre is rotated clockwise by `lean`; the tread point that ends up on the road is at +lean in tyre coordinates.
  const patch = `M${at(CROWN_R, lean - 9)} A${CROWN_R},${CROWN_R} 0 0 0 ${at(CROWN_R, lean + 9)}`
  const patchX = STRIP.x + STRIP.w / 2 + (offsetMm / TREAD_ARC) * STRIP.w

  const status =
    lean === 0
      ? 'Upright: the contact patch sits in the centre of the tread. It is only about the size of your palm, yet it carries every driving, braking and steering force.'
      : `Leaned ${lean}°: the round profile lets the tyre roll onto its shoulder, so the patch moves about ${Math.round(offsetMm)} mm towards the edge while keeping a similar size and shape — this is why motorcycle tyres are round, not flat like a car’s.` +
        (lean >= 35 ? ' Around this angle the footpegs or stand of many commuter motorcycles start to scrape the road.' : '')

  return (
    <DiagramFrame
      stage={
        <svg viewBox="0 0 480 250" className="w-full" role="img" aria-label={`Tyre cross-section leaned ${lean} degrees`}>
          <g strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
            <line x1={10} y1={GROUND_Y} x2={270} y2={GROUND_Y} strokeWidth={2} className="stroke-line-strong" />
            <line x1={O.x} y1={GROUND_Y} x2={O.x} y2={30} strokeDasharray="4 4" className="stroke-line-strong" />

            <g transform={`translate(${O.x} ${O.y}) rotate(${lean})`}>
              <line x1={0} y1={-150} x2={0} y2={-52} strokeWidth={8} className="stroke-line-strong" />
              {/* Rim */}
              <path d="M-50,-36 L-44,-38 L-44,-52 L44,-52 L44,-38 L50,-36" fill="none" strokeWidth={3} className="stroke-ink-subtle" />
              {/* Tyre */}
              <path d={PROFILE} className="fill-surface-raised stroke-line-strong" strokeWidth={2} />
              <path d={CARCASS} fill="none" strokeDasharray="5 3" className="stroke-coolant-600" />
              <path d={TREAD} fill="none" strokeWidth={5} className="stroke-surface-overlay" />
              {[-40, -20, 0, 20, 40].map((a) => {
                const [x1, y1] = at(CROWN_R - 5, a).split(',')
                const [x2, y2] = at(CROWN_R, a).split(',')
                return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2} className="stroke-bg" />
              })}
              <path d={patch} fill="none" strokeWidth={6} className="stroke-coolant-300" />
              <circle r={2.5} className="fill-ink-subtle" />
            </g>

            {lean > 0 && (
              <path
                d={`M${O.x},${O.y - 70} A70,70 0 0 1 ${O.x + 70 * Math.sin((lean * Math.PI) / 180)},${O.y - 70 * Math.cos((lean * Math.PI) / 180)}`}
                fill="none"
                className="stroke-ignition-400"
              />
            )}

            {/* Top view of the tread with the contact patch */}
            <rect x={STRIP.x} y={STRIP.y} width={STRIP.w} height={STRIP.h} rx={10} className="fill-surface-raised stroke-line-strong" />
            <line x1={STRIP.x + STRIP.w / 2} x2={STRIP.x + STRIP.w / 2} y1={STRIP.y} y2={STRIP.y + STRIP.h} strokeDasharray="4 4" className="stroke-line-strong" />
            <ellipse cx={patchX} cy={STRIP.y + STRIP.h / 2} rx={16} ry={30} className="fill-coolant-950 stroke-coolant-300" strokeWidth={2} />

            <DiagramLabel x={O.x} y={20} anchor="middle">Vertical</DiagramLabel>
            <DiagramLabel x={210} y={150}>Sidewall</DiagramLabel>
            <DiagramLabel x={O.x} y={GROUND_Y + 22} anchor="middle" tone="coolant">Contact patch</DiagramLabel>
            <DiagramLabel x={STRIP.x + STRIP.w / 2} y={STRIP.y - 10} anchor="middle">Tread, seen from below</DiagramLabel>
            <DiagramLabel x={STRIP.x} y={STRIP.y + STRIP.h + 18}>Edge</DiagramLabel>
            <DiagramLabel x={STRIP.x + STRIP.w / 2} y={STRIP.y + STRIP.h + 18} anchor="middle">Centre</DiagramLabel>
            <DiagramLabel x={STRIP.x + STRIP.w} y={STRIP.y + STRIP.h + 18} anchor="end">Edge</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Slider label="Lean angle" value={lean} onChange={setLean} max={45} valueText={`${lean}°`} className="flex-1" />
          <dl className="flex gap-5">
            <Readout label="Patch from centre" value={`≈ ${Math.round(offsetMm)} mm`} tone="coolant" />
          </dl>
        </div>
      }
      status={status}
    />
  )
}
