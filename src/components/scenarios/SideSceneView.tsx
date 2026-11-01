import type { Frame, SideScene } from '@/lib/scenarios/types'

/*
 * A scenario seen from the side, travelling left to right, to scale. The view follows the
 * motorcycle. Heights are drawn true to scale — a 12 % hill rises 12 m every 100 m — unless the
 * scene exaggerates them (a 10 cm speed breaker would otherwise be a couple of pixels high).
 */

const W = 560
const H = 260
const BIKE_X = 230
const GROUND_Y = 190

export function SideSceneView({ scene, frame }: { scene: SideScene; frame: Frame }) {
  const span = scene.span ?? 30
  const k = W / span
  const ex = scene.exaggerate ?? 1
  const { bike } = frame
  const bz = bike.z ?? scene.profile(bike.y)
  const sx = (d: number) => BIKE_X + (d - bike.y) * k
  const sy = (z: number) => GROUND_Y - (z - bz) * k * ex
  const from = bike.y - BIKE_X / k - 1
  const to = bike.y + (W - BIKE_X) / k + 1
  const pts: string[] = []
  for (let d = from; d <= to; d += 0.1) pts.push(`${sx(d).toFixed(1)},${sy(scene.profile(d)).toFixed(1)}`)
  const slope = (Math.atan((scene.profile(bike.y + 0.5) - scene.profile(bike.y - 0.5)) * ex) * 180) / Math.PI
  const markers: number[] = []
  for (let m = Math.ceil(from / 5) * 5; m <= to; m += 5) markers.push(m)
  const s = (v: number) => v * k
  const squash = (bike.squash ?? 0) * k

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl" role="img" aria-label={`Side view, ${Math.round(bike.v * 3.6)} km/h`}>
      <rect width={W} height={H} className="fill-surface-sunken" />
      <path d={`M${pts.join(' L')} L${W},${H} L0,${H} Z`} className="fill-surface-overlay" />
      <path d={`M${pts.join(' L')}`} fill="none" strokeWidth={2.5} className="stroke-ink-subtle" />
      {markers.map((m) => (
        <g key={m}>
          <line x1={sx(m)} x2={sx(m)} y1={sy(scene.profile(m))} y2={sy(scene.profile(m)) + 6} strokeWidth={1.5} className="stroke-ink-subtle" />
          <text x={sx(m)} y={sy(scene.profile(m)) + 18} textAnchor="middle" className="tabular fill-ink-subtle font-mono text-[9px]">
            {m} m
          </text>
        </g>
      ))}
      {ex !== 1 && (
        <text x={W - 10} y={20} textAnchor="end" className="fill-ink-subtle font-mono text-[10px]">
          {`heights shown ×${ex}`}
        </text>
      )}
      {scene.labels?.map((l) => (
        <text key={l.text} x={sx(l.d)} y={sy(scene.profile(l.d)) - 60} textAnchor="middle" className="fill-ink-muted text-[11px]">
          {l.text}
        </text>
      ))}

      {frame.actors.map((a) => {
        const z = scene.profile(a.y - 2)
        return (
          <g key={a.id} data-actor={a.kind} transform={`translate(${sx(a.y)},${sy(z)}) rotate(${-slope})`}>
            <path d={`M${-s(4.2)},${-s(0.35)} L${-s(4.2)},${-s(1.0)} L${-s(3.1)},${-s(1.05)} L${-s(2.5)},${-s(1.45)} L${-s(1.2)},${-s(1.45)} L${-s(0.6)},${-s(1.0)} L0,${-s(0.9)} L0,${-s(0.35)} Z`} className="fill-surface-raised stroke-ink-muted" strokeWidth={1.5} />
            <circle cx={-s(3.4)} cy={-s(0.32)} r={s(0.32)} className="fill-ink-muted" />
            <circle cx={-s(0.9)} cy={-s(0.32)} r={s(0.32)} className="fill-ink-muted" />
          </g>
        )
      })}

      {/* The motorcycle: front wheel at the travelled distance, pitched with the road and the suspension. */}
      <g transform={`translate(${sx(bike.y)},${sy(bz)}) rotate(${-slope - (bike.down ? 75 : 0) + bike.lean})`} data-bike strokeLinecap="round" strokeLinejoin="round">
        <circle cx={0} cy={-s(0.28)} r={s(0.28)} className="fill-none stroke-ink" strokeWidth={Math.max(2, s(0.05))} />
        <circle cx={-s(1.3)} cy={-s(0.28)} r={s(0.28)} className="fill-none stroke-ink" strokeWidth={Math.max(2, s(0.05))} />
        <g transform={`translate(0,${squash})`}>
          <path d={`M${-s(1.3)},${-s(0.28)} L${-s(0.85)},${-s(0.62)} L${-s(0.35)},${-s(0.62)} L${-s(0.12)},${-s(0.98)}`} fill="none" strokeWidth={Math.max(2, s(0.06))} className="stroke-ink-muted" />
          <line x1={0} y1={-s(0.28) - squash} x2={-s(0.12)} y2={-s(0.98)} strokeWidth={Math.max(2, s(0.05))} className="stroke-coolant-400" />
          <path d={`M${-s(1.2)},${-s(0.78)} L${-s(0.45)},${-s(0.82)}`} strokeWidth={Math.max(3, s(0.12))} className="stroke-surface-raised" />
          {/* Rider */}
          <path d={`M${-s(0.85)},${-s(0.85)} L${-s(0.62)},${-s(1.45)}`} strokeWidth={Math.max(4, s(0.16))} className="stroke-ignition-500" />
          <path d={`M${-s(0.62)},${-s(1.38)} L${-s(0.18)},${-s(1.0)}`} strokeWidth={Math.max(2, s(0.07))} className="stroke-ignition-400" />
          <path d={`M${-s(0.85)},${-s(0.85)} L${-s(0.5)},${-s(0.55)} L${-s(0.62)},${-s(0.3)}`} fill="none" strokeWidth={Math.max(3, s(0.1))} className="stroke-surface-overlay" />
          <circle cx={-s(0.58)} cy={-s(1.6)} r={s(0.13)} className="fill-surface-overlay stroke-ink-muted" strokeWidth={1.5} />
        </g>
        {bike.braking && !bike.down && <rect x={-s(1.62)} y={-s(0.85)} width={s(0.08)} height={s(0.08)} className="fill-danger-500" />}
      </g>
    </svg>
  )
}
