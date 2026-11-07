import { useCallback, useEffect, useRef, useState } from 'react'
import { speakable, type NarrationCue } from '@/components/situations/narration'

/*
 * Plays a narration script with the browser's own voice (Web Speech API), one cue at a time.
 * Where the browser has no voice, the captions advance on a reading-pace timer instead, so the
 * walkthrough still works. A cue that plays a demonstration step waits until that step has
 * finished (`release`) as well as until it has been spoken. Pausing cancels the speech and
 * resuming starts the current cue again — the one behaviour every browser supports reliably.
 */

export type NarrationStatus = 'idle' | 'playing' | 'paused' | 'done'
export const NARRATION_RATES = [0.8, 1, 1.25] as const
const VOICE_KEY = 'ridecraft:narration-voice'

const synth = () => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null)

/** Long utterances are cut off by some browsers, so a cue is spoken (and captioned) a sentence or two at a time. */
function chunks(text: string) {
  const out: string[] = []
  for (const s of text.split(/(?<=[.!?:])\s+/)) {
    if (out.length && out[out.length - 1].length + s.length < 200) out[out.length - 1] += ` ${s}`
    else out.push(s)
  }
  return out
}

/** How long a caption stays up without a voice: reading pace, slower or faster with the rate. */
const captionMs = (text: string, rate: number) => Math.max(2500, (speakable(text).split(' ').length / 2.6) * 1000) / rate

/** A clear English voice: Indian English if the device has one, then British, then any English. */
function defaultVoice(voices: SpeechSynthesisVoice[]) {
  return voices.find((v) => v.lang === 'en-IN') ?? voices.find((v) => v.lang === 'en-GB') ?? voices.find((v) => v.lang.startsWith('en')) ?? voices[0]
}

export function useNarration(cues: readonly NarrationCue[]) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceName, setVoiceName] = useState<string | null>(() => {
    try {
      return localStorage.getItem(VOICE_KEY)
    } catch {
      return null
    }
  })
  const [index, setIndex] = useState(0)
  // The sentence being spoken now, for the caption (the whole cue without a voice).
  const [caption, setCaption] = useState<string | null>(null)
  const [status, setStatus] = useState<NarrationStatus>('idle')
  const [rate, setRateState] = useState<number>(1)
  const voice = voices.find((v) => v.name === voiceName) ?? defaultVoice(voices)
  // Read by speech callbacks: always the latest settings and where we are.
  const live = useRef({ token: 0, index: 0, spoken: false, released: true, timer: 0 as ReturnType<typeof setTimeout> | 0, rate: 1, voice: undefined as SpeechSynthesisVoice | undefined, cues, advance: undefined as undefined | (() => void) })

  useEffect(() => {
    live.current.rate = rate
    live.current.voice = voice
    live.current.cues = cues
  }, [rate, voice, cues])

  // The voice list arrives asynchronously in most browsers.
  useEffect(() => {
    const s = synth()
    if (!s) return
    const load = () => setVoices(s.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en')))
    const first = setTimeout(load, 0)
    s.addEventListener('voiceschanged', load)
    return () => {
      clearTimeout(first)
      s.removeEventListener('voiceschanged', load)
    }
  }, [])

  const silence = useCallback(() => {
    const L = live.current
    L.token += 1
    if (L.timer) clearTimeout(L.timer)
    L.timer = 0
    synth()?.cancel()
  }, [])

  // Stop speaking if the lesson is left mid-sentence.
  useEffect(() => silence, [silence])

  const speak = useCallback(
    function speakCue(k: number) {
      const L = live.current
      silence()
      const cue = L.cues[k]
      if (!cue) {
        setStatus('done')
        return
      }
      const token = L.token
      L.index = k
      L.spoken = false
      L.released = cue.demoStep === undefined
      setIndex(k)
      setCaption(null)
      setStatus('playing')
      const advance = () => {
        if (token !== live.current.token || !live.current.spoken || !live.current.released) return
        speakCue(k + 1)
      }
      const spoken = () => {
        if (token !== live.current.token) return
        live.current.spoken = true
        advance()
      }
      L.advance = advance
      const s = synth()
      if (s && L.voice) {
        const parts = chunks(cue.text)
        parts.forEach((text, n) => {
          const u = new SpeechSynthesisUtterance(speakable(text))
          u.onstart = () => {
            if (token === live.current.token) setCaption(text)
          }
          u.rate = L.rate
          u.voice = L.voice!
          u.lang = L.voice!.lang
          if (n === parts.length - 1) u.onend = spoken
          // A cancelled utterance reports an error too; only a real failure moves on.
          u.onerror = (e) => {
            if (e.error !== 'interrupted' && e.error !== 'canceled') spoken()
          }
          s.speak(u)
        })
      } else {
        L.timer = setTimeout(spoken, captionMs(cue.text, L.rate))
      }
    },
    [silence],
  )

  /** A demonstration step has finished; the cue that plays it may move on once spoken. */
  const release = useCallback((step: number) => {
    const L = live.current
    if (L.cues[L.index]?.demoStep !== step) return
    L.released = true
    L.advance?.()
  }, [])

  const play = useCallback(() => speak(status === 'paused' ? live.current.index : status === 'done' ? 0 : live.current.index), [speak, status])
  const pause = useCallback(() => {
    silence()
    setStatus('paused')
  }, [silence])
  const stop = useCallback(() => {
    silence()
    setStatus('idle')
  }, [silence])
  const goTo = useCallback((k: number) => speak(Math.max(0, Math.min(live.current.cues.length - 1, k))), [speak])
  const setRate = useCallback(
    (r: number) => {
      setRateState(r)
      live.current.rate = r
      if (status === 'playing') speak(live.current.index)
    },
    [speak, status],
  )
  const setVoice = useCallback(
    (name: string) => {
      setVoiceName(name)
      try {
        localStorage.setItem(VOICE_KEY, name)
      } catch {
        // Not remembered; the choice still applies now.
      }
      const v = voices.find((x) => x.name === name)
      live.current.voice = v
      if (status === 'playing') speak(live.current.index)
    },
    [voices, speak, status],
  )

  return {
    cue: cues[index] as NarrationCue | undefined,
    caption: caption ?? cues[index]?.text ?? '',
    index,
    total: cues.length,
    status,
    active: status === 'playing' || status === 'paused',
    rate,
    voices,
    voice,
    hasVoice: !!synth() && voices.length > 0,
    play,
    pause,
    stop,
    goTo,
    next: () => goTo(live.current.index + 1),
    previous: () => goTo(live.current.index - 1),
    release,
    setRate,
    setVoice,
  }
}
