import { categories, parts, type PartId } from '@/components/motorcycle/parts'
import { cn } from '@/lib/cn'

/** Every selectable component, grouped by category. */
export function PartList({ selected, onSelect }: { selected: PartId; onSelect: (id: PartId) => void }) {
  return (
    <nav aria-label="Motorcycle components" className="space-y-4">
      {categories.map((category) => (
        <div key={category.id}>
          <h2 className="mb-2 font-mono text-[11px] tracking-[0.16em] text-ink-subtle uppercase">{category.label}</h2>
          <ul className="flex flex-wrap gap-1.5">
            {category.parts.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={selected === id}
                  onClick={() => onSelect(id)}
                  className={cn(
                    'h-8 rounded-lg border px-3 text-sm transition-colors',
                    selected === id
                      ? 'border-coolant-500/50 bg-coolant-950 text-coolant-200'
                      : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  {parts[id].name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
