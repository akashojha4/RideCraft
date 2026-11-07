import { ArrowRight, CircleCheck, Clock } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { PhasePending } from '@/components/roadmap/PhasePending'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getPhase } from '@/config/roadmap'
import { getModule, lessonPath, moduleMinutes } from '@/content/curriculum'
import { useProgress } from '@/lib/progress/store'
import NotFoundPage from './NotFoundPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function ModulePage() {
  const { moduleId } = useParams()
  const module = getModule(moduleId)
  usePageTitle(module?.title ?? 'Page not found')
  const { lessons: lessonRecords } = useProgress()
  if (!module) return <NotFoundPage />

  if (module.lessons.length === 0) {
    return (
      <PhasePending
        phase={getPhase(module.phase)}
        title={module.title}
        description={module.description}
        back={{ to: '/learn', label: 'All modules' }}
      />
    )
  }

  const records = Object.fromEntries(module.lessons.map((l) => [l.id, lessonRecords[`${module.id}/${l.id}`]]))
  const done = module.lessons.filter((l) => records[l.id]?.completedAt).length
  const upNext = module.lessons.find((l) => !records[l.id]?.completedAt)
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow={module.optional ? 'Optional module' : 'Module'} title={module.title} description={module.description} />
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        {upNext && (
          <Link
            to={lessonPath(module.id, upNext.id)}
            data-module-next
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-ignition-500 px-5 text-sm font-medium text-bg hover:bg-ignition-400"
          >
            {done > 0 ? `Continue: ${upNext.title}` : 'Start the first lesson'} <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
        <p className="tabular font-mono text-sm text-ink-muted" data-module-progress>
          {done} of {module.lessons.length} lessons completed · {moduleMinutes(module)} min in total
        </p>
      </div>
      <Stagger as="ol" className="mt-10 grid gap-3">
        {module.lessons.map((lesson, i) => (
          <StaggerItem as="li" key={lesson.id} className="min-w-0">
            <Link to={lessonPath(module.id, lesson.id)} className="block">
              <Card interactive className="flex items-center gap-5 p-5">
                {records[lesson.id]?.completedAt ? (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-ok-500/40 bg-ok-950 text-ok-400" data-completed>
                    <CircleCheck className="size-5" aria-label="Completed" />
                  </span>
                ) : (
                  <span className="tabular flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-sunken font-mono text-sm text-ink">
                    {i + 1}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold text-ink">{lesson.title}</h2>
                  <p className="mt-0.5 truncate text-sm text-ink-muted">{lesson.summary}</p>
                </div>
                {records[lesson.id]?.quiz && (
                  <span className="tabular hidden font-mono text-xs text-ink-muted sm:block" data-quiz>
                    Quiz {records[lesson.id]!.quiz!.best}/{records[lesson.id]!.quiz!.total}
                  </span>
                )}
                <span className="hidden items-center gap-1 text-sm text-ink-subtle sm:flex">
                  <Clock className="size-4" aria-hidden /> {lesson.durationMinutes} min
                </span>
                <ArrowRight className="size-5 shrink-0 text-ink-subtle" aria-hidden />
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Container>
  )
}
