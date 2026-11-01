import { Badge, type Tone } from '@/components/ui/Badge'
import type { PhaseStatus } from '@/config/roadmap'

const tone: Record<PhaseStatus, Tone> = {
  'NOT STARTED': 'neutral',
  'IN PROGRESS': 'ignition',
  TESTING: 'coolant',
  COMPLETED: 'ok',
  BLOCKED: 'danger',
}

const label: Record<PhaseStatus, string> = {
  'NOT STARTED': 'Not started',
  'IN PROGRESS': 'In progress',
  TESTING: 'Testing',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
}

export function PhaseStatusBadge({ status }: { status: PhaseStatus }) {
  return <Badge tone={tone[status]}>{label[status]}</Badge>
}
