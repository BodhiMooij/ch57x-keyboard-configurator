# CH57x Keyboard Configurator

A Mac app to configure your 3-key + knob CH57x keyboard (e.g. Small Keyboard with USB VID 0x1189 / PID 0x8890). Set key actions, knob behaviour, and LED mode, then upload the config to the device or export YAML for use with [ch57x-keyboard-tool](https://github.com/kriomant/ch57x-keyboard-tool).

## Features

- **Key bindings** — Assign actions to each of the 3 keys (letters, shortcuts, media, mouse, etc.). Mac (Cmd/Option) shortcuts are shown first on macOS.
- **Knob** — Configure rotate-left, rotate-right, and button-press actions.
- **LED** — Choose mode: Off, Single key, or Waterfall (when supported by the firmware).
- **Upload** — Send config to the keyboard over serial when the device is connected, or export a YAML file to use with the CLI.

## Requirements

- **macOS** (to run the app and build installers)
- **Node.js** 18+ (20 recommended)
- For upload: keyboard connected via USB and [ch57x-keyboard-tool](https://github.com/kriomant/ch57x-keyboard-tool) installed (e.g. in `~/Downloads` or `~/.cargo/bin`)

## Development

```bash
# Install dependencies
npm install

# Run Next.js dev server only
npm run dev

# Run app in Electron with hot reload (Next dev + Electron)
npm run electron:dev
```

## Build & release

- **Local build** (Mac only): `npm run electron:build`  
  Output: `dist/` (DMG and ZIP).

- **GitHub release**: Push a version tag (e.g. `v1.0.0`) to trigger the [Release workflow](.github/workflows/release.yml). See [RELEASING.md](RELEASING.md) for steps.

## Project layout

- `app/` — Next.js app (React UI, config, actions, export)
- `electron/` — Electron main process, preload, serial & shell APIs
- `docs/` — Extra docs (e.g. CH57x, connection, firmware)
- `firmware/` — Firmware-related files (see [firmware/README.md](firmware/README.md))

## License

See the repository for license information.

---

**Built by [Bodhi Mooij](https://bodhimooij.com)**
