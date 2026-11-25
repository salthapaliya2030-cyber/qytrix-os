# Paris Runaway

A first-person 3D arcade chase game set in a chaotic, fictionalized version of revolutionary Paris. Built for the browser with Three.js and Vite.

## Play / develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Controls

- **W / S or up / down** — control forward pace
- **A / D or left / right** — smoothly strafe across the street
- **Space** — jump over low obstacles
- **Shift** — slide under taller obstacles
- **Ctrl** — sprint while stamina lasts
- **Mouse** — look around after clicking Start
- **Esc** — pause

## Notes

- The scene is rendered in real-time 3D using Three.js.
- Three.js is loaded from jsDelivr, so the first load needs an internet connection.
- The game uses original, stylized crowd characters and arcade obstacle interactions.
- Designed to be lightweight enough for modern Chromebook browsers; lower the browser window size if performance drops.
