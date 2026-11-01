import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { judgeGear, situations } from '@/content/simulators/gears'
import { rpmPerKmh } from '@/lib/mechanics/powertrain'
import { cn } from '@/lib/cn'

/** Pick the gear for each riding situation; judged from the RPM it would give. */
export function GearChooser() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const correct = situations.filter((s) => answers[s.id] !== undefined && judgeGear(s, answers[s.id]).good).length

  return (
    <section aria-labelledby="chooser-heading" className="space-y-4 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="chooser-heading" className="text-2xl font-semibold text-ink">
            Choose the right gear
          </h2>
          <p className="text-ink-muted">Pick a gear for each situation. It’s judged by the engine speed it would give.</p>
        </div>
        <p className="tabular font-mono text-sm text-ink-muted">
          {correct} of {situations.length} right
        </p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {situations.map((s) => {
          const choice = answers[s.id]
          const verdict = choice !== undefined ? judgeGear(s, choice) : null
          return (
            <li key={s.id} data-situation={s.id} className={cn('space-y-2 rounded-xl border p-4', verdict ? (verdict.good ? 'border-ok-500/40' : 'border-danger-500/40') : 'border-line')}>
              <p className="font-medium text-ink">{s.title}</p>
              <p className="text-sm text-ink-muted">{s.text}</p>
              <div role="group" aria-label={`Gear for: ${s.title}`} className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={choice === g}
                    onClick={() => setAnswers((a) => ({ ...a, [s.id]: g }))}
                    title={s.kmh ? `${Math.round(rpmPerKmh(g) * s.kmh)} RPM` : undefined}
                    className={cn('h-9 w-10 rounded-lg border font-mono text-sm', choice === g ? 'border-ignition-500/60 bg-ignition-950 text-ignition-200' : 'border-line text-ink-muted hover:text-ink')}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {verdict && (
                <p className={cn('flex items-start gap-2 text-sm', verdict.good ? 'text-ok-400' : 'text-danger-400')}>
                  {verdict.good ? <Check className="mt-0.5 size-4 shrink-0" aria-hidden /> : <X className="mt-0.5 size-4 shrink-0" aria-hidden />}
                  <span className="text-ink-muted">{verdict.text}</span>
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
