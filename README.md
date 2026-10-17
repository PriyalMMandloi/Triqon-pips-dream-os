# Pip's Dream OS

A responsive, fictional nursery desktop portfolio built with React, Vite, and CSS. Open the four desktop icons to explore Pip's Lullaby Lab, Nightlight Studio, Dream Delivery Map, and three-scene origin story.

The official haX.baby Pip asset pack is in `public/assets/`. Its cloud avatar, lullaby box, dream lantern, and portrait are used in the hero and their corresponding project/story windows.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm run lint
npm run build
```

Sound is generated in the browser with the Web Audio API and starts only after the visitor unmutes and presses play. Pip artwork comes from the official haX.baby asset pack. Google Fonts (DM Sans, DM Mono, Fraunces) are loaded from the Google Fonts CSS endpoint; if unavailable, the site uses local system fallbacks. Lucide React supplies the interface icons.
