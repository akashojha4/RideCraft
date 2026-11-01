import { ArrowLeft, ArrowRight, Link2, MapPin } from 'lucide-react'
import { Suspense, type ReactNode } from 'react'
import { anatomyDiagrams } from '@/components/anatomy/diagrams/registry'
import { categories, partOrder, parts, type PartId } from '@/components/motorcycle/parts'
import { Callout } from '@/components/ui/Callout'
import { anatomy } from '@/content/anatomy'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {children}
    </section>
  )
}

/** Full explanation of one component: purpose, working principle, internals and connections. */
export function PartDetail({ id, onSelect }: { id: PartId; onSelect: (id: PartId) => void }) {
  const info = parts[id]
  const entry = anatomy[id]
  const category = categories.find((c) => c.id === info.category)!
  const Diagram = anatomyDiagrams[id]
  const index = partOrder.indexOf(id)
  const previous = partOrder[(index - 1 + partOrder.length) % partOrder.length]
  const next = partOrder[(index + 1) % partOrder.length]

  return (
    <article aria-labelledby={`part-${id}`} className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs tracking-[0.18em] text-ignition-400 uppercase">{category.label}</p>
        <h2 id={`part-${id}`} className="text-3xl font-semibold text-ink sm:text-4xl">
          {info.name}
        </h2>
        <p className="flex items-start gap-2 text-sm text-coolant-300">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {info.location}
        </p>
        <p className="text-lg leading-relaxed text-ink-muted">{info.summary}</p>
      </header>

      <Section title="Purpose">
        <p className="leading-relaxed text-ink-muted">{entry.purpose}</p>
      </Section>

      <Section title="How it works">
        <div className="space-y-3">
          {entry.howItWorks.map((p, i) => (
            <p key={i} className="leading-relaxed text-ink-muted">
              {p}
            </p>
          ))}
        </div>
      </Section>

      <Section title={`Inside the ${info.name.toLowerCase()}`}>
        {Diagram && (
          <Suspense fallback={<div className="aspect-[2/1] animate-pulse-soft rounded-2xl border border-line bg-surface" />}>
            <Diagram />
          </Suspense>
        )}
        <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {entry.internals.map((item) => (
            <div key={item.name} className="grid gap-1 bg-surface px-4 py-3 sm:grid-cols-[170px_1fr] sm:gap-4">
              <dt className="font-medium text-coolant-300">{item.name}</dt>
              <dd className="text-sm leading-relaxed text-ink-muted">{item.role}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Connected to">
        <ul className="grid gap-2">
          {entry.connections.map((c) => (
            <li key={c.to}>
              <button
                type="button"
                onClick={() => onSelect(c.to)}
                className="group flex w-full items-start gap-3 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong hover:bg-surface-raised"
              >
                <Link2 className="mt-0.5 size-4 shrink-0 text-ink-subtle group-hover:text-coolant-300" aria-hidden />
                <span>
                  <span className="font-medium text-ink group-hover:text-coolant-200">{parts[c.to].name}</span>
                  <span className="block text-sm text-ink-muted">{c.how}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {entry.callout && <Callout tone={entry.callout.tone}>{entry.callout.text}</Callout>}

      <nav aria-label="Other components" className="grid grid-cols-2 gap-3 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => onSelect(previous)}
          className="group flex flex-col items-start gap-1 rounded-xl border border-line bg-surface p-3 text-left hover:border-line-strong"
        >
          <span className="flex items-center gap-1 text-xs text-ink-subtle">
            <ArrowLeft className="size-3.5" aria-hidden /> Previous
          </span>
          <span className="font-medium text-ink">{parts[previous].name}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect(next)}
          className="group flex flex-col items-end gap-1 rounded-xl border border-line bg-surface p-3 text-right hover:border-line-strong"
        >
          <span className="flex items-center gap-1 text-xs text-ink-subtle">
            Next <ArrowRight className="size-3.5" aria-hidden />
          </span>
          <span className="font-medium text-ink">{parts[next].name}</span>
        </button>
      </nav>
    </article>
  )
}
