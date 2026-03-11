'use client'

import { useState, useEffect } from 'react'
import type { Config } from '../types'
import { ACTION_OPTIONS, getActionOptions } from '../actions'
import { ActionDropdown } from './ActionDropdown'

type Props = {
  knob: Config['knob']
  onChange: (knob: Config['knob']) => void
}

export function KnobSection({ knob, onChange }: Props) {
  const [actionOptions, setActionOptions] = useState(ACTION_OPTIONS)
  useEffect(() => setActionOptions(getActionOptions()), [])

  function ensureOption(value: string) {
    return actionOptions.some((o) => o.value === value)
      ? actionOptions
      : [{ value, label: value }, ...actionOptions]
  }

  const ccwOptions = ensureOption(knob.ccw)
  const cwOptions = ensureOption(knob.cw)
  const pressOptions = ensureOption(knob.press)

  return (
    <section className="card">
      <h2>Knob</h2>
      <p className="hint">Set the action for rotate left, rotate right, and button push.</p>
      <div style={{ marginTop: 8 }}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          Rotate left
        </label>
        <ActionDropdown
          options={ccwOptions}
          value={knob.ccw}
          onChange={(ccw) => onChange({ ...knob, ccw })}
          style={{ marginTop: 6 }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          Rotate right
        </label>
        <ActionDropdown
          options={cwOptions}
          value={knob.cw}
          onChange={(cw) => onChange({ ...knob, cw })}
          style={{ marginTop: 6 }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          Button push
        </label>
        <ActionDropdown
          options={pressOptions}
          value={knob.press}
          onChange={(press) => onChange({ ...knob, press })}
          style={{ marginTop: 6 }}
        />
      </div>
    </section>
  )
}
