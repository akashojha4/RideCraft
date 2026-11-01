import ChainDriveIllustration from '@/content/illustrations/ChainDriveIllustration'
import { DiagramFrame } from '../DiagramFrame'

export default function ChainDiagram() {
  return (
    <DiagramFrame
      stage={<ChainDriveIllustration />}
      status="Both sprockets share the same tooth spacing, so the chain moves the same number of teeth past each. The 45-tooth rear sprocket therefore turns once for every three turns of the 15-tooth front sprocket — with about three times the torque."
    />
  )
}
