import { Pause, Play, SkipBack, SkipForward, Square, Subtitles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { NARRATION_RATES, type useNarration } from '@/hooks/useNarration'
import { SECTIONS } from './sections'

/*
 * The narrated lesson's controls, kept at the bottom of the screen while it plays: the caption
 * of what is being said, play / pause, previous and next, stop, speed and voice.
 */

export function NarrationBar({ narration }: { narration: ReturnType<typeof useNarration> }) {
  const { cue, caption, index, total, status, rate, voices, voice, hasVoice } = narration
  const section = SECTIONS.find((s) => s.id === cue?.section)
  const playing = status === 'playing'
  return (
    <div role="region" aria-label="Narrated lesson" data-narration={status} data-cue={index + 1} className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-ignition-500/40 bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-t-2xl sm:border-x">
      <p className="font-mono text-xs text-ink-subtle">
        {section?.title} · {index + 1} of {total}
        {!hasVoice && (
          <span className="ml-2 inline-flex items-center gap-1 text-caution-400">
            <Subtitles className="size-3.5" aria-hidden /> No voice in this browser — captions only
          </span>
        )}
      </p>
      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink sm:line-clamp-2" data-caption-text>
        {caption}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={playing ? narration.pause : narration.play} className="flex min-h-11 w-28 items-center justify-center gap-2 rounded-xl bg-ignition-500 px-3 text-sm font-medium text-bg hover:bg-ignition-400">
          {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />} {playing ? 'Pause' : status === 'done' ? 'Play again' : 'Resume'}
        </button>
        <button type="button" onClick={narration.previous} disabled={index === 0} aria-label="Previous part" className="flex size-11 items-center justify-center rounded-xl border border-line text-ink-muted hover:text-ink disabled:opacity-40">
          <SkipBack className="size-4" aria-hidden />
        </button>
        <button type="button" onClick={narration.next} disabled={index >= total - 1} aria-label="Next part" className="flex size-11 items-center justify-center rounded-xl border border-line text-ink-muted hover:text-ink disabled:opacity-40">
          <SkipForward className="size-4" aria-hidden />
        </button>
        <button type="button" onClick={narration.stop} className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm text-ink-muted hover:text-ink">
          <Square className="size-3.5" aria-hidden /> Stop
        </button>
        <div role="group" aria-label="Narration speed" className="flex rounded-xl border border-line bg-surface-sunken p-0.5">
          {NARRATION_RATES.map((r) => (
            <button key={r} type="button" aria-pressed={rate === r} onClick={() => narration.setRate(r)} className={cn('min-h-10 min-w-12 rounded-lg px-2 font-mono text-xs', rate === r ? 'bg-surface-overlay text-ink' : 'text-ink-muted hover:text-ink')}>
              {r}×
            </button>
          ))}
        </div>
        {voices.length > 1 && (
          <label className="flex min-h-11 items-center gap-2 text-xs text-ink-muted">
            Voice
            <select value={voice?.name} onChange={(e) => narration.setVoice(e.target.value)} className="min-h-11 max-w-[12rem] rounded-lg border border-line bg-surface px-2 text-sm text-ink">
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  )
}
