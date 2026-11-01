import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { MotorcycleSideView } from '@/components/motorcycle/MotorcycleSideView'
import { categories, parts, type PartId } from '@/components/motorcycle/parts'
import { cn } from '@/lib/cn'

/** Lesson 1: the motorcycle as a handful of systems, each highlighted on the drawing. */

const systems: { id: string; label: string; parts: PartId[]; role: string }[] = [
  {
    id: 'engine',
    label: 'Engine & fuel',
    parts: categories.find((c) => c.id === 'engine')!.parts,
    role: 'Makes the power. Fuel from the tank and air metered by the throttle burn in the engine; the exhaust carries the waste gas away.',
  },
  {
    id: 'drivetrain',
    label: 'Drivetrain',
    parts: [...categories.find((c) => c.id === 'drivetrain')!.parts, 'wheels'],
    role: 'Delivers the power. The clutch connects the engine to the gearbox, the gearbox picks a ratio, and the chain turns the rear wheel.',
  },
  {
    id: 'brakes',
    label: 'Brakes',
    parts: categories.find((c) => c.id === 'brakes')!.parts,
    role: 'Takes the motion away again, turning it into heat in the discs and pads — front and rear brakes work independently.',
  },
  {
    id: 'chassis',
    label: 'Chassis',
    parts: categories.find((c) => c.id === 'chassis')!.parts,
    role: 'Holds everything together and keeps the tyres on the road: the frame, the suspension and the wheels.',
  },
  {
    id: 'rider',
    label: 'Rider controls',
    parts: ['throttle', 'clutch', 'front-brake', 'rear-brake', 'gearbox', 'handlebar'],
    role: 'How you command all of the above: two hands and two feet operate five main controls, and the handlebar steers.',
  },
]

export default function SystemsTour() {
  const [active, setActive] = useState(systems[0].id)
  const system = systems.find((s) => s.id === active)!

  return (
    <DiagramFrame
      stage={
        <MotorcycleSideView
          highlighted={system.parts}
          mode={active === 'rider' ? 'rider' : 'plain'}
          title={`Motorcycle with the ${system.label.toLowerCase()} highlighted`}
        />
      }
      controls={
        <div role="group" aria-label="Motorcycle systems" className="flex flex-wrap gap-1.5">
          {systems.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={active === s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                'h-9 rounded-lg border px-3 text-sm font-medium transition-colors',
                active === s.id
                  ? s.id === 'rider'
                    ? 'border-ignition-500/50 bg-ignition-950 text-ignition-200'
                    : 'border-coolant-500/50 bg-coolant-950 text-coolant-200'
                  : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      }
      status={
        <>
          <span className="font-medium text-ink">{system.label}.</span> {system.role}
          <span className="mt-1 block text-xs text-ink-subtle">
            Highlighted: {system.parts.map((id) => parts[id].name).join(' · ')}
          </span>
        </>
      }
    />
  )
}
