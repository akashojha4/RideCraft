import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Footer } from './Footer'
import { GaPageViews } from './GaPageViews'
import { Navbar } from './Navbar'
import { SeoHead } from './SeoHead'

export function AppShell() {
  const navigation = useNavigation()

  return (
    <div className="flex min-h-dvh flex-col">
      <SeoHead />
      <GaPageViews />
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-ignition-500 px-4 py-2 font-medium text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div
        aria-hidden
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-ignition-500 transition-transform duration-500',
          navigation.state === 'loading' ? 'scale-x-75' : 'scale-x-0',
        )}
      />
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Every freshly loaded page's first location has the key "default", so positions
          saved under it would leak between pages. Use the path for that one case and the
          normal per-navigation key otherwise (keeps back/forward restoration, and in-page
          updates such as ?part= on /anatomy). */}
      <ScrollRestoration getKey={(location) => (location.key === 'default' ? location.pathname : location.key)} />
    </div>
  )
}
