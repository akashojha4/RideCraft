import { academyPhases, phasePath } from '@/content/academy'
import { visibleModules } from '@/content/curriculum'
import { scenarios } from '@/content/scenarios'

/*
 * The sitemap for search engines: every canonical, publicly useful page, built from the same
 * content the site renders, so a new lesson, phase or scenario is listed automatically.
 *
 * public/sitemap.xml is generated from this (npm run sitemap) and a unit test checks that the
 * file is up to date and that every route in the router is either listed or deliberately excluded.
 */

export const SITE_URL = 'https://www.ridecraft.in'

/** Pages with a fixed address. */
export const STATIC_PATHS = [
  '/',
  '/learn',
  '/challenges',
  '/simulators',
  '/simulators/starting',
  '/simulators/cockpit',
  '/simulators/clutch-explorer',
  '/simulators/clutch-throttle',
  '/simulators/gears',
  '/simulators/ride-and-stop',
  '/anatomy',
  '/scenarios',
  '/checklist',
  '/glossary',
] as const

/** Router paths left out on purpose, and why. */
export const EXCLUDED_PATHS: Record<string, string> = {
  '/progress': 'personal: built from progress saved in the visitor’s browser',
  '/progress/assessment': 'personal: a knowledge test whose questions are drawn afresh each time',
  '/design-system': 'internal: only served while developing',
}

export function sitemapPaths(): string[] {
  const paths = [
    ...STATIC_PATHS,
    ...academyPhases.map((p) => phasePath(p.id)),
    ...visibleModules.filter((m) => m.lessons.length > 0).flatMap((m) => [`/learn/${m.id}`, ...m.lessons.map((l) => `/learn/${m.id}/${l.id}`)]),
    ...scenarios.map((s) => `/scenarios/${s.id}`),
  ]
  return [...new Set(paths)]
}

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export function sitemapXml(): string {
  const urls = sitemapPaths().map((p) => `  <url>\n    <loc>${escapeXml(SITE_URL + (p === '/' ? '/' : p))}</loc>\n  </url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}
