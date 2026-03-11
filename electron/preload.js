const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('openInBrowser', (url) => ipcRenderer.invoke('shell:openExternal', url))

contextBridge.exposeInMainWorld('keyboardAPI', {
  listSerialPorts: () => ipcRenderer.invoke('serial:list'),
  connect: (path, baudRate) => ipcRenderer.invoke('serial:connect', path, baudRate),
  disconnect: () => ipcRenderer.invoke('serial:disconnect'),
  write: (text) => ipcRenderer.invoke('serial:write', text),
  isConnected: () => ipcRenderer.invoke('serial:isConnected'),
  isCh57xAttached: () => ipcRenderer.invoke('ch57x:isAttached'),
  detectDevice: () => ipcRenderer.invoke('serial:detectDevice'),
  uploadCh57x: (yamlContent) => ipcRenderer.invoke('ch57x:upload', yamlContent),
  setCh57xLedMode: (mode) => ipcRenderer.invoke('ch57x:led', mode),
  onSerialData: (cb) => {
    ipcRenderer.on('serial:data', (_, data) => cb(data))
  },
  onSerialError: (cb) => {
    ipcRenderer.on('serial:error', (_, err) => cb(err))
  },
})
