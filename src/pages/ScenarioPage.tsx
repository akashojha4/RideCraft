import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LessonCockpit } from '@/components/cockpit/LessonCockpit'
import { ScenarioPlayer } from '@/components/scenarios/ScenarioPlayer'
import { RelatedLessons } from '@/components/lesson/RelatedLessons'
import { Container } from '@/components/ui/Container'
import { relatedLessonsForScenario } from '@/content/related'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getScenario, scenarios } from '@/content/scenarios'
import { cockpitScenarioForDecision } from '@/content/scenarios/cockpitLink'
import NotFoundPage from './NotFoundPage'

export default function ScenarioPage() {
  const { scenarioId } = useParams()
  const scenario = getScenario(scenarioId)
  // The seat view rides the safe choice, so it waits until the learner has made their own.
  const [decidedFor, setDecidedFor] = useState<string | null>(null)
  if (!scenario) return <NotFoundPage />
  const i = scenarios.indexOf(scenario)
  const prev = scenarios[i - 1]
  const next = scenarios[i + 1]
  const cockpit = cockpitScenarioForDecision(scenario.id)
  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <Link to="/scenarios" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> All scenarios
      </Link>
      <SectionHeading as="h1" eyebrow={`Scenario ${scenario.number} of ${scenarios.length}`} title={scenario.title} description={scenario.summary} />
      {/* Remount per scenario so the playback and decision start fresh. */}
      <ScenarioPlayer key={scenario.id} scenario={scenario} onChoose={() => setDecidedFor(scenario.id)} />
      {cockpit && (
        <section className="space-y-3 rounded-2xl border border-coolant-500/30 bg-surface p-5">
          <h2 className="text-xl font-semibold text-ink">See the same riding from the seat</h2>
          {decidedFor === scenario.id ? (
            <LessonCockpit
              scenarioId={cockpit.id}
              caption="The same road as the decision above, from the seat: the same people, traffic, bend or night. Watch a careful rider work the controls for the safe choice — then try it yourself."
              from={`/scenarios/${scenario.id}`}
            />
          ) : (
            <p data-seat-locked className="flex items-center gap-2 text-ink-muted">
              <Lock className="size-4 shrink-0 text-ink-subtle" aria-hidden /> Make your choice above first — then watch a careful rider do it from the seat.
            </p>
          )}
        </section>
      )}
      <RelatedLessons lessons={relatedLessonsForScenario(scenario.id)} />
      <nav aria-label="Scenario navigation" className="flex flex-wrap justify-between gap-4 border-t border-line pt-6">
        {prev ? (
          <Link to={`/scenarios/${prev.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/scenarios/${next.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
            Next: {next.title} <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <Link to="/scenarios" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
            Back to all scenarios <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </nav>
    </Container>
  )
}
