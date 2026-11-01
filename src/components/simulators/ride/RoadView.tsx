import { CAR_LENGTH, gradeAt, type Course } from '@/content/simulators/rideStop'
import { WHEELBASE } from '@/lib/mechanics/braking'

/*
 * The road around the motorcycle, to scale (10 px per metre), travelling left to right.
 * The view follows the motorcycle, which stays near the left so the road ahead is visible.
 * Heights are true to scale too, so a 5 % climb rises 5 m every 100 m.
 */

const W = 600
const H = 104
const PX = 10
const BIKE_X = 130
const ROAD_Y = 70
const BEHIND = BIKE_X / PX
const AHEAD = (W - BIKE_X) / PX

export interface Skid {
  wheel: 'front' | 'rear'
  from: number
  to: number
}

/** Height of the road above the start, m (the integral of the gradient). */
function elevation(hill: Course['hill'], d: number) {
  if (!hill || d <= hill.from) return 0
  const ramp = hill.to - hill.from
  const r = Math.min(d, hill.to) - hill.from
  const onRamp = (hill.grade * r * r) / (2 * ramp)
  return onRamp + (d > hill.to ? hill.grade * (d - hill.to) : 0)
}

export function RoadView({
  distance,
  course,
  leadPosition,
  leadBraking,
  skids,
}: {
  distance: number
  course?: Course
  leadPosition?: number
  leadBraking?: boolean
  skids: Skid[]
}) {
  const hill = course?.hill
  const x = (d: number) => BIKE_X + (d - distance) * PX
  const y = (d: number) => ROAD_Y - (elevation(hill, d) - elevation(hill, distance)) * PX
  const from = distance - BEHIND - 2
  const to = distance + AHEAD + 2
  const road: string[] = []
  for (let d = Math.floor(from); d <= to; d += 2) road.push(`${road.length ? 'L' : 'M'}${x(d).toFixed(1)},${y(d).toFixed(1)}`)
  const markers: number[] = []
  for (let m = Math.ceil(from / 10) * 10; m <= to; m += 10) if (m >= 0) markers.push(m)
  const tilt = (d: number) => (-Math.atan(gradeAt(hill, d)) * 180) / Math.PI
  const toGo = course?.stopLine ?? course?.zone?.at ?? course?.finish

  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Road view: ${distance.toFixed(0)} m travelled${toGo !== undefined ? `, ${Math.max(0, toGo - distance).toFixed(0)} m to go` : ''}`}>
        <path d={`${road.join(' ')} L${x(to)},${H} L${x(from)},${H} Z`} className="fill-surface-raised" />
        <path d={road.join(' ')} fill="none" strokeWidth={2} className="stroke-line-strong" />
        {hill && distance + AHEAD > hill.from && x(hill.from) < W && (
          <text x={Math.max(8, x(hill.from))} y={y(hill.from) + 24} className="fill-ink-subtle text-[10px]">
            {`Climb begins · ${Math.round(hill.grade * 100)} %`}
          </text>
        )}

        {markers.map((m) => (
          <g key={m}>
            <line x1={x(m)} x2={x(m)} y1={y(m)} y2={y(m) + 6} strokeWidth={1.5} className="stroke-ink-subtle" />
            <text x={x(m)} y={y(m) + 18} textAnchor="middle" className="tabular fill-ink-subtle font-mono text-[9px]">
              {m} m
            </text>
          </g>
        ))}

        {skids.map((s, i) => (
          <line key={i} x1={x(s.from)} x2={x(s.to)} y1={y(s.from) - (s.wheel === 'front' ? 1 : 0)} y2={y(s.to) - (s.wheel === 'front' ? 1 : 0)} strokeWidth={3} className={s.wheel === 'front' ? 'stroke-danger-400' : 'stroke-caution-400'} />
        ))}

        {course?.stopLine !== undefined && (
          <g>
            <line x1={x(course.stopLine)} x2={x(course.stopLine)} y1={y(course.stopLine) - 2} y2={y(course.stopLine) + 8} strokeWidth={4} className="stroke-ink" />
            <rect x={x(course.stopLine - 3)} y={y(course.stopLine) - 3} width={3 * PX} height={3} className="fill-ok-500/40" />
            <text x={x(course.stopLine)} y={y(course.stopLine) - 50} textAnchor="middle" className="fill-ink text-[10px] font-semibold">
              STOP
            </text>
            <line x1={x(course.stopLine)} x2={x(course.stopLine)} y1={y(course.stopLine) - 44} y2={y(course.stopLine) - 4} strokeWidth={1} strokeDasharray="2 3" className="stroke-ink-subtle" />
          </g>
        )}
        {course?.finish !== undefined && (
          <g>
            <line x1={x(course.finish)} x2={x(course.finish)} y1={y(course.finish) - 44} y2={y(course.finish) + 8} strokeWidth={2} strokeDasharray="4 3" className="stroke-ink" />
            <text x={x(course.finish)} y={y(course.finish) - 50} textAnchor="middle" className="fill-ink text-[10px] font-semibold">
              FINISH
            </text>
          </g>
        )}
        {course?.zone && (
          <g transform={`translate(${x(course.zone.at)},${y(course.zone.at)})`}>
            <line x1={0} x2={0} y1={0} y2={-34} strokeWidth={2} className="stroke-ink-subtle" />
            <circle cx={0} cy={-44} r={11} strokeWidth={3} className="fill-surface stroke-danger-400" />
            <text x={0} y={-40.5} textAnchor="middle" className="tabular fill-ink font-mono text-[10px] font-semibold">
              {course.zone.kmh}
            </text>
          </g>
        )}

        {leadPosition !== undefined && (
          <g transform={`translate(${x(leadPosition)},${y(leadPosition)}) rotate(${tilt(leadPosition)})`}>
            <path d={`M0,-5 L0,-13 L8,-14 L13,-21 L30,-21 L36,-13 L${CAR_LENGTH * PX},-12 L${CAR_LENGTH * PX},-5 Z`} className="fill-surface-overlay stroke-ink-muted" strokeWidth={1.5} />
            <circle cx={8} cy={-4} r={4} className="fill-ink-muted" />
            <circle cx={32} cy={-4} r={4} className="fill-ink-muted" />
            <rect x={-1.5} y={-12} width={3} height={4} rx={1} className={leadBraking ? 'fill-danger-400' : 'fill-line-strong'} />
          </g>
        )}

        {/* The motorcycle: front wheel at the travelled distance */}
        <g transform={`translate(${BIKE_X},${ROAD_Y}) rotate(${tilt(distance)})`}>
          <circle cx={-WHEELBASE * PX} cy={-3} r={3} className="fill-ink" />
          <circle cx={0} cy={-3} r={3} className="fill-ink" />
          <path d={`M${-WHEELBASE * PX},-3 L-8,-8 L-1,-11 L0,-3`} fill="none" strokeWidth={2} className="stroke-ink" />
          <circle cx={-7} cy={-17} r={2.5} className="fill-ignition-400" />
          <path d="M-7,-15 L-8,-9" strokeWidth={2} className="stroke-ignition-400" />
        </g>
      </svg>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span>To scale · 10 m between markers</span>
        {course?.stopLine !== undefined && (
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-4 bg-ok-500/40" aria-hidden /> Stop zone (3 m before the line)
          </span>
        )}
        {skids.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-caution-400" aria-hidden /> Skid marks
          </span>
        )}
      </figcaption>
    </figure>
  )
}
