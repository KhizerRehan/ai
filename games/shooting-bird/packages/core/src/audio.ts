export interface ToneOptions {
  freq: number
  freqEnd?: number
  duration: number
  type?: OscillatorType
  gain?: number
  at?: number
}

export interface NoiseOptions {
  duration: number
  gain?: number
  cutoff?: number
  at?: number
}

export type SoundBuilder = (ctx: AudioContext, out: AudioNode, start: number) => void

export interface AudioBus {
  muted: boolean
  define(name: string, builder: SoundBuilder): void
  play(name: string): void
  destroy(): void
}

const MIN_GAIN = 0.0001

export function tone(ctx: AudioContext, out: AudioNode, start: number, o: ToneOptions): void {
  const t0 = start + (o.at ?? 0)
  const peak = o.gain ?? 0.2
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = o.type ?? 'square'
  osc.frequency.setValueAtTime(o.freq, t0)
  if (o.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.freqEnd), t0 + o.duration)
  }
  env.gain.setValueAtTime(MIN_GAIN, t0)
  env.gain.linearRampToValueAtTime(peak, t0 + 0.01)
  env.gain.exponentialRampToValueAtTime(MIN_GAIN, t0 + o.duration)
  osc.connect(env).connect(out)
  osc.start(t0)
  osc.stop(t0 + o.duration + 0.05)
}

const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>()

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const cached = noiseBuffers.get(ctx)
  if (cached) return cached
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  noiseBuffers.set(ctx, buffer)
  return buffer
}

export function noise(ctx: AudioContext, out: AudioNode, start: number, o: NoiseOptions): void {
  const t0 = start + (o.at ?? 0)
  const peak = o.gain ?? 0.3
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = o.cutoff ?? 2000
  const env = ctx.createGain()
  env.gain.setValueAtTime(MIN_GAIN, t0)
  env.gain.linearRampToValueAtTime(peak, t0 + 0.005)
  env.gain.exponentialRampToValueAtTime(MIN_GAIN, t0 + o.duration)
  src.connect(filter).connect(env).connect(out)
  src.start(t0)
  src.stop(t0 + o.duration + 0.05)
}

export function createAudioBus(): AudioBus {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  const sounds = new Map<string, SoundBuilder>()

  const ensure = (): { ctx: AudioContext; master: GainNode } => {
    if (!ctx || !master) {
      ctx = new AudioContext()
      master = ctx.createGain()
      master.gain.value = 0.6
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return { ctx, master }
  }

  const bus: AudioBus = {
    muted: false,
    define(name, builder) {
      sounds.set(name, builder)
    },
    play(name) {
      if (bus.muted) return
      const builder = sounds.get(name)
      if (!builder) return
      const a = ensure()
      builder(a.ctx, a.master, a.ctx.currentTime)
    },
    destroy() {
      if (ctx) void ctx.close()
      ctx = null
      master = null
    },
  }

  return bus
}
