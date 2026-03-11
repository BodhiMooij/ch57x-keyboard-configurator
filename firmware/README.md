# Device firmware (CDC + VID/PID)

**CDC serial port and USB VID/PID are set here** — in the firmware that runs on the keyboard’s microcontroller, not in the Mac config app.

This folder contains example firmware you can build and flash onto your device so that:

1. **USB CDC (serial)** is enabled → the Mac sees a serial port and the config app can list and connect to it.
2. **Vendor ID 0x1189** and **Product ID 0x8890** are used → the app shows “Small Keyboard” and sorts it first.
3. The **config protocol** (115200 baud, one JSON line per config) is implemented so the app can send key bindings, knob and LED settings.

## Example: Raspberry Pi Pico (RP2040)

The `small-keyboard/` project is a minimal **PlatformIO** + **Arduino-Pico** example that:

- Sets **VID = 0x1189** and **PID = 0x8890** in `platformio.ini` (so the app recognizes it).
- Uses **USB CDC** as the serial port (default for Arduino-Pico; no extra config needed).
- Runs serial at **115200** baud and reads one line of JSON config per “Send config” from the app.
- Can send **IDENTIFY** when you add a button (for “Select by button” in the app).

### Build and flash (Pico)

1. **In Cursor:** Install the **PlatformIO IDE** extension (this workspace recommends it — you may see a prompt to install when opening the project). Or install from the Extensions view: search for “PlatformIO”.
2. Open the folder `firmware/small-keyboard/` in Cursor (or use File → Open Folder and choose it). PlatformIO will recognize the project and show a bottom status bar and PIO sidebar.
3. Build: **PlatformIO: Build** from the command palette, or `pio run` in a terminal.
4. Put the Pico in bootloader mode (hold BOOTSEL, plug USB), then **PlatformIO: Upload** or `pio run --target upload`.

After flashing, plug the Pico into your Mac; it should appear as a serial port and the config app will list it as **Small Keyboard** (when using the VID/PID in `platformio.ini`).

### If your hardware is not a Pico

- The **same VID/PID and CDC** must be set in **your** board’s firmware (e.g. your own `boards.txt`, TinyUSB descriptors, or USB stack config). See `docs/FIRMWARE.md` for protocol details and notes for other platforms (Arduino, ESP32, etc.).
