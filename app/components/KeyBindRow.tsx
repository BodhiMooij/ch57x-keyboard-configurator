'use client'

import { useState, useEffect } from 'react'
import { ACTION_OPTIONS, getActionOptions } from '../actions'
import { ActionDropdown } from './ActionDropdown'

type Props = { index: number; value: string; label: string; onChange: (key: string, label?: string) => void }

export function KeyBindRow({ index, value, label, onChange }: Props) {
  const [actionOptions, setActionOptions] = useState(ACTION_OPTIONS)
  useEffect(() => setActionOptions(getActionOptions()), [])

  const options = actionOptions.some((o) => o.value === value)
    ? actionOptions
    : [{ value, label: value }, ...actionOptions]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <span style={{ color: 'var(--text-muted)', width: 80 }}>Key {index + 1}</span>
      <ActionDropdown
        options={options}
        value={value}
        onChange={(v) => onChange(v)}
        style={{ flex: 1 }}
      />
      <input
        type="text"
        value={label}
        onChange={(e) => onChange(value, e.target.value)}
        placeholder="Label"
        style={{
          width: 80,
          padding: '10px 12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text)',
        }}
      />
    </div>
  )
}
