import { useState } from 'react'
import { DiagramFrame, DiagramLabel } from '@/components/anatomy/DiagramFrame'
import { BikeSilhouette } from '@/components/mechanics/BikeSilhouette'
import { Readout } from '@/components/simulation/Readouts'
import { cn } from '@/lib/cn'
import { polyline, solveRider } from '@/lib/mechanics/rider'
import { GROUND, motoTypes } from './motorcycleTypes.data'

/**
 * Pre-ride lesson 1: riding posture. Five independent choices, each good or poor, change
 * the rider figure (solved with the shared rider IK on the standard motorcycle). Knee
 * grip can't be seen from the side, so it is shown in a top-view inset of the tank.
 */

const bike = motoTypes.find((t) => t.id === 'standard')!

type Choice = { good: boolean }
const checks = [
  {
    id: 'eyes',
    label: 'Eyes',
    good: 'Looking ahead',
    poor: 'Looking down',
    feedback: 'Looking down at the front wheel shows you hazards late, and the motorcycle tends to go where you look. Keep your head up and your eyes well ahead.',
  },
  {
    id: 'back',
    label: 'Back',
    good: 'Tall, slight lean',
    poor: 'Slumped',
    feedback: 'A slumped back drops your weight onto your wrists and tires you quickly. Sit tall, leaning slightly forward from the hips.',
  },
  {
    id: 'arms',
    label: 'Arms',
    good: 'Elbows bent',
    poor: 'Locked straight',
    feedback: 'Straight, locked arms push every bump into the steering and make the motorcycle hard to steer. Keep your elbows slightly bent and relaxed.',
  },
  {
    id: 'knees',
    label: 'Knees',
    good: 'Against the tank',
    poor: 'Out wide',
    feedback: 'With your knees out you hold on with your arms instead. Grip the tank lightly with your knees so your arms can stay loose.',
  },
  {
    id: 'feet',
    label: 'Feet',
    good: 'Balls on the pegs',
    poor: 'Toes hanging down',
    feedback: 'Toes hanging down can catch the road or press the gear lever or brake pedal by accident. Rest the balls of your feet on the pegs, toes pointing forward.',
  },
] as const

type CheckId = (typeof checks)[number]['id']

export default function PostureCheck() {
  const [state, setState] = useState<Record<CheckId, Choice>>(
    () => Object.fromEntries(checks.map((c) => [c.id, { good: false }])) as Record<CheckId, Choice>,
  )
  const good = (id: CheckId) => state[id].good
  const body = solveRider(bike, { armExtension: good('arms') ? 0.86 : 0.995 })

  // A slumped back curves the spine and drops the head forward.
  const slump = good('back') ? 0 : 1
  const shoulder = { x: body.shoulder.x - 6 * slump, y: body.shoulder.y + 8 * slump }
  const head = good('back') ? body.head : { x: body.head.x - 12, y: body.head.y + 12 }
  const spineCtrl = { x: (bike.hip.x + shoulder.x) / 2 + 16 * slump, y: (bike.hip.y + shoulder.y) / 2 }
  const elbowOffset = { x: shoulder.x - body.shoulder.x, y: shoulder.y - body.shoulder.y }
  const elbow = { x: body.elbow.x + elbowOffset.x / 2, y: body.elbow.y + elbowOffset.y / 2 }
  const eye = { x: head.x - 9, y: head.y - 2 }
  const gazeEnd = good('eyes') ? { x: 40, y: eye.y + 18 } : { x: bike.front.x + 10, y: bike.front.y - bike.front.r }

  // Feet: ball of the foot on the peg, or hanging down off it.
  const peg = bike.foot
  const ankle = good('feet') ? { x: peg.x + 12, y: peg.y - 8 } : { x: peg.x + 4, y: peg.y - 10 }
  const toe = good('feet') ? { x: peg.x - 12, y: peg.y + 1 } : { x: peg.x - 6, y: peg.y + 20 }

  const score = checks.filter((c) => good(c.id)).length
  const problems = checks.filter((c) => !good(c.id))

  return (
    <DiagramFrame
      stage={
        <svg viewBox="40 -12 400 254" className="w-full" role="img" aria-label={`Rider posture, ${score} of 5 points correct`}>
          <g strokeLinejoin="round" strokeLinecap="round">
            <line x1={40} x2={440} y1={GROUND} y2={GROUND} strokeWidth={2} className="stroke-line-strong" />
            <BikeSilhouette type={bike} />

            <line x1={eye.x} y1={eye.y} x2={gazeEnd.x} y2={gazeEnd.y} strokeWidth={1.5} strokeDasharray="5 5" className={good('eyes') ? 'stroke-ok-400' : 'stroke-caution-400'} />

            <g className="stroke-ink-muted" fill="none" strokeWidth={6}>
              <path d={polyline(bike.hip, body.knee, ankle)} />
              <path d={polyline(ankle, toe)} strokeWidth={5} />
              <path d={`M${bike.hip.x},${bike.hip.y} Q${spineCtrl.x},${spineCtrl.y} ${shoulder.x},${shoulder.y}`} strokeWidth={9} />
              <path d={polyline(shoulder, elbow, bike.hand)} />
            </g>
            <circle cx={head.x} cy={head.y} r={14} strokeWidth={2} className="fill-surface-overlay stroke-ink-muted" />
            <circle cx={peg.x} cy={peg.y} r={3.5} className="fill-ignition-400" />

            {/* Top view of the knees against the tank */}
            <g transform="translate(400 -2) scale(0.66)">
              <rect x={-26} y={0} width={52} height={70} rx={20} className="fill-surface-raised stroke-line-strong" strokeWidth={1.5} />
              {[-1, 1].map((side) => (
                <ellipse
                  key={side}
                  cx={side * (good('knees') ? 32 : 46)}
                  cy={44}
                  rx={7}
                  ry={11}
                  className={good('knees') ? 'fill-ok-950 stroke-ok-400' : 'fill-caution-950 stroke-caution-400'}
                  strokeWidth={2}
                />
              ))}
              <DiagramLabel x={0} y={90} anchor="middle">Knees, from above</DiagramLabel>
            </g>
          </g>
        </svg>
      }
      controls={
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {checks.map((c) => (
              <div key={c.id} role="group" aria-label={c.label} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-xs text-ink-subtle">{c.label}</span>
                <div className="flex flex-1 rounded-lg border border-line bg-surface-sunken p-0.5">
                  {[true, false].map((g) => (
                    <button
                      key={String(g)}
                      type="button"
                      aria-pressed={state[c.id].good === g}
                      onClick={() => setState((s) => ({ ...s, [c.id]: { good: g } }))}
                      className={cn(
                        'h-7 flex-1 rounded-md px-2 text-xs transition-colors',
                        state[c.id].good === g
                          ? g
                            ? 'bg-ok-950 text-ok-400'
                            : 'bg-caution-950 text-caution-400'
                          : 'text-ink-subtle hover:text-ink',
                      )}
                    >
                      {g ? c.good : c.poor}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <dl>
            <Readout label="Posture" value={`${score} of 5 correct`} tone={score === 5 ? 'ok' : 'caution'} />
          </dl>
        </>
      }
      status={
        problems.length === 0 ? (
          <span className="text-ok-400">
            Good posture: head up and eyes ahead, back tall, elbows bent, knees against the tank and the balls of your feet on the pegs. Your
            arms are free to steer and your legs support you.
          </span>
        ) : (
          <ul className="space-y-1.5">
            {problems.map((c) => (
              <li key={c.id}>
                <span className="font-medium text-caution-400">{c.poor}:</span> {c.feedback}
              </li>
            ))}
          </ul>
        )
      }
    />
  )
}
