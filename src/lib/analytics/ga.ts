/*
 * GA4 for the SPA. The gtag snippet’s automatic page_view would fire once on load and miss
 * client-side navigations, so config disables it and this module sends every view itself.
 * Loaded only in production builds, never on localhost, and never with PII.
 */

export const GA_MEASUREMENT_ID = 'G-2F5Z15DSM5'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: Gtag
  }
}

type Gtag = {
  (command: 'js', date: Date): void
  (command: 'config', id: string, config?: Record<string, unknown>): void
  (command: 'event', name: string, params?: Record<string, unknown>): void
}

let scriptLoaded = false
let lastPageKey = ''

/** Pathname + search only. Hash is omitted so fragments never reach GA. */
export function analyticsPath(pathname: string, search = '') {
  return `${pathname}${search}`
}

export function shouldEnableAnalytics(
  prod = import.meta.env.PROD,
  hostname = typeof window === 'undefined' ? '' : window.location.hostname,
) {
  if (!prod) return false
  return hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '[::1]'
}

export function resetAnalyticsForTests() {
  scriptLoaded = false
  lastPageKey = ''
}

function installGtag() {
  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag() {
    // gtag.js reads the Arguments object from the queue, not a plain array.
    window.dataLayer.push(arguments)
  } as Gtag
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
}

function loadScript() {
  if (scriptLoaded) return
  if (typeof document === 'undefined') return
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
    scriptLoaded = true
    return
  }
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
  scriptLoaded = true
}

export function initAnalytics(options?: { enabled?: boolean }) {
  if (!(options?.enabled ?? shouldEnableAnalytics())) return false
  if (typeof window === 'undefined') return false
  if (!window.gtag) installGtag()
  loadScript()
  return true
}

/**
 * One page_view per distinct path (pathname + search). Returns false when analytics
 * is off or the same path was just sent, so React remounts cannot double-count.
 * `title`: the new page's title, when the caller knows it before document.title is updated.
 */
export function trackPageView(pathname: string, search = '', options?: { enabled?: boolean; title?: string }) {
  if (!initAnalytics(options)) return false
  const path = analyticsPath(pathname, search)
  if (path === lastPageKey) return false
  lastPageKey = path
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: options?.title ?? document.title,
  })
  return true
}
