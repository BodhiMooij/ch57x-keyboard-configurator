# CH57x keyboard detection and programming (1189:8890)

Your device (USB **Vendor ID 0x1189**, **Product ID 0x8890**) is a **CH57x-based macro keyboard** (e.g. 3 keys + 1 knob). It is **not** a serial (CDC) device: it does not show up as a serial port. It is programmed via a **vendor-specific USB protocol**.

## How detection works

| Approach | What it does |
|----------|--------------|
| **Serial port list** (our app today) | Lists only **CDC serial** devices. The CH57x keyboard **does not appear** here because it has no serial port. |
| **USB by VID/PID** | The keyboard is detected by **USB Vendor ID and Product ID** (0x1189 / 0x8890, and related 0x8840, 0x8842). Tools like [ch57x-keyboard-tool](https://github.com/kriomant/ch57x-keyboard-tool) find it this way and talk to it over raw USB. |

So for **keyboard detection** with a CH57x device:

- You **cannot** “connect” to it as a serial port in this app.
- You **can** detect that it’s plugged in by checking for a USB device with VID `0x1189` and PID `0x8890` (e.g. with `system_profiler SPUSBDataType` on Mac, or a Node `usb`/`node-hid` style API).
- You **program** it using [ch57x-keyboard-tool](https://github.com/kriomant/ch57x-keyboard-tool): create a YAML config, then run `ch57x-keyboard-tool upload your-config.yaml`.

## What to do: use ch57x-keyboard-tool

1. **Install [ch57x-keyboard-tool](https://github.com/kriomant/ch57x-keyboard-tool)**  
   - Prebuilt: [releases](https://github.com/kriomant/ch57x-keyboard-tool/releases)  
   - Or build: `cargo install ch57x-keyboard-tool` (requires Rust).

2. **Connect the keyboard** with a USB cable (required for programming).

3. **Create a YAML config** (see their [example-mapping.yaml](https://github.com/kriomant/ch57x-keyboard-tool/blob/master/example-mapping.yaml) and [doc/actions.md](https://github.com/kriomant/ch57x-keyboard-tool/blob/master/doc/actions.md)).  
   For a **3×1 + 1 knob** keyboard you’d set something like:
   - `rows: 1`, `columns: 3`, `knobs: 1`
   - One layer with 3 button actions and 1 knob (ccw / press / cw).

4. **Validate and upload:**
   ```bash
   ch57x-keyboard-tool validate your-config.yaml
   ch57x-keyboard-tool upload your-config.yaml
   ```
   On Linux you may need `sudo` or [udev rules](https://github.com/kriomant/ch57x-keyboard-tool#permissions-on-linux).

5. **LED (0x8890):** The 3-key+knob model (PID 8890) does not support custom hex colors per key. It has a **built-in LED mode** (e.g. steady on). Set it with:
   ```bash
   ch57x-keyboard-tool led 1
   ```
   In this app, use **Set LED mode** in the Keyboard connection section (runs the same command). The **LED colors** section in the app is for serial devices that accept JSON; it is saved locally but not sent to the CH57x.

## What you can set (all in the app)

| Setting | Where in app | CH57x support |
|--------|----------------|----------------|
| **Key 1, Key 2, Key 3** | Key bindings | Letters, Enter, Space, Backspace, Tab, Esc, Copy/Paste/Cut, Play/Pause/Mute/Next/Prev, VolumeUp/Down, Click, WheelUp/Down. Upload sends these to the keyboard. |
| **Knob** | Knob section | Volume (rotate = volume, press = mute), Scroll (rotate = wheel, press = click), Brightness, or Custom. |
| **LED** | LED colors + Keyboard connection | 0x8890: use **Set LED mode** in Keyboard connection (built-in mode only). LED color pickers are for serial devices / saved in app. |

## Using this app with a CH57x keyboard

- **In this app:** Set keys, knob mode, and (for CH57x) use **Set LED mode** in Keyboard connection. Use **Upload to keyboard** to send key + knob config, or **Export YAML** to save a file.
- **Then:** Run `ch57x-keyboard-tool upload <exported>.yaml` (or use the in-app **Upload to keyboard** button) and optionally **Set LED mode**.

The keyboard is **detected** by ch57x-keyboard-tool when it’s connected (by VID/PID); this app does not open a “connection” to it, it only helps you edit and export the config.

## Supported IDs (from ch57x-keyboard-tool)

- **1189:8890** (your device)
- **1189:8840**
- **1189:8842**

Vendor 0x1189 is Trisat Industrial Co., Ltd. These are the same IDs this app uses to label “Small Keyboard” when they appear as a **serial** port (e.g. if you use different firmware). For stock CH57x firmware, the device will not appear as a serial port; use ch57x-keyboard-tool as above.
