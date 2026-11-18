# Qytrix OS

Qytrix OS is a browser-based desktop environment. It is designed to feel like a lightweight operating system while running as a normal website.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Current prototype

- Desktop, taskbar, Start menu, and live clock
- Open, focus, minimize, maximize, close, and drag app windows
- Notes saved in browser local storage
- Calculator, File Explorer shell, Settings, and a basic terminal
- In-app browser window (some sites block iframe embedding)

## Important limitations

A website cannot natively execute arbitrary Windows `.exe` or `.msi` files. That requires a separate Windows runtime or a compatible emulator. Qytrix will treat uploaded executables as untrusted and must not run them directly in the browser.

## Structure

- `src/main.js` — desktop shell and app-window behavior
- `src/styles.css` — desktop and app styling
- `public/` — static assets (wallpapers, icons, fonts)
