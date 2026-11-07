import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { glossary } from '@/content/glossary'
import { usePageTitle } from '@/hooks/usePageTitle'

/** Plain-language definitions, filterable, each linking to the lesson that teaches the term. */
export default function GlossaryPage() {
  usePageTitle('Glossary')
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const groups = useMemo(
    () =>
      glossary
        .map((g) => ({ ...g, entries: g.entries.filter((e) => !needle || `${e.term} ${e.definition}`.toLowerCase().includes(needle)) }))
        .filter((g) => g.entries.length > 0),
    [needle],
  )
  const total = glossary.reduce((n, g) => n + g.entries.length, 0)

  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Glossary"
        title="The words riders use"
        description="Short definitions of the terms the lessons use, in plain language. Each one links to the lesson that explains it properly."
      />
      <div className="mt-8 max-w-md">
        <label htmlFor="glossary-search" className="sr-only">
          Search the glossary
        </label>
        <input
          id="glossary-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${total} terms`}
          className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-ink placeholder:text-ink-subtle focus:border-ignition-500 focus:outline-none"
        />
      </div>
      {groups.length === 0 ? (
        <p className="mt-10 text-ink-muted">No term matches “{query.trim()}”.</p>
      ) : (
        <div className="mt-10 space-y-10">
          {groups.map((g) => (
            <section key={g.title} aria-labelledby={`glossary-${g.title}`}>
              <h2 id={`glossary-${g.title}`} className="text-xl font-semibold text-ink">
                {g.title}
              </h2>
              <dl className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
                {g.entries.map((e) => (
                  <div key={e.term} className="px-5 py-4">
                    <dt className="font-medium text-ink">{e.term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {e.definition}{' '}
                      {e.to && (
                        <Link to={e.to} className="whitespace-nowrap text-ignition-400 hover:text-ignition-300">
                          Learn more
                        </Link>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </Container>
  )
}
