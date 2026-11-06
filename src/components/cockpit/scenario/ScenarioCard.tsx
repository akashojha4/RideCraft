import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import type { CockpitScenario } from '@/content/scenarios/cockpit/types'

/*
 * A cockpit scenario's briefing, in the brief's eight parts. The situation and objective are
 * always shown; the rest open on demand, so the cockpit stays the focus.
 */

function Part({ label, title, children, open = false }: { label: string; title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-t border-line py-2 first:border-t-0">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-ignition-500 [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-xs text-ink-subtle">{label}</span> {title}
        <ChevronDown className="ml-auto size-4 text-ink-subtle transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="mt-2 text-sm leading-relaxed text-ink-muted">{children}</div>
    </details>
  )
}

export function ScenarioCard({ scenario }: { scenario: CockpitScenario }) {
  return (
    <section aria-label={`Scenario briefing: ${scenario.title}`} data-scenario={scenario.id} className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="text-lg font-semibold text-ink">{scenario.title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        <span className="font-medium text-ink">Situation. </span>
        {scenario.situation}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        <span className="font-medium text-ink">Objective. </span>
        {scenario.objective}
      </p>
      <div className="mt-3">
        <Part label="C" title="What to do, in order">
          <ol className="list-decimal space-y-1 pl-5">
            {scenario.actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
        </Part>
        <Part label="D" title="What happens inside the motorcycle">
          {scenario.mechanical}
        </Part>
        <Part label="E" title="What happens on the road">
          {scenario.road}
        </Part>
        <Part label="F" title="Why this is right">
          {scenario.why}
        </Part>
        <Part label="G" title="Common mistakes">
          <ul className="space-y-2">
            {scenario.mistakes.map((m) => (
              <li key={m.id}>
                <span className="text-ink">{m.title}.</span> {m.text}
              </li>
            ))}
          </ul>
        </Part>
        <Part label="H" title="Safety">
          <ul className="list-disc space-y-1 pl-5">
            {scenario.safety.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Part>
      </div>
    </section>
  )
}
