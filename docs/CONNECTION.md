# How the keyboard connects to the app

## 1. Physical connection

- **Connect the keyboard** to your Mac with a USB cable.
- The app recognizes the **Small Keyboard** device by USB IDs (Vendor ID `0x1189`, Product ID `0x8890`). It will appear as **“Small Keyboard”** in the port list and be sorted to the top when multiple devices are connected.
- The device must **expose a serial (CDC) port** over USB. Many small boards do this by default (e.g. Arduino, Raspberry Pi Pico, ESP32). If your device is a **CH57x macro keyboard** (VID 1189 / PID 8890, 3 keys + 1 knob from AliExpress etc.), it has **no serial port** — use **[ch57x-keyboard-tool](https://github.com/kriomant/ch57x-keyboard-tool)** and see **`docs/CH57X.md`**. For other “Unnamed” devices, see **`docs/FIRMWARE.md`**.

## 2. Run the app in Electron (required)

The device list and “Connect” only work when the app runs **inside Electron**, not in a normal browser.

```bash
npm run electron:dev
```

This starts Next.js and opens the Electron window. In that window you’ll see the **Keyboard connection** section with a port dropdown. If you only run `npm run dev` and open http://localhost:3000 in Chrome, you will not see any ports and the device cannot be connected.

## 3. Where connection happens in code

| Layer | File | What it does |
|-------|------|--------------|
| **Electron main** | `electron/main.js` | Uses `serialport` to list ports (`SerialPort.list()`), open a port (`new SerialPort({ path, baudRate: 115200 })`), read lines, and write. Exposes this via IPC handlers: `serial:list`, `serial:connect`, `serial:disconnect`, `serial:write`, `serial:detectDevice`. |
| **Preload** | `electron/preload.js` | Exposes `window.keyboardAPI` to the renderer (listSerialPorts, connect, disconnect, write, detectDevice, onSerialData, onSerialError). |
| **UI** | `app/components/SerialSection.tsx` | Calls `keyboardAPI.listSerialPorts()` to fill the dropdown, `keyboardAPI.connect(path)` to connect, and shows status/errors. |

So the “proper” connection path is:

1. **List ports** → `serial:list` in main (SerialPort.list()) → UI gets port paths.
2. **User selects port** (or “Select by button”) → UI calls `serial:connect` with that path.
3. **Main process** opens that path at **115200 baud**, attaches a line parser (`\n`), and forwards lines to the renderer via `serial:data` / `serial:error`.

## 4. Connection settings

- **Baud rate:** 115200 (fixed in `electron/main.js` in `serial:connect` and `serial:detectDevice`).
- **Line format:** The app sends and receives **text lines** ending with `\n`. The device should use the same (e.g. `Serial.println(...)` on Arduino).

## 5. Steps in the app

1. Run `npm run electron:dev`.
2. Plug in the keyboard via USB.
3. In the **Keyboard connection** section, click **Refresh** if the dropdown is empty.
4. Either:
   - Pick the port from the dropdown (e.g. `/dev/cu.usbmodem101` on Mac) and click **Connect**, or  
   - Click **Select by button**, then press the button on the keyboard that sends `IDENTIFY` over serial (see below).
5. When it says “Connected”, use **Send config** to push your key bindings, knob and LED settings to the device.

## 6. If the device is not recognized

- **No ports in the dropdown**  
  - You’re not in Electron → use `npm run electron:dev`.  
  - The device doesn’t expose a serial port → check firmware (CDC/ACM serial over USB).  
  - Cable or port issue → try another USB port/cable.

- **Port appears but Connect fails**  
  - Another app is using the port (Arduino Serial Monitor, etc.) → close it and try again.  
  - Permission denied (Mac) → grant the app access if the system asks, or check System Settings → Privacy & Security.

- **Connected but nothing happens when you Send config**  
  - Device firmware must read lines from serial and handle the JSON config you send; baud rate on the device must be 115200.

## 7. “Select by button” (optional)

For this to work, the device must send the line `IDENTIFY` (e.g. `Serial.println("IDENTIFY");`) when the user presses a specific button. The app listens on all listed ports for that line and then connects to the one that sent it.
