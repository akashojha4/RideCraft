import { useMotionValueEvent } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { RearView } from '@/components/handling/RearView'
import { TopBike } from '@/components/handling/TopBike'
import { PlaybackControls } from '@/components/simulation/PlaybackControls'
import { Readout } from '@/components/simulation/Readouts'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { useSimulationClock } from '@/hooks/useSimulationClock'
import { cn } from '@/lib/cn'
import { deg, ms, rad, riderSteer, stepLean, uprightState, type LeanState } from '@/lib/mechanics/cornering'

/*
 * Handling lesson 3: countersteering, simulated with the point-mass lean model in
 * cornering.ts. The rider's steering follows the instinct every rider has — keep the
 * cornering force matched to the lean, and correct towards the lean you want — which
 * starts every turn with a brief steer the *other* way. "Steer like a bicycle" instead turns
 * the bars towards the turn and holds them there: the motorcycle falls to the outside.
 */

type Mode = 'right' | 'left' | 'naive'
const TARGET = 20
const DURATION = 7
const DT = 0.002
const STEER_ZOOM = 5

interface Sample {
  t: number
  steer: number
  lean: number
  x: number
  y: number
}

function useLeanSim(kmh: number) {
  const clock = useSimulationClock()
  const sim = useRef({ s: uprightState(), t: 0, mode: null as Mode | null, phase: 'ready' as 'ready' | 'turning' | 'exiting' | 'done' | 'fallen', history: [] as Sample[] })
  const [snap, setSnap] = useState(() => ({ s: uprightState(), t: 0, mode: null as Mode | null, phase: 'ready' as string, history: [] as Sample[] }))
  const last = useRef(0)

  const publish = useCallback(() => {
    const r = sim.current
    setSnap({ s: r.s, t: r.t, mode: r.mode, phase: r.phase, history: r.history.slice() })
  }, [])

  useMotionValueEvent(clock.time, 'change', (now) => {
    const r = sim.current
    const dt = Math.min(0.1, now - last.current)
    last.current = now
    if (!r.mode || dt <= 0 || r.phase === 'done' || r.phase === 'fallen') return
    const v = ms(kmh)
    const dir = r.mode === 'left' ? -1 : 1
    for (let i = 0; i < Math.ceil(dt / DT); i++) {
      let delta: number
      if (r.mode === 'naive') delta = r.t < 0.4 ? 0 : rad(1.5) * Math.min(1, (r.t - 0.4) / 0.2)
      else {
        if (r.phase === 'turning' && Math.abs(deg(r.s.psi)) >= 80) r.phase = 'exiting'
        const target = r.t < 0.4 || r.phase === 'exiting' ? 0 : rad(TARGET) * dir
        delta = riderSteer(r.s, target, v)
      }
      r.s = stepLean(r.s, delta, v, DT)
      r.t += DT
      if (Math.abs(r.s.phi) > rad(45)) {
        r.phase = 'fallen'
        break
      }
      if (r.t >= DURATION) {
        r.phase = 'done'
        break
      }
    }
    if (!r.history.length || r.t - r.history[r.history.length - 1].t >= 0.03) r.history.push({ t: r.t, steer: deg(r.s.delta), lean: deg(r.s.phi), x: r.s.x, y: r.s.y })
    publish()
    if (r.phase === 'done' || r.phase === 'fallen') clock.pause()
  })

  const start = (mode: Mode) => {
    sim.current = { s: uprightState(), t: 0, mode, phase: 'turning', history: [] }
    last.current = clock.time.get()
    publish()
    clock.play()
  }
  const reset = () => {
    clock.pause()
    sim.current = { s: uprightState(), t: 0, mode: null, phase: 'ready', history: [] }
    publish()
  }
  return { clock, snap, start, reset }
}

/** Small time chart of one series (deg), with a zero line. */
function MiniChart({ samples, pick, range, label, tone }: { samples: Sample[]; pick: (s: Sample) => number; range: number; label: string; tone: string }) {
  const W = 220
  const H = 70
  const x = (t: number) => 28 + (t / DURATION) * (W - 34)
  const y = (v: number) => H / 2 - (Math.max(-range, Math.min(range, v)) / range) * (H / 2 - 8)
  const d = samples.map((s, i) => `${i ? 'L' : 'M'}${x(s.t).toFixed(1)},${y(pick(s)).toFixed(1)}`).join(' ')
  const lastS = samples[samples.length - 1]
  return (
    <figure>
      <figcaption className="mb-1 flex justify-between text-xs text-ink-muted">
        <span>{label}</span>
        <span className="tabular font-mono">{lastS ? `${pick(lastS).toFixed(1)}°` : '—'}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden>
        <line x1={28} x2={W - 6} y1={H / 2} y2={H / 2} strokeWidth={1} className="stroke-line-strong" />
        <text x={24} y={y(range) + 3} textAnchor="end" className="tabular fill-ink-subtle font-mono text-[8px]">{`+${range}`}</text>
        <text x={24} y={y(-range) + 3} textAnchor="end" className="tabular fill-ink-subtle font-mono text-[8px]">{`−${range}`}</text>
        <text x={W - 6} y={H - 1} textAnchor="end" className="fill-ink-subtle text-[8px]">{`${DURATION} s`}</text>
        <path d={d} fill="none" strokeWidth={2} strokeLinejoin="round" className={tone} />
      </svg>
    </figure>
  )
}

export default function Countersteer() {
  const [kmh, setKmh] = useState(50)
  const { clock, snap, start, reset } = useLeanSim(kmh)
  const { s, history, mode, phase } = snap
  const steer = deg(s.delta)
  const lean = deg(s.phi)
  const firstSteer = history.find((h) => Math.abs(h.steer) > 0.05)

  // Path view, fitted to the trajectory so far.
  const pts = history.length ? history : [{ x: 0, y: 0 } as Sample]
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const span = Math.max(20, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
  const k = 150 / span
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2
  const px = (p: { x: number; y: number }) => ({ x: 90 + (p.x - cx) * k, y: 95 - (p.y - cy) * k })
  const path = history.map((p, i) => `${i ? 'L' : 'M'}${px(p).x.toFixed(1)},${px(p).y.toFixed(1)}`).join(' ')
  const end = px(s as LeanState)

  const status =
    phase === 'ready'
      ? 'Choose a turn. Watch the steering trace: which way does the front wheel point first?'
      : mode === 'naive'
        ? phase === 'fallen'
          ? `The bars were turned right and held. The front wheel pushed the tyres right, out from under the centre of mass, so the motorcycle fell to the LEFT — the outside of the turn — reaching 45° in ${snap.t.toFixed(1)} s. Above walking pace you can’t start a turn by steering towards it.`
          : 'Turning the handlebar towards the turn, like a child’s bicycle…'
        : firstSteer && Math.sign(firstSteer.steer) !== (mode === 'left' ? -1 : 1) && phase !== 'exiting' && phase !== 'done' && Math.abs(lean) < 5
          ? `Countersteer: the rider presses the ${mode} handlebar forward, so the front wheel points ${mode === 'right' ? 'left' : 'right'} (${Math.abs(steer).toFixed(1)}°). The tyres run out from under the motorcycle and it starts to lean ${mode}.`
          : phase === 'exiting' || phase === 'done'
            ? `To finish the turn the rider presses the other handlebar: the steering briefly points further into the turn, the tyres move back under the motorcycle and it stands up again.`
            : `Leaning ${Math.abs(lean).toFixed(0)}° ${mode}, the front wheel now points into the turn by only ${Math.abs(steer).toFixed(1)}° — the steering just keeps the cornering force balanced with the lean. The countersteer lasted a fraction of a second, and it was the only way to start the lean.`

  return (
    <DiagramFrame
      stage={
        <div className="grid gap-3 sm:grid-cols-3">
          <svg viewBox="0 0 180 190" className="w-full" role="img" aria-label={`Rear view, leaning ${lean.toFixed(0)} degrees`}>
            <line x1={0} x2={180} y1={178} y2={178} strokeWidth={1.5} className="stroke-line-strong" />
            <RearView x={90} y={178} scale={95} lean={lean} />
            <DiagramLabel x={6} y={14}>From behind</DiagramLabel>
          </svg>
          <svg viewBox="0 0 180 190" className="w-full" role="img" aria-label={`Steering ${Math.abs(steer).toFixed(1)} degrees ${steer >= 0 ? 'right' : 'left'}`}>
            <TopBike x={90} y={115} scale={62} heading={0} steer={steer * STEER_ZOOM} />
            <DiagramLabel x={6} y={14}>From above</DiagramLabel>
            <DiagramLabel x={6} y={184}>{`steering shown ${STEER_ZOOM}× larger`}</DiagramLabel>
          </svg>
          <svg viewBox="0 0 180 190" className="w-full" role="img" aria-label="Path travelled">
            <path d={path} fill="none" strokeWidth={2} className="stroke-coolant-400" />
            <TopBike x={end.x} y={end.y} scale={8} heading={deg(s.psi)} />
            <DiagramLabel x={6} y={14}>Path</DiagramLabel>
            <DiagramLabel x={6} y={184}>{`${Math.round(span)} m across`}</DiagramLabel>
          </svg>
        </div>
      }
      controls={
        <>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={() => start('right')}>
              Turn right (countersteer)
            </Button>
            <Button size="sm" variant="secondary" onClick={() => start('left')}>
              Turn left (countersteer)
            </Button>
            <Button size="sm" variant="secondary" onClick={() => start('naive')}>
              Steer right like a bicycle
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MiniChart samples={history} pick={(h) => h.steer} range={kmh < 35 ? 6 : 2} label="Front wheel steer (+ right)" tone="stroke-ignition-400" />
            <MiniChart samples={history} pick={(h) => h.lean} range={45} label="Lean (+ right)" tone="stroke-coolant-400" />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <Slider
              className="min-w-56 flex-1"
              label="Speed"
              value={kmh}
              onChange={(v) => {
                setKmh(v)
                reset()
              }}
              min={20}
              max={80}
              valueText={`${kmh} km/h`}
              tone="coolant"
            />
            <PlaybackControls clock={clock} onReset={reset} showPlay={mode !== null && phase !== 'done' && phase !== 'fallen'} />
          </div>
          <dl className={cn('grid grid-cols-3 gap-4')}>
            <Readout label="First steer" value={firstSteer ? `${Math.abs(firstSteer.steer) < 0.05 ? '—' : firstSteer.steer > 0 ? 'Right' : 'Left'}` : '—'} tone={firstSteer && mode !== 'naive' ? 'caution' : 'ink'} />
            <Readout label="Steer now" value={`${Math.abs(steer).toFixed(2)}° ${steer > 0.01 ? 'R' : steer < -0.01 ? 'L' : ''}`} />
            <Readout label="Lean now" value={`${Math.abs(lean).toFixed(1)}° ${lean > 0.05 ? 'R' : lean < -0.05 ? 'L' : ''}`} tone={phase === 'fallen' ? 'danger' : 'coolant'} />
          </dl>
        </>
      }
      status={status}
    />
  )
}
