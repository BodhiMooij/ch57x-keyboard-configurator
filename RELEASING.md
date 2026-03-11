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

Output is in `dist/` (exact names may include `-arm64` on Apple Silicon):

- `CH57x Keyboard Configurator-1.0.0.dmg` or `...-arm64.dmg` — drag-to-Applications installer
- `CH57x Keyboard Configurator-1.0.0-mac.zip` — zipped app

### If the DMG (or ZIP) is missing from the GitHub release

1. **Check the Actions run** for that tag: open the repo → **Actions** → click the run for your tag. In the “List build artifacts” step you’ll see what was built in `dist/`. If the DMG isn’t there, the build step may have failed or electron-builder didn’t produce it.
2. **Re-run the workflow** after pulling the latest (the release workflow was updated to use `dist/**/*.dmg` and `dist/**/*.zip` so files in subfolders are included). Delete the existing release for that tag, delete the tag (`git push origin :refs/tags/v1.0.0`), then re-push the tag (`git tag -a v1.0.0 -m "Release v1.0.0"` and `git push origin v1.0.0`) to trigger a new run.
3. **Build locally** (see above) and attach the DMG and ZIP to the release manually: **Releases** → edit the release → attach the files from your `dist/` folder.
