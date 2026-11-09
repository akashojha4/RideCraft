import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/*
 * Keeps the document head (title, description, canonical, Open Graph, robots) in step with the
 * page shown. The first page arrives with its head already in the HTML (written at build time),
 * so the metadata — which reads the whole curriculum and every scenario — is loaded on demand
 * rather than in the first-load bundle.
 */
export function SeoHead() {
  const { pathname } = useLocation()
  useEffect(() => {
    let current = true
    void Promise.all([import('@/lib/seo/meta'), import('@/lib/seo/head')]).then(([{ pageMeta }, { applyHead }]) => {
      if (current) applyHead(pageMeta(pathname))
    })
    return () => {
      current = false
    }
  }, [pathname])
  return null
}
