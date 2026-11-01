import { ArrowLeft, Construction } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { Phase } from '@/config/roadmap'
import { PhaseStatusBadge } from './PhaseStatusBadge'

/**
 * Shown for app areas whose phase has not been built yet. It states plainly which phase
 * will build the area and what it will contain, rather than showing mock content.
 */
export function PhasePending({
  phase,
  title = phase.title,
  description = phase.summary,
  back = { to: '/', label: 'Back to home' },
}: {
  phase: Phase
  title?: string
  description?: string
  back?: { to: string; label: string }
}) {
  return (
    <Container width="prose" className="py-20 sm:py-28">
      <Reveal className="space-y-6">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-line bg-surface">
          <Construction className="size-6 text-caution-400" aria-hidden />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs tracking-[0.18em] text-ink-subtle uppercase">Phase {phase.number}</span>
          <PhaseStatusBadge status={phase.status} />
        </div>
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
        <p className="text-lg text-ink-muted">{description}</p>
        <p className="text-ink-muted">
          This part of MotoLab is built in Phase {phase.number} and is not available yet. When it is complete it will
          cover:
        </p>
        <ul className="flex flex-wrap gap-2">
          {phase.scope.map((item) => (
            <li key={item} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted">
              {item}
            </li>
          ))}
        </ul>
        <ButtonLink to={back.to} variant="secondary" leadingIcon={<ArrowLeft className="size-4" />}>
          {back.label}
        </ButtonLink>
      </Reveal>
    </Container>
  )
}
