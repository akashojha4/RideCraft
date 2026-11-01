import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { buildPath, sampleAt, timeline, toPathD } from '@/components/handling/path'
import { TopBike } from '@/components/handling/TopBike'
import { useLoopTime } from '@/components/handling/useLoopTime'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { WHEELBASE } from '@/lib/mechanics/braking'
import { CLEARANCE_LEAN, STEERING_LOCK, deg, leanFor, ms, rad, radiusFor } from '@/lib/mechanics/cornering'

/*
 * Handling lesson 5: the U-turn, from above. At walking pace the handlebar angle sets the
 * turn: radius ≈ wheelbase / tan(steer) — 1.7 m at this motorcycle's 38° lock. Riding
 * faster at that radius needs more lean (tan = v²/gR); beyond the 40° clearance limit the
 * motorcycle can't lean further and the turn widens to R = v² / (g·tan 40°). The U-turn
 * fits if its diameter plus a margin fits between the kerbs.
 */

const K = 26
const START_OFFSET = 0.9
const MARGIN = 0.4
const LEAD = 5

export default function UTurn() {
  const [width, setWidth] = useState(7)
  const [kmh, setKmh] = useState(8)
  const [lockPct, setLockPct] = useState(100)
  const v = ms(kmh)
  const steer = (STEERING_LOCK * lockPct) / 100
  const rSteer = WHEELBASE / Math.tan(rad(steer))
  const leanAtSteer = leanFor(v, rSteer)
  const tooFast = leanAtSteer > CLEARANCE_LEAN
  const r = tooFast ? radiusFor(v, CLEARANCE_LEAN) : rSteer
  const lean = Math.min(leanAtSteer, CLEARANCE_LEAN)
  const needed = START_OFFSET + 2 * r + MARGIN
  const fits = needed <= width

  const left = -width / 2
  const samples = (() => {
    const path = buildPath({ x: left + START_OFFSET, y: 0, heading: 0 }, [
      { type: 'straight', length: LEAD },
      { type: 'arc', radius: r, angle: 180 },
      { type: 'straight', length: LEAD },
    ])
    return timeline(path, () => v)
  })()
  const total = samples[samples.length - 1].t
  const { clock, t } = useLoopTime(total)
  const now = sampleAt(samples, t)

  const viewW = 12
  const cx = 230
  const map = (p: { x: number; y: number }) => ({ x: cx + p.x * K, y: 300 - p.y * K })
  const top = Math.max(LEAD + 2 * r + 1, 9)
  const kerbX = (x: number) => cx + x * K
  const over = samples.filter((p) => p.x > width / 2 - MARGIN / 2)

  return (
    <DiagramFrame
      stage={
        <svg viewBox={`${cx - (viewW / 2) * K} ${300 - top * K - 10} ${viewW * K} ${top * K + 30}`} className="mx-auto w-full max-w-md" role="img" aria-label={`U-turn on a ${width} m road: needs ${needed.toFixed(1)} m, ${fits ? 'fits' : 'does not fit'}`}>
          <rect x={kerbX(-width / 2)} y={300 - top * K - 10} width={width * K} height={top * K + 30} className="fill-surface-overlay" />
          {[-width / 2, width / 2].map((x) => (
            <line key={x} x1={kerbX(x)} x2={kerbX(x)} y1={300 - top * K - 10} y2={320} strokeWidth={4} className="stroke-ink-subtle" />
          ))}
          <line x1={kerbX(0)} x2={kerbX(0)} y1={300 - top * K - 10} y2={320} strokeWidth={2} strokeDasharray="10 10" className="stroke-line-strong" />
          <path d={toPathD(samples, map)} fill="none" strokeWidth={2} strokeDasharray="5 4" className={fits ? 'stroke-coolant-400' : 'stroke-caution-400'} />
          {over.length > 0 && <path d={toPathD(over, map)} fill="none" strokeWidth={4} className="stroke-danger-400" />}
          <TopBike x={map(now).x} y={map(now).y} scale={K} heading={now.heading} steer={now.curvature ? deg(Math.atan(WHEELBASE / r)) : 0} />
          <DiagramLabel x={kerbX(-width / 2) + 4} y={312}>kerb</DiagramLabel>
          <DiagramLabel x={kerbX(width / 2) - 4} y={312} anchor="end">kerb</DiagramLabel>
        </svg>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-3">
            <Slider label="Road width" value={width} onChange={setWidth} min={4} max={10} valueText={`${width} m`} tone="coolant" />
            <Slider label="Speed" value={kmh} onChange={setKmh} min={3} max={15} valueText={`${kmh} km/h`} tone="coolant" />
            <Slider label="Handlebar turned" value={lockPct} onChange={setLockPct} min={40} max={100} valueText={lockPct === 100 ? 'full lock' : `${Math.round(steer)}°`} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <dl className="flex flex-wrap gap-6">
              <Readout label="Turn diameter" value={`${(2 * r).toFixed(1)} m`} />
              <Readout label="Road needed" value={`${needed.toFixed(1)} m`} tone={fits ? 'ok' : 'danger'} />
              <Readout label="Lean" value={`${lean.toFixed(0)}°`} tone={tooFast ? 'danger' : 'ink'} />
            </dl>
            <PlaybackControls clock={clock} />
          </div>
        </>
      }
      status={
        !fits
          ? tooFast
            ? `Too fast: at ${kmh} km/h, a turn this tight would need ${leanAtSteer.toFixed(0)}° of lean — past the footpegs’ ${CLEARANCE_LEAN}°. The turn widens to ${(2 * r).toFixed(1)} m and you hit the far kerb. Slow to walking pace.`
            : `This U-turn needs ${needed.toFixed(1)} m and the road is ${width} m. ${lockPct < 100 ? 'Turn the handlebar further — all the way to the lock.' : 'Even at full lock it won’t fit: do a three-point turn, or push the motorcycle round.'}`
          : tooFast
            ? `At ${kmh} km/h a turn this tight would need ${leanAtSteer.toFixed(0)}° of lean — past the footpegs’ ${CLEARANCE_LEAN}° — so the turn widens to ${(2 * r).toFixed(1)} m. It still fits this road, but a U-turn belongs at walking pace: slow down and the turn tightens to ${(2 * rSteer).toFixed(1)} m.`
            : `It fits: ${(2 * r).toFixed(1)} m diameter on a ${width} m road. Start from the kerb side, slow to walking pace in first gear, turn the handlebar ${lockPct === 100 ? 'to full lock' : 'further'}, and turn your head to look where you’re going — back down the road. Keep the engine pulling gently with the clutch and control the speed with the rear brake, never the front.`
      }
    />
  )
}
