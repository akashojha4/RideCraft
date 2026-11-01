import { useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react'
import { Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { MotorcycleSideView } from '@/components/motorcycle/MotorcycleSideView'
import type { PartId } from '@/components/motorcycle/parts'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { FINAL_RATIO, GEARS, PRIMARY_RATIO, TYRE_CIRCUMFERENCE, gearRatio } from '@/lib/mechanics/gearbox'
import { cn } from '@/lib/cn'

/*
 * Lesson 11: follow the power from the crankshaft to the road. Each reduction stage
 * divides speed and multiplies torque by its ratio, so power (torque × speed) is passed
 * on unchanged apart from friction — applied here as one ~10 % drivetrain loss at the
 * wheel. Assumes 9 N·m from the engine. The wheels turn 10× slower than real.
 */

const ENGINE_TORQUE = 9
const EFFICIENCY = 0.9
const SLOWDOWN = 10
const ADVANCE_MS = 2400

interface Stage {
  title: string
  parts: PartId[]
  text: string
}

const stages: Stage[] = [
  { title: 'Crankshaft', parts: ['engine'], text: 'The engine turns the crankshaft. This is where the power starts: fast, with modest torque.' },
  { title: 'Primary drive & clutch', parts: ['clutch'], text: 'Gears on the crankshaft drive the clutch basket about 3.35 times slower. With the clutch engaged, it turns the gearbox mainshaft.' },
  { title: 'Gearbox', parts: ['gearbox'], text: 'The selected gear pair drives the countershaft — slower again in low gears, almost the same speed in top.' },
  { title: 'Chain & sprockets', parts: ['chain'], text: 'The 15-tooth front sprocket drives the chain, which turns the 45-tooth rear sprocket a further three times slower.' },
  { title: 'Rear wheel', parts: ['wheels'], text: 'The rear sprocket is bolted to the wheel, so the tyre turns at its speed and pushes against the road.' },
]

function values(rpm: number, gear: number) {
  const g = gearRatio(gear)
  const rows = [
    { rpm, torque: ENGINE_TORQUE },
    { rpm: rpm / PRIMARY_RATIO, torque: ENGINE_TORQUE * PRIMARY_RATIO },
    { rpm: rpm / PRIMARY_RATIO / g, torque: ENGINE_TORQUE * PRIMARY_RATIO * g },
    { rpm: rpm / PRIMARY_RATIO / g, torque: ENGINE_TORQUE * PRIMARY_RATIO * g },
    { rpm: rpm / PRIMARY_RATIO / g / FINAL_RATIO, torque: ENGINE_TORQUE * PRIMARY_RATIO * g * FINAL_RATIO * EFFICIENCY },
  ]
  const kmh = (rows[4].rpm * TYRE_CIRCUMFERENCE * 60) / 1000
  const kw = (t: number, r: number) => (t * r * 2 * Math.PI) / 60 / 1000
  return { rows, kmh, kwIn: kw(rows[0].torque, rows[0].rpm), kwOut: kw(rows[4].torque, rows[4].rpm) }
}

export default function PowerFlow() {
  const [stage, setStage] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rpm, setRpm] = useState(6000)
  const [gear, setGear] = useState(3)
  const reduceMotion = useReducedMotion()
  const wheelAngle = useMotionValue(0)
  const v = values(rpm, gear)

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return
    wheelAngle.set(wheelAngle.get() - (Math.min(delta, 100) / 1000) * (v.rows[4].rpm / 60 / SLOWDOWN) * 360)
  })

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setStage((s) => (s + 1) % stages.length), ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [playing])

  const choose = (i: number) => {
    setPlaying(false)
    setStage(i)
  }

  return (
    <DiagramFrame
      stage={<MotorcycleSideView highlighted={stages[stage].parts} wheelAngle={wheelAngle} title={`Power flow: ${stages[stage].title}`} />}
      controls={
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={playing ? 'secondary' : 'primary'}
              onClick={() => setPlaying((p) => !p)}
              leadingIcon={playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            >
              {playing ? 'Pause' : 'Follow the power'}
            </Button>
            <div role="group" aria-label="Stage" className="flex flex-wrap gap-1">
              {stages.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  aria-pressed={stage === i}
                  aria-label={`${i + 1}. ${s.title}`}
                  onClick={() => choose(i)}
                  className={cn(
                    'h-8 w-8 rounded-lg border font-mono text-sm transition-colors',
                    stage === i ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink',
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <Slider label="Engine speed" value={rpm} onChange={setRpm} min={2000} max={9000} step={100} valueText={`${rpm.toLocaleString('en')} RPM`} />
            <div role="group" aria-label="Gear" className="flex gap-1">
              {GEARS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={gear === i + 1}
                  aria-label={`Gear ${i + 1}`}
                  onClick={() => setGear(i + 1)}
                  className={cn(
                    'h-8 w-9 rounded-lg border font-mono text-sm transition-colors',
                    gear === i + 1 ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200' : 'border-line text-ink-muted hover:text-ink',
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <caption className="sr-only">Speed and torque at each stage of the drivetrain</caption>
            <thead>
              <tr className="text-left text-[11px] tracking-wide text-ink-subtle uppercase">
                <th className="py-1 font-normal">Stage</th>
                <th className="py-1 text-right font-normal">RPM</th>
                <th className="py-1 text-right font-normal">Torque</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((s, i) => (
                <tr key={s.title} onClick={() => choose(i)} className={cn('cursor-pointer border-t border-line', stage === i && 'bg-coolant-950/60')}>
                  <td className="py-1.5 text-ink">
                    {i + 1}. {s.title}
                  </td>
                  <td className="tabular py-1.5 text-right font-mono text-ink">{Math.round(v.rows[i].rpm).toLocaleString('en')}</td>
                  <td className="tabular py-1.5 text-right font-mono text-ink">{Math.round(v.rows[i].torque)} N·m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      }
      status={
        <>
          <span className="font-medium text-ink">
            {stage + 1}. {stages[stage].title}.
          </span>{' '}
          {stages[stage].text}{' '}
          <span className="text-ink-subtle">
            In gear {gear} at {rpm.toLocaleString('en')} RPM the motorcycle travels at about {Math.round(v.kmh)} km/h. Speed falls and torque rises at each
            stage, but the power stays about the same: {v.kwIn.toFixed(1)} kW from the engine, {v.kwOut.toFixed(1)} kW at the wheel after friction.
          </span>
        </>
      }
    />
  )
}
