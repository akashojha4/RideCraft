import { describe, expect, it } from 'vitest'
import { relatedLessonRefs, relatedLessonsForPage, relatedLessonsForScenario } from '@/content/related'
import { scenarios } from '@/content/scenarios'
import { headHtml, headTags } from './head'
import { allPagePaths, canonicalUrl, pageMeta } from './meta'
import { EXCLUDED_PATHS, SITE_URL, sitemapPaths } from './sitemap'

const pages = allPagePaths().map((p) => ({ p, meta: pageMeta(p) }))

describe('page metadata', () => {
  it('every page the build writes has its own metadata', () => {
    for (const { p, meta } of pages) expect(meta.notFound, p).toBeFalsy()
  })

  it('titles and descriptions are unique, and of a length search results can show', () => {
    const titles = pages.map((x) => x.meta.title)
    const descriptions = pages.map((x) => x.meta.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descriptions).size).toBe(descriptions.length)
    for (const { p, meta } of pages) {
      expect(meta.title.length, `${p} title`).toBeGreaterThanOrEqual(15)
      expect(meta.title.length, `${p} title: ${meta.title}`).toBeLessThanOrEqual(90)
      expect(meta.description.length, `${p} description`).toBeGreaterThanOrEqual(70)
      expect(meta.description.length, `${p} description`).toBeLessThanOrEqual(160)
    }
  })

  it('every sitemap page is indexable with a canonical URL on the canonical domain', () => {
    for (const p of sitemapPaths()) {
      const meta = pageMeta(p)
      expect(meta.noindex, p).toBeFalsy()
      expect(canonicalUrl(meta)).toBe(`${SITE_URL}${p === '/' ? '/' : p}`)
      const tags = headTags(meta)
      expect(tags.find((t) => t.kind === 'link' && t.rel === 'canonical')).toBeTruthy()
      expect(tags.find((t) => t.kind === 'meta' && t.id === 'robots' && t.content.startsWith('index'))).toBeTruthy()
    }
  })

  it('personal pages are kept out of search; unknown addresses are not-found pages without a canonical', () => {
    for (const p of Object.keys(EXCLUDED_PATHS)) expect(pageMeta(p).noindex, p).toBe(true)
    for (const p of ['/nope', '/learn/basics/nope', '/learn/nope', '/learn/phase/nope', '/scenarios/nope', '/learn/basics/understanding-clutch/extra']) {
      const meta = pageMeta(p)
      expect(meta.notFound, p).toBe(true)
      expect(headTags(meta).some((t) => t.kind === 'link')).toBe(false)
    }
  })

  it('a trailing slash resolves to the same canonical page', () => {
    expect(canonicalUrl(pageMeta('/learn/basics/'))).toBe(`${SITE_URL}/learn/basics`)
  })

  it('head HTML escapes text', () => {
    expect(headHtml({ title: 'A & B <c>', description: 'Say "hi" & go', path: '/x' })).toContain('A &amp; B &lt;c&gt;')
  })
})

describe('related lessons', () => {
  it('every reference resolves to a real lesson', () => {
    for (const [page, refs] of Object.entries(relatedLessonRefs)) expect(relatedLessonsForPage(page).length, page).toBe(refs.length)
  })

  it('every decision scenario links to at least one lesson', () => {
    for (const s of scenarios) expect(relatedLessonsForScenario(s.id).length, s.id).toBeGreaterThan(0)
  })
})
