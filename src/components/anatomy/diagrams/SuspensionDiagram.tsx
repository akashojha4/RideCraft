import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { Meter, Readout } from '@/components/simulation/Readouts'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { DiagramFrame, DiagramLabel } from '../DiagramFrame'

/*
 * Cross-section of one telescopic fork leg. The stanchion is fixed to the motorcycle;
 * the slider and axle move up with the wheel.
 *
 * "Ride over a bump" compresses the fork quickly, then lets it return as a mass on a
 * spring (stiffness k = 160, mass 1). With the damper on, damping ≈ 2√k (critical
 * damping): one smooth return. With it off, only a little friction remains, so the fork
 * oscillates for a long time — which is why every suspension needs a damper.
 * Negative compression means extending past the resting position on the rebound.
 */

const TRAVEL_PX = 70
const TRAVEL_MM = 120
const STIFFNESS = 160
const CAP_Y = 32
const ROD_LENGTH = 136
const SLIDER_BOTTOM = 266

function springPath(top: number, bottom: number, coils = 8, amp = 15) {
  const step = (bottom - top) / (coils * 2)
  let d = `M200,${top}`
  for (let i = 1; i < coils * 2; i++) d += ` L${200 + (i % 2 ? amp : -amp)},${top + i * step}`
  return `${d} L200,${bottom}`
}

export default function SuspensionDiagram() {
  const compression = useMotionValue(0)
  const [c, setC] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [damper, setDamper] = useState(true)
  const running = useRef<ReturnType<typeof animate> | null>(null)

  useMotionValueEvent(compression, 'change', (v) => {
    setC(v)
    setVelocity(compression.getVelocity())
  })

  const lift = useTransform(compression, (v) => -Math.max(-0.35, Math.min(1, v)) * TRAVEL_PX)
  const spring = springPath(CAP_Y, SLIDER_BOTTOM - ROD_LENGTH - 6 - Math.max(-0.35, Math.min(1, c)) * TRAVEL_PX)

  const stop = () => running.current?.stop()
  const bump = async () => {
    stop()
    running.current = animate(compression, 0.85, { duration: 0.12, ease: 'easeOut' })
    await running.current
    running.current = animate(compression, 0, {
      type: 'spring',
      stiffness: STIFFNESS,
      damping: damper ? 2 * Math.sqrt(STIFFNESS) : 1.5,
      velocity: 0,
      restDelta: 0.002,
    })
    await running.current
    setVelocity(0)
  }
  const setManual = (v: number) => {
    stop()
    compression.set(v / 100)
    setVelocity(0)
  }

  const springForce = Math.max(0, c)
  const dampingForce = damper ? Math.min(1, Math.abs(velocity) / 8) : 0
  const travelMm = Math.round(c * TRAVEL_MM)

  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 0 400 300" className="mx-auto w-full max-w-md" role="img" aria-label={`Fork leg compressed ${Math.max(0, travelMm)} millimetres`}>
          <g strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
            {/* Fixed to the motorcycle */}
            <rect x={140} y={38} width={120} height={12} rx={3} className="fill-surface-raised stroke-line-strong" />
            <rect x={178} y={20} width={44} height={180} rx={3} className="fill-surface-sunken stroke-ink-subtle" strokeWidth={2} />
            <rect x={176} y={18} width={48} height={14} rx={3} className="fill-surface-overlay stroke-ink-subtle" />
            <path d={spring} fill="none" strokeWidth={2.5} className="stroke-ink-muted" />

            {/* Moves with the wheel */}
            <motion.g style={{ y: lift }}>
              <rect x={168} y={150} width={64} height={120} rx={6} className="fill-surface-raised/70 stroke-line-strong" strokeWidth={2} />
              <rect x={172} y={206} width={56} height={60} className="fill-coolant-400/20" />
              <rect x={166} y={146} width={68} height={6} rx={2} className="fill-surface-overlay stroke-ink-subtle" />
              <line x1={200} y1={SLIDER_BOTTOM} x2={200} y2={SLIDER_BOTTOM - ROD_LENGTH} strokeWidth={5} className="stroke-coolant-400" />
              <rect x={182} y={SLIDER_BOTTOM - ROD_LENGTH - 6} width={36} height={8} rx={2} className="fill-coolant-950 stroke-coolant-400" />
              {[190, 200, 210].map((x) => (
                <circle key={x} cx={x} cy={SLIDER_BOTTOM - ROD_LENGTH - 2} r={1.6} className="fill-bg" />
              ))}
              <circle cx={200} cy={280} r={11} className="fill-surface-overlay stroke-ink-subtle" strokeWidth={2} />
              <path d="M120,292 L280,292" strokeWidth={3} className="stroke-line-strong" />
            </motion.g>
            <path d="M40,292 L110,292 M290,292 L440,292" strokeWidth={3} className="stroke-line-strong" />

            <DiagramLabel x={268} y={48}>To frame (fixed)</DiagramLabel>
            <DiagramLabel x={236} y={96}>Spring</DiagramLabel>
            <DiagramLabel x={236} y={186}>Stanchion</DiagramLabel>
            <motion.g style={{ y: lift }}>
              <DiagramLabel x={240} y={226} tone="coolant">Damper rod &amp; oil</DiagramLabel>
              <DiagramLabel x={240} y={262}>Slider</DiagramLabel>
              <DiagramLabel x={160} y={284} anchor="end">Axle</DiagramLabel>
            </motion.g>
          </g>
        </svg>
      }
      controls={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={bump}>
              Ride over a bump
            </Button>
            <div role="group" aria-label="Damper" className="flex rounded-xl border border-line bg-surface-sunken p-0.5">
              {[true, false].map((on) => (
                <button
                  key={String(on)}
                  type="button"
                  aria-pressed={damper === on}
                  onClick={() => setDamper(on)}
                  className={cn(
                    'h-7 rounded-[10px] px-3 text-xs font-medium transition-colors',
                    damper === on ? 'bg-surface-overlay text-ink' : 'text-ink-subtle hover:text-ink',
                  )}
                >
                  Damper {on ? 'on' : 'off'}
                </button>
              ))}
            </div>
          </div>
          <Slider
            label="Compress the fork"
            value={Math.round(Math.max(0, Math.min(1, c)) * 100)}
            onChange={setManual}
            valueText={`${Math.max(0, travelMm)} of ${TRAVEL_MM} mm`}
          />
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <Meter label="Spring force" value={springForce} />
            <Meter label="Damping force" value={dampingForce} tone="ok" valueText={damper ? undefined : 'off'} />
            <dl>
              <Readout label="Travel" value={travelMm < 0 ? `+${-travelMm} mm ext.` : `${travelMm} mm`} tone="coolant" />
            </dl>
          </div>
        </>
      }
      status={
        damper
          ? 'The spring stores the bump’s energy and pushes back in proportion to how far it is compressed. The damper forces oil through small holes in the piston, resisting movement in proportion to its speed — so after a bump the fork returns once, smoothly.'
          : 'Damper off: nothing absorbs the spring’s stored energy, so after a bump the fork keeps bouncing. On a real motorcycle the tyre would skip and lose grip. Turn the damper back on and compare.'
      }
    />
  )
}
