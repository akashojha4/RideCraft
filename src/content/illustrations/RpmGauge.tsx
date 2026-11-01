import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'
import { REDLINE_RPM } from '@/lib/mechanics/gearbox'

/*
 * Lesson 5: a rev counter and what an RPM figure means. The crank on the right turns at
 * the selected RPM slowed down 50 times; the readouts show the real rates. A single-
 * cylinder four-stroke makes one power stroke every two crankshaft revolutions.
 */

const MAX_RPM = 10000
const IDLE_RPM = 1400
const SLOWDOWN = 50
const START = -210
const SWEEP = 240
const C = { x: 150, y: 140 }
const R = 100

const angleFor = (rpm: number) => START + (rpm / MAX_RPM) * SWEEP
const point = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a) }
}
const arc = (r: number, from: number, to: number) => {
  const a = point(r, angleFor(from))
  const b = point(r, angleFor(to))
  const large = ((to - from) / MAX_RPM) * SWEEP > 180 ? 1 : 0
  return `M${a.x},${a.y} A${r},${r} 0 ${large} 1 ${b.x},${b.y}`
}

function zone(rpm: number) {
  if (rpm < 1300) return 'Below a typical idle: the engine would run roughly or stall.'
  if (rpm < 1800) return 'Idle: the engine is just keeping itself running, with the throttle closed and nothing to drive.'
  if (rpm < 4000) return 'Low revs: smooth, quiet and economical, but with less power available for accelerating.'
  if (rpm < 7500) return 'Mid range: the engine responds strongly to the throttle — good for accelerating and overtaking.'
  if (rpm < REDLINE_RPM) return 'High revs: close to maximum power on a small engine, with more noise, fuel use and wear.'
  return 'Redline: above the maximum safe engine speed. Parts can be damaged, so many engines cut the ignition with a rev limiter.'
}

export default function RpmGauge() {
  const [rpm, setRpm] = useState(IDLE_RPM)
  const crank = useMotionValue(0)
  const reduceMotion = useReducedMotion()

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return
    crank.set(crank.get() + (Math.min(delta, 100) / 1000) * (rpm / 60 / SLOWDOWN) * 360)
  })

  const needle = point(R - 14, angleFor(rpm))
  const over = rpm >= REDLINE_RPM

  return (
    <DiagramFrame
      stage={
        <svg viewBox="-6 20 456 220" className="w-full" role="img" aria-label={`Rev counter reading ${rpm} RPM`}>
          <g strokeLinecap="round" strokeLinejoin="round">
            <path d={arc(R, 0, MAX_RPM)} fill="none" strokeWidth={3} className="stroke-line-strong" />
            <path d={arc(R, REDLINE_RPM, MAX_RPM)} fill="none" strokeWidth={6} className="stroke-danger-500" />
            <path d={arc(R, 0, rpm)} fill="none" strokeWidth={3} className="stroke-coolant-400" />
            {Array.from({ length: 11 }, (_, i) => {
              const a = angleFor(i * 1000)
              const p1 = point(R - 6, a)
              const p2 = point(R - 16, a)
              const t = point(R - 30, a)
              return (
                <g key={i}>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} strokeWidth={2} className="stroke-ink-subtle" />
                  <text x={t.x} y={t.y + 4} textAnchor="middle" className="tabular fill-ink-muted font-mono text-[12px]">
                    {i}
                  </text>
                </g>
              )
            })}
            {(() => {
              const p = point(R + 10, angleFor(IDLE_RPM))
              return <DiagramLabel x={p.x - 4} y={p.y} anchor="end">Idle</DiagramLabel>
            })()}
            {(() => {
              const p = point(R + 12, angleFor(9500))
              return <DiagramLabel x={p.x + 4} y={p.y + 4}>Redline</DiagramLabel>
            })()}
            <line x1={C.x} y1={C.y} x2={needle.x} y2={needle.y} strokeWidth={4} className={over ? 'stroke-danger-400' : 'stroke-ignition-500'} />
            <circle cx={C.x} cy={C.y} r={8} className="fill-surface-overlay stroke-ink-subtle" />
            <text x={C.x} y={C.y + 46} textAnchor="middle" className="fill-ink-subtle font-mono text-[10px]">
              ×1000 RPM
            </text>

            {/* Crankshaft, slowed down */}
            <motion.g style={{ x: 360, y: 120, rotate: crank }}>
              <circle r={48} className="fill-surface-raised stroke-coolant-600" strokeWidth={1.5} />
              <circle cx={0} cy={-30} r={9} className="fill-coolant-950 stroke-coolant-400" strokeWidth={2} />
              <circle r={8} className="fill-bg stroke-coolant-400" strokeWidth={2} />
            </motion.g>
            <DiagramLabel x={360} y={196} anchor="middle" tone="coolant">Crankshaft</DiagramLabel>
            <DiagramLabel x={360} y={212} anchor="middle">{`shown ${SLOWDOWN}× slower`}</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <Slider label="Engine speed" value={rpm} onChange={setRpm} min={1000} max={MAX_RPM} step={100} valueText={`${rpm.toLocaleString('en')} RPM`} />
          <dl className="grid grid-cols-3 gap-4">
            <Readout label="Revolutions / s" value={(rpm / 60).toFixed(1)} tone="coolant" />
            <Readout label="Power strokes / s" value={(rpm / 120).toFixed(1)} />
            <Readout label="One revolution" value={`${(60000 / rpm).toFixed(1)} ms`} />
          </dl>
        </>
      }
      status={zone(rpm)}
    />
  )
}
