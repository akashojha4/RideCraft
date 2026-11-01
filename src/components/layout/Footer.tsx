import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { primaryNav } from '@/config/navigation'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-sunken">
      <Container className="flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-ink-muted">
            Learn how a geared motorcycle works, and how to ride one, through interactive mechanical simulations.
          </p>
          <p className="text-xs text-ink-subtle">
            RideCraft is a learning aid. It does not replace professional rider training or a licensed instructor.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            {[...primaryNav, { label: 'Pre-ride checklist', to: '/checklist' }, { label: 'Design system', to: '/design-system' }].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-ink-muted transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  )
}
