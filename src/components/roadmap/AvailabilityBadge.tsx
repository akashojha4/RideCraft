import { Badge } from '@/components/ui/Badge'
import { isPhaseAvailable } from '@/config/roadmap'

/** Learner-facing availability of an app area, derived from its roadmap phase. */
export function AvailabilityBadge({ phase }: { phase: number }) {
  return isPhaseAvailable(phase) ? <Badge tone="ok">Available</Badge> : <Badge>Coming soon</Badge>
}
