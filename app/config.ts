import type { Config } from './types'

const STORAGE_KEY = 'small-keyboard-config'

export const defaultConfig: Config = {
  keys: [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' },
    { key: 'c', label: 'C' },
  ],
  knob: { ccw: 'volumedown', cw: 'volumeup', press: 'mute' },
  leds: ['#CCFF00', '#CCFF00', '#CCFF00'],
  ledMode: '2', // Waterfall
}

export function loadConfig(): Config {
  if (typeof window === 'undefined') return defaultConfig
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw) as Config & { knob?: { mode?: string; ccw?: string; cw?: string; press?: string } }
    const knob = parsed.knob
    const migratedKnob =
      knob && 'ccw' in knob && 'cw' in knob && 'press' in knob
        ? { ccw: knob.ccw, cw: knob.cw, press: knob.press }
        : defaultConfig.knob
    const ledMode = parsed.ledMode === '0' || parsed.ledMode === '1' || parsed.ledMode === '2' ? parsed.ledMode : defaultConfig.ledMode
    return {
      keys: parsed.keys?.length === 3 ? parsed.keys : defaultConfig.keys,
      knob: migratedKnob,
      leds: Array.isArray(parsed.leds) && parsed.leds.length === 3 ? parsed.leds : defaultConfig.leds,
      ledMode,
    }
  } catch {
    return defaultConfig
  }
}

export function saveConfig(config: Config): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {}
}
