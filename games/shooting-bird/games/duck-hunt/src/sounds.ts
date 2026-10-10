import { noise, tone, type AudioBus } from '@kgf/core'

export function defineSounds(audio: AudioBus): void {
  audio.define('click', (c, o, t) => {
    tone(c, o, t, { freq: 600, freqEnd: 900, duration: 0.08, type: 'square', gain: 0.12 })
  })

  audio.define('shot', (c, o, t) => {
    noise(c, o, t, { duration: 0.18, gain: 0.5, cutoff: 1800 })
    tone(c, o, t, { freq: 160, freqEnd: 40, duration: 0.15, type: 'triangle', gain: 0.4 })
  })

  audio.define('quack', (c, o, t) => {
    tone(c, o, t, { freq: 520, freqEnd: 300, duration: 0.16, type: 'sawtooth', gain: 0.1 })
    tone(c, o, t, { freq: 500, freqEnd: 280, duration: 0.14, type: 'sawtooth', gain: 0.1, at: 0.2 })
  })

  audio.define('hit', (c, o, t) => {
    tone(c, o, t, { freq: 880, freqEnd: 1320, duration: 0.12, type: 'square', gain: 0.15 })
    tone(c, o, t, { freq: 1320, freqEnd: 1760, duration: 0.15, type: 'square', gain: 0.15, at: 0.1 })
  })

  audio.define('headshot', (c, o, t) => {
    tone(c, o, t, { freq: 1200, duration: 0.1, type: 'sine', gain: 0.18 })
    tone(c, o, t, { freq: 1600, duration: 0.1, type: 'sine', gain: 0.18, at: 0.08 })
    tone(c, o, t, { freq: 2000, duration: 0.18, type: 'sine', gain: 0.18, at: 0.16 })
  })

  audio.define('fall', (c, o, t) => {
    tone(c, o, t, { freq: 900, freqEnd: 150, duration: 0.6, type: 'square', gain: 0.1 })
  })

  audio.define('thud', (c, o, t) => {
    noise(c, o, t, { duration: 0.12, gain: 0.35, cutoff: 400 })
  })

  audio.define('escape', (c, o, t) => {
    tone(c, o, t, { freq: 400, freqEnd: 1200, duration: 0.45, type: 'square', gain: 0.08 })
  })

  audio.define('laugh', (c, o, t) => {
    for (let i = 0; i < 5; i++) {
      tone(c, o, t, { freq: 300 + (i % 2) * 80, duration: 0.11, type: 'square', gain: 0.12, at: i * 0.15 })
    }
  })

  audio.define('win', (c, o, t) => {
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      tone(c, o, t, { freq, duration: 0.18, type: 'square', gain: 0.14, at: i * 0.13 })
    })
    tone(c, o, t, { freq: 1047, duration: 0.5, type: 'triangle', gain: 0.14, at: 0.55 })
  })

  audio.define('perfect', (c, o, t) => {
    const notes = [784, 988, 1175, 1568, 1975]
    notes.forEach((freq, i) => {
      tone(c, o, t, { freq, duration: 0.15, type: 'sine', gain: 0.16, at: i * 0.09 })
    })
  })

  audio.define('lose', (c, o, t) => {
    const notes = [392, 370, 349, 294]
    notes.forEach((freq, i) => {
      tone(c, o, t, { freq, duration: 0.25, type: 'square', gain: 0.12, at: i * 0.22 })
    })
  })
}
