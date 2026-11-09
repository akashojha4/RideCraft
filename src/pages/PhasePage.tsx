import { ArrowLeft, ArrowRight, CircleCheck, Clock } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { academyPhases, getAcademyPhase } from '@/content/academy'
import { getLesson, lessonPath } from '@/content/curriculum'
import { useProgress } from '@/lib/progress/store'
import { usePageTitle } from '@/hooks/usePageTitle'
import NotFoundPage from './NotFoundPage'

export default function PhasePage() {
  const { phaseId } = useParams()
  const phase = getAcademyPhase(phaseId)
  const index = academyPhases.findIndex((p) => p.id === phaseId)
  usePageTitle(phase ? `${phase.title} · Learn` : 'Page not found')
  const { lessons: records } = useProgress()
  if (!phase || index < 0) return <NotFoundPage />

  const items = phase.lessons.map((step, i) => {
    const found = getLesson(step.moduleId, step.lessonId)
    return found ? { ...found, step, n: i + 1 } : undefined
  })
  if (items.some((x) => !x)) return <NotFoundPage />
  const lessons = items.filter((x): x is NonNullable<typeof x> => !!x)
  const done = lessons.filter((x) => records[`${x.module.id}/${x.lesson.id}`]?.completedAt).length
  const upNext = lessons.find((x) => !records[`${x.module.id}/${x.lesson.id}`]?.completedAt)
  const minutes = lessons.reduce((n, x) => n + x.lesson.durationMinutes, 0)

  return (
    <Container className="py-14 sm:py-20">
      <Link to="/learn" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> All phases
      </Link>
      <SectionHeading
        as="h1"
        eyebrow={`Phase ${String(index + 1).padStart(2, '0')} of ${String(academyPhases.length).padStart(2, '0')}`}
        title={phase.title}
        description={phase.goal}
      />
      <p className="mt-3 text-sm text-ink-subtle">{phase.practise}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        {upNext && (
          <Link
            to={lessonPath(upNext.module.id, upNext.lesson.id)}
            data-phase-next
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-ignition-500 px-5 text-sm font-medium text-bg hover:bg-ignition-400"
          >
            {done > 0 ? `Continue: ${upNext.lesson.title}` : `Start the first lesson`} <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
        <p className="tabular font-mono text-sm text-ink-muted">
          {done} of {lessons.length} lessons · {minutes} min
        </p>
      </div>
      <Stagger as="ol" className="mt-10 grid gap-3">
        {lessons.map((item) => {
          const record = records[`${item.module.id}/${item.lesson.id}`]
          return (
            <StaggerItem as="li" key={`${item.module.id}/${item.lesson.id}`} className="min-w-0">
              <Link to={lessonPath(item.module.id, item.lesson.id)} className="block">
                <Card interactive className="flex items-center gap-5 p-5">
                  {record?.completedAt ? (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-ok-500/40 bg-ok-950 text-ok-400" data-completed>
                      <CircleCheck className="size-5" aria-label="Completed" />
                    </span>
                  ) : (
                    <span className="tabular flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-sunken font-mono text-sm text-ink">
                      {item.n}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg font-semibold text-ink">{item.lesson.title}</h2>
                    <p className="mt-0.5 truncate text-sm text-ink-muted">{item.lesson.summary}</p>
                  </div>
                  {record?.quiz && (
                    <span className="tabular hidden font-mono text-xs text-ink-muted sm:block">
                      Quiz {record.quiz.best}/{record.quiz.total}
                    </span>
                  )}
                  <span className="hidden items-center gap-1 text-sm text-ink-subtle sm:flex">
                    <Clock className="size-4" aria-hidden /> {item.lesson.durationMinutes} min
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-ink-subtle" aria-hidden />
                </Card>
              </Link>
            </StaggerItem>
          )
        })}
      </Stagger>
    </Container>
  )
}
