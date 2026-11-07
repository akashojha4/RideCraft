import { Badge } from '@/components/ui/Badge'
import { isPhaseAvailable } from '@/config/roadmap'

/** Learner-facing availability of an app area, derived from its roadmap phase: only unbuilt areas are marked. */
export function AvailabilityBadge({ phase }: { phase: number }) {
  return isPhaseAvailable(phase) ? null : <Badge>Coming soon</Badge>
}
