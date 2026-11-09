/*
 * Checks the production build the way Vercel serves it (vercel.json: cleanUrls, no trailing
 * slash, 404.html for anything else), with no extra dependencies. Run after `npm run build`:
 *
 *   npm run check:dist          # check, then exit
 *   npm run check:dist -- --serve   # also keep serving dist/ on http://localhost:4174
 *
 * It verifies: every sitemap URL returns 200 with its own canonical URL and no noindex;
 * robots.txt and sitemap.xml are served and agree; the sitemap has no duplicates;
 * unknown addresses get a real 404; trailing slashes and .html addresses redirect; query
 * strings still reach the page; hashed assets are served.
 */
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const SITE = 'https://www.ridecraft.in'
const PORT = Number(process.env.PORT ?? 4174)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' }

/** Vercel's static routing for this project's vercel.json. */
export function route(urlPath) {
  const p = decodeURIComponent(urlPath)
  if (p !== '/' && p.endsWith('/')) return { status: 308, location: p.replace(/\/+$/, '') }
  if (p.endsWith('.html')) return { status: 308, location: p === '/index.html' ? '/' : p.slice(0, -5) }
  const file = (f) => (fs.existsSync(f) && fs.statSync(f).isFile() ? f : null)
  const hit = p === '/' ? file(path.join(dist, 'index.html')) : file(path.join(dist, `${p}.html`)) ?? file(path.join(dist, p))
  return hit ? { status: 200, file: hit } : { status: 404, file: path.join(dist, '404.html') }
}

function serve() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x')
    const r = route(url.pathname)
    if (r.location) {
      res.writeHead(r.status, { Location: r.location + url.search })
      return res.end()
    }
    const type = TYPES[path.extname(r.file)] ?? 'application/octet-stream'
    // Compressed like Vercel's edge, so size and speed measurements are realistic.
    const br = /\bbr\b/.test(req.headers['accept-encoding'] ?? '') && /text|javascript|json|xml|svg/.test(type)
    res.writeHead(r.status, { 'Content-Type': type, ...(br ? { 'Content-Encoding': 'br' } : {}) })
    const stream = fs.createReadStream(r.file)
    ;(br ? stream.pipe(zlib.createBrotliCompress()) : stream).pipe(res)
  })
}

async function check(base) {
  const problems = []
  const get = (p) => fetch(base + p, { redirect: 'manual' })
  const sitemap = await (await get('/sitemap.xml')).text()
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (new Set(locs).size !== locs.length) problems.push('sitemap has duplicate URLs')
  if (locs.some((u) => !u.startsWith(SITE))) problems.push('sitemap has URLs off the canonical domain')
  const robots = await get('/robots.txt')
  const robotsText = await robots.text()
  if (robots.status !== 200 || !robotsText.includes(`Sitemap: ${SITE}/sitemap.xml`)) problems.push('robots.txt missing or does not reference the sitemap')
  if (/^Disallow:\s*\/\s*$/m.test(robotsText)) problems.push('robots.txt blocks the whole site')

  const assetsSeen = new Set()
  for (const loc of locs) {
    const p = loc.slice(SITE.length) || '/'
    const res = await get(p)
    const html = await res.text()
    if (res.status !== 200) {
      problems.push(`${p}: status ${res.status}`)
      continue
    }
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
    if (canonical !== loc) problems.push(`${p}: canonical ${canonical}`)
    if (/<meta name="robots" content="noindex/.test(html)) problems.push(`${p}: noindex`)
    if ((html.match(/<title>/g) ?? []).length !== 1) problems.push(`${p}: expected one <title>`)
    if (!/<meta name="description" content="[^"]{50,}"/.test(html)) problems.push(`${p}: no description`)
    if (!/<meta property="og:title"/.test(html)) problems.push(`${p}: no Open Graph tags`)
    for (const m of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) assetsSeen.add(m[1])
  }
  for (const a of assetsSeen) if ((await get(a)).status !== 200) problems.push(`asset missing: ${a}`)

  for (const p of ['/does-not-exist', '/learn/basics/no-such-lesson', '/learn/no-such-topic', '/scenarios/no-such-scenario', '/assets/missing-chunk.js']) {
    const res = await get(p)
    if (res.status !== 404) problems.push(`${p}: expected 404, got ${res.status}`)
  }
  const nf = await (await get('/does-not-exist')).text()
  if (!/noindex/.test(nf) || /rel="canonical"/.test(nf)) problems.push('404 page should be noindex with no canonical')
  for (const [from, to] of [['/learn/', '/learn'], ['/learn/basics.html', '/learn/basics'], ['/index.html', '/']]) {
    const res = await get(from)
    if (res.status !== 308 || res.headers.get('location') !== to) problems.push(`${from}: expected 308 → ${to}, got ${res.status} ${res.headers.get('location')}`)
  }
  for (const p of ['/simulators/cockpit?practice=start-and-move-off', '/learn/riding-situations/hill-start?section=watch', '/anatomy?part=clutch']) {
    if ((await get(p)).status !== 200) problems.push(`${p}: query string not served`)
  }
  for (const p of ['/progress', '/progress/assessment']) {
    const res = await get(p)
    const html = await res.text()
    if (res.status !== 200 || !/content="noindex/.test(html)) problems.push(`${p}: should load (200) and be noindex`)
  }
  return { problems, pages: locs.length, assets: assetsSeen.size }
}

const server = serve()
await new Promise((r) => server.listen(PORT, r))
const { problems, pages, assets } = await check(`http://localhost:${PORT}`)
console.log(`check-dist: ${pages} sitemap URLs, ${assets} assets, ${problems.length} problems`)
for (const p of problems) console.log(`  - ${p}`)
if (process.argv.includes('--serve')) console.log(`Serving dist/ on http://localhost:${PORT} (Ctrl+C to stop)`)
else {
  server.close()
  process.exit(problems.length ? 1 : 0)
}
