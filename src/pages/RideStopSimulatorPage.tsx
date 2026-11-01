import { RideStopSimulator } from '@/components/simulators/ride/RideStopSimulator'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function RideStopSimulatorPage() {
  usePageTitle('Riding and stopping simulator')
  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Simulator 4"
        title="Riding and stopping"
        description="Pull away, ride at a steady speed, follow traffic and stop — with separate front and rear brakes. Watch the weight shift onto the front tyre as you brake, and learn why the front brake does most of the work, why it must be squeezed progressively, and what happens when a wheel locks."
      />
      <RideStopSimulator />
    </Container>
  )
}
