import { useEffect } from 'react'

export const SITE_TITLE = 'MotoLab — Interactive Motorcycle Academy'

/** Sets the browser tab title for a page ("Title · MotoLab"), restoring the site title on leave. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · MotoLab` : SITE_TITLE
    return () => {
      document.title = SITE_TITLE
    }
  }, [title])
}
