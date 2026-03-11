import type { Config } from './types'

/** Normalize legacy key names to ch57x lowercase action strings. */
function normalizeAction(v: string): string {
  const map: Record<string, string> = {
    Enter: 'enter', Space: 'space', Backspace: 'backspace', Tab: 'tab', Esc: 'esc',
    Copy: 'ctrl-c', Paste: 'ctrl-v', Cut: 'ctrl-x', Play: 'play', Pause: 'play',
    Mute: 'mute', Next: 'next', Prev: 'prev', VolumeUp: 'volumeup', VolumeDown: 'volumedown',
    Click: 'click', WheelUp: 'wheelup', WheelDown: 'wheeldown',
  }
  return map[v] ?? v
}

/**
 * Export our config to ch57x-keyboard-tool YAML format (3 keys + 1 knob).
 */
export function configToCh57xYaml(config: Config): string {
  const k1 = normalizeAction(config.keys[0]?.key ?? 'a')
  const k2 = normalizeAction(config.keys[1]?.key ?? 'b')
  const k3 = normalizeAction(config.keys[2]?.key ?? 'c')
  const ccw = normalizeAction(config.knob.ccw)
  const cw = normalizeAction(config.knob.cw)
  const press = normalizeAction(config.knob.press)

  return `# Exported from Small Keyboard Config for ch57x-keyboard-tool
# Upload: ch57x-keyboard-tool upload this-file.yaml
# See https://github.com/kriomant/ch57x-keyboard-tool

orientation: normal
rows: 1
columns: 3
knobs: 1

layers:
  - buttons:
      - ["${k1}", "${k2}", "${k3}"]
    knobs:
      - ccw: "${ccw}"
        press: "${press}"
        cw: "${cw}"
`
}
