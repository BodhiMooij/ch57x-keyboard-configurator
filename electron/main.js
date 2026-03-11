const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const { spawn } = require('child_process')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

// Register IPC handlers immediately so they exist before any window loads
ipcMain.handle('shell:openExternal', (_, url) => {
  if (typeof url === 'string' && url.startsWith('http')) {
    shell.openExternal(url)
  }
  return undefined
})

let mainWindow = null
let activePort = null
let parser = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    minWidth: 420,
    minHeight: 560,
    maxHeight: 1337,
    maxWidth: 720,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f0f12',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (activePort?.isOpen) activePort.close()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// --- Serial port & device detection ---
const SMALL_KEYBOARD_VID = 0x1189
const SMALL_KEYBOARD_PIDS = [0x8890, 0x8840, 0x8842]

function toHexInt(value) {
  if (value == null) return null
  if (typeof value === 'number') return value
  return parseInt(String(value).replace(/^0x/i, ''), 16)
}

ipcMain.handle('serial:list', async () => {
  const ports = await SerialPort.list()
  const mapped = ports.map(p => ({
    path: p.path,
    manufacturer: p.manufacturer || '',
    productId: p.productId ?? '',
    vendorId: p.vendorId ?? '',
  }))
  // Put the Small Keyboard device first when present
  mapped.sort((a, b) => {
    const aMatch = toHexInt(a.vendorId) === SMALL_KEYBOARD_VID && SMALL_KEYBOARD_PIDS.includes(toHexInt(a.productId))
    const bMatch = toHexInt(b.vendorId) === SMALL_KEYBOARD_VID && SMALL_KEYBOARD_PIDS.includes(toHexInt(b.productId))
    if (aMatch && !bMatch) return -1
    if (!aMatch && bMatch) return 1
    return 0
  })
  return mapped
})

ipcMain.handle('serial:connect', async (_, portPath, baudRate = 115200) => {
  if (activePort?.isOpen) {
    activePort.close()
    activePort = null
    parser = null
  }
  try {
    activePort = new SerialPort({
      path: portPath,
      baudRate: Number(baudRate),
    })
    parser = activePort.pipe(new ReadlineParser({ delimiter: '\n' }))
    parser.on('data', (line) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('serial:data', line.trim())
      }
    })
    activePort.on('error', (err) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('serial:error', err.message)
      }
    })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
})

ipcMain.handle('serial:disconnect', async () => {
  if (activePort?.isOpen) {
    activePort.close()
    activePort = null
    parser = null
  }
  return { ok: true }
})

ipcMain.handle('serial:write', async (_, text) => {
  if (!activePort?.isOpen) return { ok: false, error: 'Not connected' }
  return new Promise((resolve) => {
    activePort.write(text + '\n', (err) => {
      resolve(err ? { ok: false, error: err.message } : { ok: true })
    })
  })
})

ipcMain.handle('serial:isConnected', () => !!activePort?.isOpen)

// CH57x keyboard attached (USB VID/PID)? Serial list first; on macOS use ioreg (decimal IDs).
async function isCh57xAttached() {
  const list = await SerialPort.list()
  const found = list.some(p => {
    const vid = toHexInt(p.vendorId)
    const pid = toHexInt(p.productId)
    return Number.isInteger(vid) && Number.isInteger(pid) &&
      vid === SMALL_KEYBOARD_VID && SMALL_KEYBOARD_PIDS.includes(pid)
  })
  if (found) return true
  if (process.platform !== 'darwin') return false
  // ioreg reports idVendor/idProduct in decimal (4489 = 0x1189, 34960 = 0x8890, etc.)
  return new Promise((resolve) => {
    const child = spawn('ioreg', ['-p', 'IOUSB', '-l'], { shell: false })
    let out = ''
    child.stdout?.on('data', d => { out += d.toString() })
    child.on('close', (code) => {
      if (code !== 0) { resolve(false); return }
      const hasVid = out.includes('"idVendor" = 4489')
      const hasPid = [34960, 34880, 34882].some(dec => out.includes('"idProduct" = ' + dec))
      resolve(hasVid && hasPid)
    })
    child.on('error', () => resolve(false))
  })
}

ipcMain.handle('ch57x:isAttached', () => isCh57xAttached())

// Listen on all ports for "IDENTIFY" line (device sends this when user presses the button)
const IDENTIFY_MAGIC = 'IDENTIFY'
const DETECT_TIMEOUT_MS = 15000

ipcMain.handle('serial:detectDevice', async () => {
  if (activePort?.isOpen) {
    activePort.close()
    activePort = null
    parser = null
  }
  const list = await SerialPort.list()
  if (list.length === 0) return null
  const openPorts = []
  let resolved = false
  const cleanup = () => {
    openPorts.forEach(p => { try { p.close() } catch (_) {} })
    openPorts.length = 0
  }
  const tryResolve = (portPath) => {
    if (resolved) return
    resolved = true
    cleanup()
    return portPath
  }
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (resolved) return
      resolved = true
      cleanup()
      resolve(null)
    }, DETECT_TIMEOUT_MS)
    const onIdentify = (portPath) => {
      const path = tryResolve(portPath)
      if (path != null) {
        clearTimeout(timeout)
        resolve(path)
      }
    }
    Promise.all(list.map(async (p) => {
      try {
        const port = new SerialPort({ path: p.path, baudRate: 115200 })
        openPorts.push(port)
        const readline = port.pipe(new ReadlineParser({ delimiter: '\n' }))
        readline.on('data', (line) => {
          if (line.trim() === IDENTIFY_MAGIC) onIdentify(p.path)
        })
        port.on('error', () => {})
      } catch (_) {}
    })).then(() => {}).catch(() => {
      if (!resolved) { resolved = true; clearTimeout(timeout); cleanup(); resolve(null) }
    })
  })
})

// --- CH57x keyboard: upload config via ch57x-keyboard-tool CLI ---
function getCh57xToolPath() {
  const home = app.getPath('home')
  if (process.platform === 'darwin') {
    const downloads = path.join(home, 'Downloads', 'ch57x-keyboard-tool-universal-apple-darwin', 'ch57x-keyboard-tool')
    if (fs.existsSync(downloads)) return downloads
    const cargo = path.join(home, '.cargo', 'bin', 'ch57x-keyboard-tool')
    if (fs.existsSync(cargo)) return cargo
  }
  if (process.platform === 'win32') {
    const cargo = path.join(home, '.cargo', 'bin', 'ch57x-keyboard-tool.exe')
    if (fs.existsSync(cargo)) return cargo
  }
  return process.platform === 'win32' ? 'ch57x-keyboard-tool.exe' : 'ch57x-keyboard-tool'
}

ipcMain.handle('ch57x:upload', async (_, yamlContent) => {
  const tempPath = path.join(os.tmpdir(), `small-keyboard-ch57x-${Date.now()}.yaml`)
  try {
    fs.writeFileSync(tempPath, yamlContent, 'utf8')
  } catch (err) {
    return { ok: false, error: 'Failed to write temp file: ' + err.message }
  }
  return new Promise((resolve) => {
    const cmd = getCh57xToolPath()
    const child = spawn(cmd, ['upload', tempPath], { shell: false })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (d) => { stdout += d.toString() })
    child.stderr?.on('data', (d) => { stderr += d.toString() })
    child.on('close', (code) => {
      try { fs.unlinkSync(tempPath) } catch (_) {}
      if (code === 0) {
        resolve({ ok: true, output: stdout.trim() || 'Uploaded.' })
      } else {
        resolve({ ok: false, error: (stderr || stdout || 'Exit ' + code).trim() })
      }
    })
    child.on('error', (err) => {
      try { fs.unlinkSync(tempPath) } catch (_) {}
      resolve({ ok: false, error: err.code === 'ENOENT' ? 'ch57x-keyboard-tool not found. Install it: https://github.com/kriomant/ch57x-keyboard-tool' : err.message })
    })
  })
})

// CH57x LED mode: 0 = off, 1 = single key mode, 2 = waterfall (0x8890; 0x8840/0x8842 may differ)
ipcMain.handle('ch57x:led', async (_, mode) => {
  const m = String(mode ?? '2')
  return new Promise((resolve) => {
    const cmd = getCh57xToolPath()
    const child = spawn(cmd, ['led', m], { shell: false })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (d) => { stdout += d.toString() })
    child.stderr?.on('data', (d) => { stderr += d.toString() })
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true, output: stdout.trim() || 'LED mode set.' })
      } else {
        resolve({ ok: false, error: (stderr || stdout || 'Exit ' + code).trim() })
      }
    })
    child.on('error', (err) => {
      resolve({ ok: false, error: err.code === 'ENOENT' ? 'ch57x-keyboard-tool not found.' : err.message })
    })
  })
})
