'use client'

import type { LedMode } from '../types'

/** CH57x built-in LED mode options (0x8890): Off, Single key mode, Waterfall. */
const LED_MODE_OPTIONS: { value: LedMode; label: string }[] = [
  { value: '0', label: 'Off' },
  { value: '1', label: 'Single key mode' },
  { value: '2', label: 'Waterfall' },
]

type Props = {
  ledMode: LedMode
  onLedModeChange: (mode: LedMode) => void
}

const selectStyle: React.CSSProperties = {
  minWidth: 120,
  padding: '8px 10px',
  fontFamily: 'inherit',
  fontSize: 13,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text)',
  cursor: 'pointer',
}

export function LedSection({ ledMode, onLedModeChange }: Props) {
  return (
    <section className="card">
      <h2>LED mode</h2>
      <p className="hint">
        <strong>CH57x (0x8890):</strong> choose built-in LED mode. <strong>Upload to keyboard</strong> applies it automatically.
      </p>
      <p className="hint" style={{ marginTop: 6, fontSize: 13 }}>
        <strong>Off</strong> — LEDs off. <strong>Single key mode</strong> — LED lights on the key you press. <strong>Waterfall</strong> — built-in animation.
      </p>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
          LED mode
        </label>
        <select
          value={ledMode}
          onChange={(e) => onLedModeChange(e.target.value as LedMode)}
          style={selectStyle}
        >
          {LED_MODE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  )
}
