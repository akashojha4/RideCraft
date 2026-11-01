import { ClutchThrottleSimulator } from '@/components/simulators/clutch/ClutchThrottleSimulator'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function ClutchThrottleSimulatorPage() {
  usePageTitle('Clutch and throttle simulator')
  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Simulator 2"
        title="Clutch and throttle"
        description="Work the clutch lever and throttle yourself and watch the engine, the clutch and the rear wheel respond in real time. Find the biting point, pull away, and learn exactly why engines stall."
      />
      <ClutchThrottleSimulator />
    </Container>
  )
}
