# Pip's Dream OS

A responsive, fictional nursery desktop portfolio built with React, Vite, and CSS. Open the dream files to explore Pip's Lullaby Lab, Nightlight Studio, Dream Delivery Map, and interactive three-scene origin story.

Drag desktop files to rearrange them; moving all four reveals a secret dream file. In Dream Delivery Map, choose a destination by tapping a map landmark or using the destination selector, then send Pip along the animated route. Select a story scene to change its narration, or play the story to cycle through the scenes.

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
