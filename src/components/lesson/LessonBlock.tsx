import { ArrowRight, ArrowUpRight, Bike, Check, ScanSearch } from 'lucide-react'
import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { parts } from '@/components/motorcycle/parts'
import { Callout } from '@/components/ui/Callout'
import { illustrations } from '@/content/illustrations/registry'
import type { LessonBlock as Block } from '@/content/types'

function H({ children, id }: { children: string; id?: string }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-xl font-semibold text-ink sm:text-2xl">
      {children}
    </h2>
  )
}

export function LessonBlock({ block, anchorId }: { block: Block; anchorId?: string }) {
  switch (block.type) {
    case 'concept':
      return (
        <section className="space-y-4">
          <H id={anchorId}>{block.heading}</H>
          {block.body.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-ink-muted sm:text-[17px]">
              {p}
            </p>
          ))}
        </section>
      )

    case 'keyPoints':
      return (
        <section className="space-y-4">
          {block.heading && <H id={anchorId}>{block.heading}</H>}
          <ul className="space-y-3">
            {block.points.map((point, i) => (
              <li key={i} className="flex gap-3 text-ink-muted">
                <Check className="mt-1 size-4 shrink-0 text-ignition-400" aria-hidden />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )

    case 'illustration': {
      const { component: Illustration, framed } = illustrations[block.illustration]
      const fallback = <div className="aspect-[2/1] animate-pulse-soft rounded-2xl border border-line bg-surface" />
      if (framed) {
        return (
          <div className="space-y-3">
            <Suspense fallback={fallback}>
              <Illustration />
            </Suspense>
            {block.caption && <p className="px-1 text-sm leading-relaxed text-ink-subtle">{block.caption}</p>}
          </div>
        )
      }
      return (
        <figure className="overflow-hidden rounded-2xl border border-line bg-surface-sunken">
          <div className="bg-blueprint p-4 sm:p-6">
            <Suspense fallback={<div className="aspect-[2/1] animate-pulse-soft rounded-xl bg-surface" />}>
              <Illustration />
            </Suspense>
          </div>
          {block.caption && (
            <figcaption className="border-t border-line px-4 py-3 text-sm leading-relaxed text-ink-muted sm:px-6">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    }

    case 'example':
      return (
        <section className="rounded-2xl border border-ignition-500/25 bg-ignition-950/40 p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-ignition-300">
            <Bike className="size-5" aria-hidden />
            <h2 id={anchorId} className="scroll-mt-24 font-display text-base font-semibold">
              {block.heading ?? 'Real-world example'}
            </h2>
          </div>
          <div className="space-y-3">
            {block.body.map((p, i) => (
              <p key={i} className="leading-relaxed text-ink-muted">
                {p}
              </p>
            ))}
          </div>
        </section>
      )

    case 'callout':
      return (
        <Callout tone={block.tone} title={block.title}>
          {block.body}
        </Callout>
      )

    case 'steps':
      return (
        <section className="space-y-4">
          <H id={anchorId}>{block.heading}</H>
          <ol className="relative space-y-5 border-l border-line pl-6">
            {block.steps.map((step, i) => (
              <li key={i} className="relative">
                <span className="tabular absolute top-0 -left-[37px] flex size-6 items-center justify-center rounded-full border border-line-strong bg-surface font-mono text-xs text-ink">
                  {i + 1}
                </span>
                <p className="font-medium text-ink">{step.title}</p>
                <p className="mt-1 leading-relaxed text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )

    case 'explore':
      return (
        <Link
          to={`/anatomy?part=${block.part}`}
          className="group flex items-center gap-4 rounded-2xl border border-coolant-500/25 bg-coolant-950/40 p-4 transition-colors hover:border-coolant-500/50"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-coolant-500/30 bg-bg">
            <ScanSearch className="size-5 text-coolant-400" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-ink">Explore the {parts[block.part].name.toLowerCase()} in the Anatomy Explorer</span>
            <span className="block text-sm text-ink-muted">{block.text}</span>
          </span>
          <ArrowUpRight className="size-5 shrink-0 text-ink-subtle transition-colors group-hover:text-coolant-300" aria-hidden />
        </Link>
      )

    case 'cta':
      return (
        <Link
          to={block.to}
          className="group flex items-center gap-4 rounded-2xl border border-ignition-500/30 bg-ignition-950/40 p-4 transition-colors hover:border-ignition-500/60"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-ink">{block.title}</span>
            <span className="block text-sm text-ink-muted">{block.text}</span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-ignition-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )

    case 'terms':
      return (
        <section className="space-y-4">
          {block.heading && <H id={anchorId}>{block.heading}</H>}
          <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {block.items.map((item) => (
              <div key={item.term} className="grid gap-1 bg-surface px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
                <dt className="font-medium text-coolant-300">{item.term}</dt>
                <dd className="text-ink-muted">{item.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )
  }
}
