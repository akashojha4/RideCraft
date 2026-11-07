import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { WatchItDone } from '@/components/situations/WatchItDone'
import { getCockpitScenario } from '@/content/scenarios/cockpit'
import { demoPlan, runScenario } from '@/content/scenarios/cockpit/run'

/**
 * A scenario's demonstration, embedded in a lesson or a decision-scenario page, with a
 * link through to practise it in the full cockpit.
 */
export function LessonCockpit({
  scenarioId,
  caption,
  compact = true,
  from,
}: {
  scenarioId: string
  caption?: string
  compact?: boolean
  from?: string
}) {
  const scenario = getCockpitScenario(scenarioId)
  const run = useMemo(() => (scenario?.demo?.length ? runScenario(scenario, demoPlan(scenario)) : null), [scenario])
  if (!scenario || !run) return null
  const practice = `/simulators/cockpit?practice=${scenario.id}${from ? `&from=${encodeURIComponent(from)}` : ''}`
  return (
    <div className="space-y-3" data-lesson-cockpit={scenario.id}>
      {caption && <p className="leading-relaxed text-ink-muted">{caption}</p>}
      <WatchItDone scenario={scenario} run={run} compact={compact} />
      <Link to={practice} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ignition-500 px-4 text-sm font-medium text-bg hover:bg-ignition-400">
        Practise this in the cockpit <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  )
}
