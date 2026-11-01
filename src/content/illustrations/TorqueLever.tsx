import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { Readout } from '@/components/simulation/Readouts'
import { Slider } from '@/components/ui/Slider'

/**
 * Lesson 6: torque = force × lever arm, with a spanner on a nut that needs 60 N·m to turn.
 * A downward push on the right-hand end turns the nut clockwise.
 */

const NUT = { x: 90, y: 130 }
const PX_PER_CM = 8
const NEEDED = 60

const hex = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i + Math.PI / 6
  return `${(18 * Math.cos(a)).toFixed(1)},${(18 * Math.sin(a)).toFixed(1)}`
}).join(' ')

export default function TorqueLever() {
  const [force, setForce] = useState(150)
  const [lengthCm, setLengthCm] = useState(20)
  const torque = force * (lengthCm / 100)
  const turns = torque >= NEEDED
  const spin = useMotionValue(0)
  const reduceMotion = useReducedMotion()

  useAnimationFrame((_, delta) => {
    if (turns && !reduceMotion) spin.set(spin.get() + (Math.min(delta, 100) / 1000) * 60)
  })

  const end = NUT.x + lengthCm * PX_PER_CM
  const arrow = 30 + (force / 300) * 70

  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 0 420 236" className="w-full" role="img" aria-label={`Spanner ${lengthCm} centimetres long pushed with ${force} newtons`}>
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Spanner */}
            <path
              d={`M${NUT.x},${NUT.y - 8} L${end},${NUT.y - 8} A8,8 0 0 1 ${end},${NUT.y + 8} L${NUT.x},${NUT.y + 8} Z`}
              strokeWidth={1.5}
              className="fill-surface-overlay stroke-ink-subtle"
            />
            <circle cx={NUT.x} cy={NUT.y} r={28} strokeWidth={1.5} className="fill-surface-overlay stroke-ink-subtle" />
            <motion.g style={{ x: NUT.x, y: NUT.y, rotate: spin }}>
              <polygon points={hex} strokeWidth={2} className={turns ? 'fill-coolant-950 stroke-coolant-400' : 'fill-surface-raised stroke-line-strong'} />
              <circle r={6} className="fill-bg" />
            </motion.g>

            {/* Force */}
            <line x1={end} y1={NUT.y - 12 - arrow} x2={end} y2={NUT.y - 14} strokeWidth={4} className="stroke-ignition-400" />
            <path d={`M${end - 8},${NUT.y - 24} L${end},${NUT.y - 12} L${end + 8},${NUT.y - 24}`} fill="none" strokeWidth={4} className="stroke-ignition-400" />
            <DiagramLabel x={end + 12} y={NUT.y - 20 - arrow / 2} tone="ignition">{`F = ${force} N`}</DiagramLabel>

            {/* Lever arm */}
            <line x1={NUT.x} y1={NUT.y + 40} x2={end} y2={NUT.y + 40} strokeWidth={1} className="stroke-ink-subtle" />
            <line x1={NUT.x} y1={NUT.y + 34} x2={NUT.x} y2={NUT.y + 46} strokeWidth={1} className="stroke-ink-subtle" />
            <line x1={end} y1={NUT.y + 34} x2={end} y2={NUT.y + 46} strokeWidth={1} className="stroke-ink-subtle" />
            <DiagramLabel x={(NUT.x + end) / 2} y={NUT.y + 58} anchor="middle">{`r = ${lengthCm} cm`}</DiagramLabel>
            <DiagramLabel x={NUT.x} y={NUT.y + 82} anchor="middle" tone="coolant">Nut</DiagramLabel>
          </g>
        </svg>
      }
      controls={
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Slider label="Push" value={force} onChange={setForce} min={50} max={300} step={10} valueText={`${force} N`} />
            <Slider label="Spanner length" value={lengthCm} onChange={setLengthCm} min={10} max={40} valueText={`${lengthCm} cm`} />
          </div>
          <dl className="flex flex-wrap gap-6">
            <Readout label="Torque = F × r" value={`${force} N × ${(lengthCm / 100).toFixed(2)} m = ${torque.toFixed(0)} N·m`} tone="coolant" />
            <Readout label="Needed to turn" value={`${NEEDED} N·m`} />
          </dl>
        </>
      }
      status={
        turns
          ? `It turns. ${torque.toFixed(0)} N·m is enough — and you can get there with a harder push or a longer spanner, because torque depends on both.`
          : `Not yet: ${torque.toFixed(0)} N·m is less than the ${NEEDED} N·m needed. Push harder, or use a longer spanner to get more torque from the same push.`
      }
    />
  )
}
