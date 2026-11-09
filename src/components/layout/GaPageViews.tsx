import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '@/lib/analytics/ga'

/*
 * Sends a GA4 page_view for the first route and every later client-side navigation.
 * SeoHead sets the new page's title asynchronously (its metadata loads on demand), so the
 * title is taken from the same metadata here rather than read from document.title too early.
 */
export function GaPageViews() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    let current = true
    import('@/lib/seo/meta')
      .then(({ pageMeta }) => {
        if (current) trackPageView(pathname, search, { title: pageMeta(pathname).title })
      })
      // If the metadata can't load, still count the view.
      .catch(() => {
        if (current) trackPageView(pathname, search)
      })
    return () => {
      current = false
    }
  }, [pathname, search])
  return null
}
