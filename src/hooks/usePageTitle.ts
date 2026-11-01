import { useEffect } from 'react'

export const SITE_TITLE = 'RideCraft — Interactive Motorcycle Academy'

/** Sets the browser tab title for a page ("Title · RideCraft"), restoring the site title on leave. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · RideCraft` : SITE_TITLE
    return () => {
      document.title = SITE_TITLE
    }
  }, [title])
}
