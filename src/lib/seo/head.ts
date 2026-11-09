import { OG_IMAGE, SITE_NAME, canonicalUrl, type PageMeta } from './meta'

/*
 * The head tags for a page, in two forms from one list: applied to the live document on each
 * navigation, and as HTML for the build to write into each page's file.
 */

type Tag = { kind: 'meta'; key: 'name' | 'property'; id: string; content: string } | { kind: 'link'; rel: string; href: string }

export function headTags(meta: PageMeta): Tag[] {
  const url = canonicalUrl(meta)
  const tags: Tag[] = [
    { kind: 'meta', key: 'name', id: 'description', content: meta.description },
    { kind: 'meta', key: 'name', id: 'robots', content: meta.noindex ? 'noindex, follow' : 'index, follow' },
    { kind: 'meta', key: 'property', id: 'og:site_name', content: SITE_NAME },
    { kind: 'meta', key: 'property', id: 'og:type', content: meta.ogType ?? 'website' },
    { kind: 'meta', key: 'property', id: 'og:title', content: meta.title },
    { kind: 'meta', key: 'property', id: 'og:description', content: meta.description },
    { kind: 'meta', key: 'property', id: 'og:image', content: OG_IMAGE },
    { kind: 'meta', key: 'property', id: 'og:image:width', content: '1200' },
    { kind: 'meta', key: 'property', id: 'og:image:height', content: '630' },
    { kind: 'meta', key: 'property', id: 'og:image:alt', content: 'RideCraft — free, interactive motorcycle riding lessons' },
    { kind: 'meta', key: 'property', id: 'og:locale', content: 'en_IN' },
    { kind: 'meta', key: 'name', id: 'twitter:card', content: 'summary_large_image' },
    { kind: 'meta', key: 'name', id: 'twitter:title', content: meta.title },
    { kind: 'meta', key: 'name', id: 'twitter:description', content: meta.description },
    { kind: 'meta', key: 'name', id: 'twitter:image', content: OG_IMAGE },
  ]
  // An unknown address has no canonical page; everything else names its own.
  if (!meta.notFound) {
    tags.push({ kind: 'meta', key: 'property', id: 'og:url', content: url })
    tags.push({ kind: 'link', rel: 'canonical', href: url })
  }
  return tags
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The tags as HTML, for the page files the build writes. */
export function headHtml(meta: PageMeta) {
  const lines = [`<title>${escapeHtml(meta.title)}</title>`]
  for (const t of headTags(meta)) {
    lines.push(t.kind === 'meta' ? `<meta ${t.key}="${t.id}" content="${escapeHtml(t.content)}" data-seo />` : `<link rel="${t.rel}" href="${escapeHtml(t.href)}" data-seo />`)
  }
  return lines.join('\n    ')
}

/** Put the page's tags in the live document, replacing the previous page's. */
export function applyHead(meta: PageMeta, doc: Document = document) {
  doc.title = meta.title
  const wanted = headTags(meta)
  const keep = new Set<Element>()
  for (const t of wanted) {
    const selector = t.kind === 'meta' ? `meta[${t.key}="${t.id}"]` : `link[rel="${t.rel}"]`
    let el = doc.head.querySelector(selector)
    if (!el) {
      el = doc.createElement(t.kind)
      if (t.kind === 'meta') el.setAttribute(t.key, t.id)
      else el.setAttribute('rel', t.rel)
      el.setAttribute('data-seo', '')
      doc.head.appendChild(el)
    }
    if (t.kind === 'meta') el.setAttribute('content', t.content)
    else el.setAttribute('href', t.href)
    keep.add(el)
  }
  // Drop tags the new page doesn't have (e.g. the canonical on a not-found page).
  for (const el of doc.head.querySelectorAll('[data-seo]')) if (!keep.has(el)) el.remove()
}
