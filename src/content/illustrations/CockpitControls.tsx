import { useState } from 'react'
import { DiagramFrame } from '@/components/anatomy/DiagramFrame'
import { Cockpit } from '@/components/mechanics/Cockpit'
import { controlOrder, controls, type ControlId } from '@/components/mechanics/controls'
import { cn } from '@/lib/cn'

/** Lesson 3: every control, from the rider's seat. */
export default function CockpitControls() {
  const [active, setActive] = useState<ControlId>('clutch-lever')
  const info = controls[active]

  return (
    <DiagramFrame
      stage={<Cockpit active={active} onSelect={setActive} className="mx-auto max-w-lg" />}
      controls={
        <div role="group" aria-label="Controls" className="flex flex-wrap gap-1.5">
          {controlOrder.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={active === id}
              onClick={() => setActive(id)}
              className={cn(
                'h-8 rounded-lg border px-2.5 text-xs font-medium transition-colors sm:text-sm',
                active === id
                  ? 'border-ignition-500/50 bg-ignition-950 text-ignition-200'
                  : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              {controls[id].name}
            </button>
          ))}
        </div>
      }
      status={
        <>
          <span className="font-medium text-ink">
            {info.name} · <span className="text-ignition-300">{info.operatedBy}</span>.
          </span>{' '}
          {info.does} <span className="text-ink-subtle">{info.howTo}</span>
        </>
      }
    />
  )
}
