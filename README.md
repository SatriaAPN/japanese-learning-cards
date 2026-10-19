# カタカタ KataKata · katakana cards

A playful flash-card app for learning katakana. It's one HTML page, with no build step and no server.

- **Two ways to answer:** tap one of 4 choices, or type the romaji. Wrong choices are picked from look-alikes (シ/ツ, ソ/ン, ク/ケ/タ, …) so you can't guess by elimination.
- **Both directions:** カ → ka, ka → カ, or a mix.
- **Pick your rows:** the 46 basic kana plus the 25 voiced ones (ガ, ザ, ダ, バ, パ).
- **Focuses on what you miss:** cards you get wrong come back later in the same round and show up more often afterwards. Progress is saved on your device.
- **Works offline** and installs to your home screen like an app.

## Use it on Android

1. Open the GitHub Pages link in Chrome.
2. Tap **Install** in the app's header, or use Chrome's menu ⋮ → **Add to Home screen**.
3. Open it from your home screen. It runs full-screen and works without internet.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app: markup, styles and script |
| `manifest.webmanifest` | App name, colors and icons for "install" |
| `sw.js` | Service worker: offline cache, refreshes in the background |
| `icons/` | App icons |

## Run locally

```bash
python3 -m http.server 8642
```

Then open <http://localhost:8642>. The service worker serves cached files first, so after editing,
reload twice (or use DevTools → Application → "Update on reload").

## Publishing an update

Push to `main` and GitHub Pages redeploys. Installed apps pick up the new version on the next launch.
If you add or rename files that must work offline, add them to `SHELL` in `sw.js` and bump `VERSION`.
