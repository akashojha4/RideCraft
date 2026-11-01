import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Container } from '@/components/ui/Container'

const RELOAD_KEY = 'motolab:stale-reload'

/**
 * A tab opened before a new build was deployed asks for page chunks that no longer exist.
 * Reload once to pick up the new build; the timestamp guard stops a reload loop.
 */
function isStaleChunk(message: string) {
  return /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(message)
}

/** Fallback for errors thrown while rendering or loading a route. Rendered outside the app shell. */
export default function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'
  const stale = isStaleChunk(message)

  useEffect(() => {
    if (!stale) return
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
      if (Date.now() - last < 10_000) return
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
    } catch {
      return
    }
    window.location.reload()
  }, [stale])

  if (stale) {
    return (
      <Container width="prose" className="flex min-h-dvh flex-col justify-center gap-5 py-20">
        <h1 className="text-3xl font-semibold text-ink">RideCraft has been updated.</h1>
        <p className="text-ink-muted">Loading the latest version…</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="self-start text-ignition-400 hover:text-ignition-300"
        >
          Reload now →
        </button>
      </Container>
    )
  }

  return (
    <Container width="prose" className="flex min-h-dvh flex-col justify-center gap-5 py-20">
      <p className="font-mono text-sm text-danger-400">Something went wrong</p>
      <h1 className="text-3xl font-semibold text-ink">The page hit a problem.</h1>
      <pre className="overflow-x-auto rounded-xl border border-line bg-surface p-4 font-mono text-sm text-ink-muted">
        {message}
      </pre>
      <a href="/" className="text-ignition-400 hover:text-ignition-300">
        Reload RideCraft →
      </a>
    </Container>
  )
}
