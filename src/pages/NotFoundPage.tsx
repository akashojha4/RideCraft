import { ArrowLeft } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export default function NotFoundPage() {
  return (
    <Container width="prose" className="flex flex-col items-start gap-5 py-28">
      <p className="font-mono text-sm text-ignition-400">404</p>
      <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Wrong turn.</h1>
      <p className="text-lg text-ink-muted">This page doesn’t exist. Let’s get you back on the road.</p>
      <ButtonLink to="/" variant="secondary" leadingIcon={<ArrowLeft className="size-4" />}>
        Back to home
      </ButtonLink>
    </Container>
  )
}
