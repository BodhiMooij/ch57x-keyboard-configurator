# Releasing

## 1.0.0 (and future versions)

### Create a release from your machine

1. **Commit and push** all changes to `main` (or your default branch).
2. **Create and push an annotated tag** for the version (e.g. 1.0.0):
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```
3. **GitHub Actions** will run the [Release workflow](.github/workflows/release.yml):
   - Builds the Next.js app and the Electron Mac app (DMG + ZIP) on `macos-latest`.
   - Creates a **GitHub Release** for that tag and uploads the installable artifacts.

Mac users can then download the **DMG** or **ZIP** from the [Releases](https://github.com/BodhiMooij/ch57x-keyboard-configurator/releases) page.

### Build locally (optional)

To build the Mac app on your own Mac without creating a release:

```bash
npm ci
npm run electron:build
```

Output is in `dist/`:

- `CH57x Keyboard Configurator-1.0.0.dmg` — drag-to-Applications installer
- `CH57x Keyboard Configurator-1.0.0-mac.zip` — zipped app
