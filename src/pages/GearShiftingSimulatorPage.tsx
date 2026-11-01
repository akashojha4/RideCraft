import { GearShiftingSimulator } from '@/components/simulators/gears/GearShiftingSimulator'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function GearShiftingSimulatorPage() {
  usePageTitle('Gear shifting simulator')
  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Simulator 3"
        title="Gear shifting"
        description="Change up and down through all five gears and watch the gearbox, the engine speed and the push at the rear wheel respond. Learn to rev-match, use engine braking and avoid over-revving."
      />
      <GearShiftingSimulator />
    </Container>
  )
}
