# Making your device detectable by the app

Your device (USB Vendor ID `0x1189`, Product ID `0x8890`) shows up in System Information as **Unnamed Device** but the config app can only talk to it over a **serial port**. To make it detectable and configurable:

1. **Expose a USB serial (CDC) port** so the OS creates a port (e.g. `/dev/cu.usbmodem*` on Mac) that appears in the app’s port list.
2. **Use the same VID/PID** (0x1189 / 0x8890) so the app can label it “Small Keyboard” and put it first in the list.
3. **Implement the serial protocol** (115200 baud, line-based JSON config and optional `IDENTIFY`).

**CDC and VID/PID are set in device firmware.** This repo includes an example that does exactly that: see **`firmware/`** (and `firmware/README.md`). The `firmware/small-keyboard/` project is a Raspberry Pi Pico (RP2040) example using PlatformIO + Arduino-Pico where **CDC serial** and **VID 0x1189 / PID 0x8890** are set in `platformio.ini`; you can build and flash it, or copy the same settings into your own board’s firmware.

---

## 1. Why “Unnamed” and no serial port?

If the device is **Unnamed** and **does not appear** in the app’s port dropdown, it usually means:

- The USB stack is **not** presenting a **CDC/ACM serial interface**.
- The OS sees a generic or custom USB device but no “serial port”, so `SerialPort.list()` doesn’t show it.

**What you need:** firmware that enables **USB CDC (Communications Device Class)** so the device appears as a **virtual serial port**. Then the app will see it and, with VID 0x1189 / PID 0x8890, will recognize it as “Small Keyboard”.

---

## 2. What the app sends and expects

| Direction | Format | When |
|----------|--------|------|
| **App → Device** | One line of JSON, newline (`\n`) at end | When you click **Send config** |
| **Device → App** | Optional: line `IDENTIFY` + newline | When user presses “identify” button (for **Select by button**) |

**Config JSON (one line):**

```json
{"keys":[{"key":"a","label":"A"},{"key":"b","label":"B"},{"key":"c","label":"C"}],"knob":{"mode":"volume"},"leds":["#7c5cff","#7c5cff","#7c5cff"]}
```

- **keys:** array of 3 objects `{ "key": string, "label": string }` (e.g. key codes and display labels).
- **knob:** `{ "mode": "volume" | "brightness" | "scroll" | "custom", "param"?: string }` (use `param` when mode is `"custom"`).
- **leds:** array of 3 hex color strings (e.g. `"#7c5cff"`).

**Baud rate:** 115200.

---

## 3. What to implement in firmware

1. **USB CDC serial**
   - Enable a USB CDC (ACM) composite or single interface so the host sees a serial port.
   - Set USB Vendor ID to `0x1189` and Product ID to `0x8890` so the app can match your device.

2. **Serial port**
   - Open the CDC serial at **115200 baud**.
   - Receive one line (up to newline), parse as JSON, then apply keys/knob/leds to your keymap and LED driver.

3. **Optional: “Select by button”**
   - When the user presses the identify button, send the line `IDENTIFY` followed by newline (e.g. `Serial.println("IDENTIFY");`).

4. **Optional: send something back**
   - After applying config, you can send a line like `OK` so the app’s status area shows it (the app displays any line received).

---

## 4. Platform-specific notes

### Arduino (AVR with USB, or ARM with native USB)

- Use a board that has **native USB** (e.g. Leonardo, Micro, Nano 33 BLE) or a **USB‑serial** chip (e.g. Uno + 16U2). For native USB, the CDC serial is often the default “Serial”.
- Set baud to 115200 and use `Serial.readStringUntil('\n')` or a small line buffer, then parse JSON (e.g. ArduinoJson).
- USB VID/PID are set in the board package or in the USB stack; if you use a generic PID, the app will still list the port but won’t label it “Small Keyboard” unless you set VID to 0x1189 and PID to 0x8890 (possible with custom board definition or a USB stack that allows it).

Example (concept only; adjust to your board and JSON library):

```cpp
#include <ArduinoJson.h>

void setup() {
  Serial.begin(115200);
  // ... init keys, knob, LEDs ...
}

void loop() {
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    if (line.length() > 0) {
      StaticJsonDocument<512> doc;
      if (deserializeJson(doc, line) == DeserializeError::Ok) {
        // Apply keys, knob, leds from doc
      }
    }
  }
  // When identify button pressed: Serial.println("IDENTIFY");
}
```

### Raspberry Pi Pico (C/C++ with TinyUSB or similar)

- Use the **TinyUSB CDC** example or add a CDC ACM task so the Pico appears as a serial port on the host.
- In your USB descriptor, set:
  - `idVendor = 0x1189`
  - `idProduct = 0x8890`
- Open the CDC UART at 115200, read a line, parse JSON, apply config; optionally send `IDENTIFY\n` on button press.

### Raspberry Pi Pico / ESP32 (MicroPython or CircuitPython)

- Use the built-in `usb_cdc` (CircuitPython) or the appropriate USB serial (MicroPython on Pico with the right build).
- Set `board.USB_VENDOR_ID` / `board.USB_PRODUCT_ID` if your port allows (e.g. in `boot.py` or board config) to 0x1189 and 0x8890.
- Read lines from the CDC serial at 115200, parse JSON, update key/knob/LED state; optionally write `"IDENTIFY\n"` when the identify button is pressed.

### Generic (any MCU with USB CDC)

- Implement **USB CDC ACM** (one interface that looks like a serial port).
- Report **Vendor ID 0x1189**, **Product ID 0x8890** in the device descriptor so the app can recognize it.
- Use 115200 baud, line-based protocol: receive one line → JSON config; optionally send one line `IDENTIFY` for the button.

---

## 5. Checklist for “detectable by this app”

| Step | Action |
|------|--------|
| 1 | Firmware enables **USB CDC (ACM)** so the host sees a serial port. |
| 2 | USB descriptors use **VID 0x1189**, **PID 0x8890** (optional but recommended for “Small Keyboard” label). |
| 3 | Serial runs at **115200** baud. |
| 4 | On receiving a **single line** of text, parse it as JSON and apply **keys**, **knob**, **leds**. |
| 5 | (Optional) When the identify button is pressed, send the line **IDENTIFY** so **Select by button** works. |

Once the device exposes a CDC serial port (and optionally uses 0x1189/0x8890), it will appear in the app’s dropdown. If you use that VID/PID, it will be sorted first and shown as **“Small Keyboard”**.
