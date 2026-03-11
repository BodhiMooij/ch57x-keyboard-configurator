'use client'

import { useCallback, useEffect, useState } from 'react'
import { KeyBindRow } from './components/KeyBindRow'
import { KnobSection } from './components/KnobSection'
import { LedSection } from './components/LedSection'
import { UploadSection } from './components/UploadSection'
import type { Config } from './types'
import { defaultConfig, loadConfig, saveConfig } from './config'

export default function Home() {
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [connected, setConnected] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setConfig(loadConfig())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const api = window.keyboardAPI
    if (!api?.isConnected) return
    const check = async () => {
      const serial = await api.isConnected()
      if (api.isCh57xAttached) {
        try {
          const ch57x = await api.isCh57xAttached()
          setConnected(serial || ch57x)
        } catch {
          setConnected(serial)
        }
      } else {
        setConnected(serial)
      }
    }
    check()
    const interval = setInterval(check, 2000)
    return () => clearInterval(interval)
  }, [mounted])

  const updateKey = useCallback((index: 0 | 1 | 2, key: string, label?: string) => {
    setConfig((prev) => {
      const keys = [...prev.keys]
      keys[index] = { key, label: label ?? key }
      const next = { ...prev, keys }
      saveConfig(next)
      return next
    })
  }, [])

  const updateKnob = useCallback((knob: Config['knob']) => {
    setConfig((prev) => {
      const next = { ...prev, knob }
      saveConfig(next)
      return next
    })
  }, [])

  const updateLedMode = useCallback((ledMode: Config['ledMode']) => {
    if (ledMode == null) return
    setConfig((prev) => {
      const next = { ...prev, ledMode }
      saveConfig(next)
      return next
    })
  }, [])

  return (
    <>
      <div className="draggable-region"></div>
      <div className="app">
        <header className="header">
          <div>
            <h1>Keyboard Configurator</h1>
            <p className="subtitle">CH57x (0x8890) | Configure keys, knob &amp; LEDs</p>
          </div>
          {mounted && window.keyboardAPI && (
            <div className="connection-row">
              <span className={connected ? 'connection-badge connection-badge--connected' : 'connection-badge connection-badge--disconnected'}>
                {connected ? 'Connected' : 'Not connected'}
              </span>
            </div>
          )}
        </header>

        <section className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>What you have set</h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
            <li><strong>Key 1</strong> — {config.keys[0]?.label ?? config.keys[0]?.key ?? '—'}</li>
            <li><strong>Key 2</strong> — {config.keys[1]?.label ?? config.keys[1]?.key ?? '—'}</li>
            <li><strong>Key 3</strong> — {config.keys[2]?.label ?? config.keys[2]?.key ?? '—'}</li>
            <li><strong>Knob</strong> — left: {config.knob.ccw}, right: {config.knob.cw}, press: {config.knob.press}</li>
            <li><strong>LED</strong> — mode: {config.ledMode === '0' ? 'Off' : config.ledMode === '1' ? 'Single key mode' : config.ledMode === '2' ? 'Waterfall' : '—'}</li>
          </ul>
        </section>

        <section className="card">
          <h2>Key bindings</h2>
          <p className="hint">Set what each of the 3 keys does.</p>
          <div className="key-rows">
            {config.keys.map((k, i) => (
              <KeyBindRow
                key={i}
                index={i}
                value={k.key}
                label={k.label}
                onChange={(key, label) => updateKey(i as 0 | 1 | 2, key, label)}
              />
            ))}
          </div>
        </section>

        <KnobSection knob={config.knob} onChange={updateKnob} />

        <LedSection
          ledMode={config.ledMode ?? '2'}
          onLedModeChange={updateLedMode}
        />

        <UploadSection config={config} />

        <footer className="app-footer">
          Powered by{' '}
          <a
            href="https://bodhimooij.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            onClick={(e) => {
              const openInBrowser = (window as unknown as { openInBrowser?: (url: string) => void }).openInBrowser
              if (typeof openInBrowser === 'function') {
                e.preventDefault()
                openInBrowser('https://bodhimooij.com')
              }
            }}
          >
            Bodhi Mooij
          </a>
          {' '}
          <svg className="footer-icon" width="16" height="16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="64" height="64" rx="4" fill="#CCFF00" />
            <path d="M20 19V11H10V53H42C48.625 53 54 47.625 54 41V31C54 24.375 48.625 19 42 19H20ZM40 43H20V29H40C42.21 29 44 30.79 44 33V39C44 41.21 42.21 43 40 43Z" fill="#151515" />
            <path d="M54 11C51.24 11 49 13.24 49 16C49 18.76 51.24 21 54 21C56.76 21 59 18.76 59 16C59 13.24 56.76 11 54 11ZM54 20C51.79 20 50 18.21 50 16C50 13.79 51.79 12 54 12C56.21 12 58 13.79 58 16C58 18.21 56.21 20 54 20Z" fill="#151515" />
            <path d="M55.335 13.965L54 15.87L52.665 13.965C52.57 13.83 52.415 13.75 52.255 13.75C51.975 13.75 51.75 13.975 51.75 14.255V18.25H52.65V15.515L53.59 16.855C53.79 17.14 54.215 17.14 54.415 16.855L55.355 15.515V18.25H56.255V14.255C56.255 13.975 56.03 13.75 55.75 13.75C55.585 13.75 55.43 13.83 55.34 13.965H55.335Z" fill="#151515" />
          </svg>
        </footer>
      </div>
    </>
  )
}
