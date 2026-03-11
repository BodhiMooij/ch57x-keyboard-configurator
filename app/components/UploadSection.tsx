'use client'

import { useState, useEffect } from 'react'
import type { Config } from '../types'
import { configToCh57xYaml } from '../ch57x-export'

declare global {
  interface Window {
    keyboardAPI?: {
      isConnected: () => Promise<boolean>
      isCh57xAttached: () => Promise<boolean>
      uploadCh57x: (yamlContent: string) => Promise<{ ok: boolean; output?: string; error?: string }>
      setCh57xLedMode: (mode: string) => Promise<{ ok: boolean; output?: string; error?: string }>
    }
  }
}

type Props = { config: Config }

const btnStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: 'var(--accent)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--accent-text)',
  fontWeight: 600,
  cursor: 'pointer',
}

const btnSecondary: React.CSSProperties = {
  ...btnStyle,
  background: 'var(--surface-hover)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
}

export function UploadSection({ config }: Props) {
  const [status, setStatus] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const api = typeof window !== 'undefined' ? window.keyboardAPI : undefined
  const apiForUI = mounted ? api : undefined

  const uploadToKeyboard = async () => {
    if (!api?.uploadCh57x || uploading) return
    setUploading(true)
    setStatus('Uploading keys & knob…')
    let uploadResult: { ok: boolean; output?: string; error?: string }
    try {
      uploadResult = await api.uploadCh57x(configToCh57xYaml(config))
    } catch {
      setUploading(false)
      setStatus('Upload failed.')
      return
    }
    setStatus(uploadResult.ok ? 'Keys & knob uploaded. Setting LED mode…' : 'Keys & knob failed. Setting LED mode…')
    const mode = config.ledMode ?? '2'
    let ledResult: { ok: boolean; output?: string; error?: string } = { ok: false, error: 'Not available' }
    if (api.setCh57xLedMode) {
      try {
        ledResult = await api.setCh57xLedMode(mode)
      } catch (_) {}
    }
    setUploading(false)
    const uploadMsg = uploadResult.ok ? 'Keys & knob uploaded.' : 'Keys & knob: ' + (uploadResult.error ?? 'failed') + '.'
    const ledMsg = ledResult.ok ? ' LED mode set.' : ' LED: ' + (ledResult.error ?? 'failed') + '.'
    setStatus(uploadMsg + ledMsg)
  }

  const exportYaml = () => {
    const yaml = configToCh57xYaml(config)
    const blob = new Blob([yaml], { type: 'application/x-yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'small-keyboard-ch57x.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!apiForUI) {
    return (
      <section className="card">
        <h2>Upload to keyboard</h2>
        <p className="hint">
          Run the app in Electron to upload: <code>npm run electron:dev</code>. Plug in your CH57x keyboard via USB first.
        </p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>Upload to keyboard</h2>
      <p className="hint">Plug in your keyboard via USB, then upload your settings.</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={uploadToKeyboard} disabled={uploading} style={btnStyle}>
          {uploading ? 'Uploading…' : 'Upload to keyboard'}
        </button>
        <button type="button" onClick={exportYaml} style={btnSecondary}>
          Export YAML
        </button>
      </div>
      {status ? (
        <p className="hint" style={{ marginTop: 10, fontSize: 13 }}>
          {status}
        </p>
      ) : null}
    </section>
  )
}
