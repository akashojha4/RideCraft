import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { LessonCockpit } from '@/components/cockpit/LessonCockpit'
import { ScenarioPlayer } from '@/components/scenarios/ScenarioPlayer'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getScenario, scenarios } from '@/content/scenarios'
import { cockpitScenarioForDecision } from '@/content/scenarios/cockpitLink'
import NotFoundPage from './NotFoundPage'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function ScenarioPage() {
  const { scenarioId } = useParams()
  const scenario = getScenario(scenarioId)
  usePageTitle(scenario ? `${scenario.title} · Scenario` : 'Page not found')
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
      <ScenarioPlayer key={scenario.id} scenario={scenario} />
      {cockpit && (
        <section className="space-y-3 rounded-2xl border border-coolant-500/30 bg-surface p-5">
          <h2 className="text-xl font-semibold text-ink">See the same riding from the seat</h2>
          <LessonCockpit
            scenarioId={cockpit.id}
            caption="The same road as the decision above, from the seat: the same people, traffic, bend or night. Watch a careful rider work the controls for the safe choice — then try it yourself."
            from={`/scenarios/${scenario.id}`}
          />
        </section>
      )}
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
