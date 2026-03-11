/** CH57x LED mode: '0' = off, '1' = single key mode, '2' = waterfall */
export type LedMode = '0' | '1' | '2'

export type Config = {
  keys: { key: string; label: string }[]
  knob: { ccw: string; cw: string; press: string }
  leds: string[]
  /** CH57x built-in LED mode (ignored for serial devices with per-key colors) */
  ledMode?: LedMode
}
