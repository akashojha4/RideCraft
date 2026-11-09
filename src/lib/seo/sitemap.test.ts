import { describe, expect, it } from 'vitest'
import routerSource from '@/app/router.tsx?raw'
import robots from '../../../public/robots.txt?raw'
import sitemapFile from '../../../public/sitemap.xml?raw'
import { getLesson, getModule } from '@/content/curriculum'
import { getAcademyPhase } from '@/content/academy'
import { getScenario } from '@/content/scenarios'
import { EXCLUDED_PATHS, SITE_URL, STATIC_PATHS, sitemapPaths, sitemapXml } from './sitemap'

// Set by `npm run sitemap`, which rewrites public/sitemap.xml instead of only checking it.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}

describe('sitemap', () => {
  // `npm run sitemap` regenerates the file; otherwise this checks it is up to date.
  it('public/sitemap.xml matches the site’s content', async () => {
    if (env.UPDATE_SITEMAP) {
      const fs = (await import(/* @vite-ignore */ `node:${'fs'}`)) as { writeFileSync: (file: URL, data: string) => void }
      fs.writeFileSync(new URL('../../../public/sitemap.xml', import.meta.url), sitemapXml())
      return
    }
    expect(sitemapFile).toBe(sitemapXml())
  })

  it('every static route in the router is listed or deliberately excluded', () => {
    const routes = [...routerSource.matchAll(/path: '([^']+)'/g)].map((m) => `/${m[1]}`).filter((p) => !p.includes(':') && p !== '/*')
    const listed = new Set<string>([...STATIC_PATHS, ...Object.keys(EXCLUDED_PATHS)])
    expect(routes.filter((r) => !listed.has(r))).toEqual([])
  })

  it('lists only pages that exist, once each, on the canonical domain', () => {
    const paths = sitemapPaths()
    expect(new Set(paths).size).toBe(paths.length)
    for (const p of paths) {
      expect(p === '/' || !p.endsWith('/')).toBe(true)
      expect(p).not.toMatch(/[?#]/)
      const [, a, b, c] = p.split('/')
      if (a === 'learn' && b === 'phase') expect(getAcademyPhase(c), p).toBeTruthy()
      else if (a === 'learn' && c) expect(getLesson(b, c), p).toBeTruthy()
      else if (a === 'learn' && b) expect(getModule(b), p).toBeTruthy()
      else if (a === 'scenarios' && b) expect(getScenario(b), p).toBeTruthy()
    }
    for (const excluded of Object.keys(EXCLUDED_PATHS)) expect(paths).not.toContain(excluded)
    expect(sitemapXml()).not.toMatch(new RegExp(`<loc>(?!${SITE_URL.replace(/\./g, '\\.')})`))
  })

  it('robots.txt points at the sitemap', () => {
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
  })
})
