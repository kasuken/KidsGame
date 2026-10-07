# Kids Game Arcade 🎮

**A free browser arcade for kids:** quick games, colorful visuals, and easy controls for phones, tablets, and desktops.

## Play now

👉 **Start here:** https://kasuken.github.io/KidsGame/

## Why families like it

- **Instant play** — no downloads, no account required.
- **Kid-friendly design** — simple goals and cheerful feedback.
- **Short sessions** — perfect for quick, fun breaks.
- **Works everywhere** — mobile, tablet, or computer browser.

## Games in the arcade

- 🎈 **Balloon Pop Adventure**  
  Pop colorful balloons and practice colors, numbers, and letters.  
  Play: https://kasuken.github.io/KidsGame/balloon-pop-adventure/

- 👾 **Feed the Monster**  
  Feed the monster the right snacks and enjoy silly reactions.  
  Play: https://kasuken.github.io/KidsGame/feed-the-monster/

- 🍓 **Fruity Rescue**  
  Catch falling fruit before it hits the ground.  
  Play: https://kasuken.github.io/KidsGame/fruity-rescue/

- 🦁 **Build a Zoo**  
  Match each animal to the right habitat.  
  Play: https://kasuken.github.io/KidsGame/build-a-zoo/

- 🏖️ **Treasure Beach**  
  Tap sand piles to discover playful beach surprises.  
  Play: https://kasuken.github.io/KidsGame/treasure-beach/

- 🌻 **Garden Guardians**  
  A gentle tower defence adventure: plant flower friends to protect strawberries from cheeky snails. Six gardens start easy and gradually add new flowers and bigger waves. Glowing Rainbow Pop and Snow Cloud buttons tell little players when their special powers are ready.  
  Designed for **iPad in landscape**, with big tap controls (no dragging), optional sound, pause, and saved garden progress. Tap a flower, tap a + patch, then tap **Let’s go!** Flowers fire automatically; moving a flower returns all its coins.  
  Play: https://kasuken.github.io/KidsGame/garden-guardians/

- 🏎️ **Sunshine Rally**  
  An original, retro arcade driving adventure for ages 6+: steer a little red convertible along a perspective road, collect stars, and pass friendly traffic. Six routes grow from a traffic-free ~22-second cruise to a ~65-second sunset trip (longer with slowing or bumps), with gradually higher speeds, stronger bends, and more cars.  
  Made for **iPad**, best in landscape: hold the big **◀ / ▶** buttons to steer; hold **SLOW** with your other hand for bends. The car accelerates automatically. On a keyboard, use **← / →** or **A / D**, **Space / ↓** to slow, and **P / Escape** to pause or resume. There is no timer or game over: bumps and sandy shoulders only slow you down. Every finish earns a badge and unlocks the next trip; collect more stars for a two- or three-star badge.  
  Play: https://kasuken.github.io/KidsGame/sunshine-rally/

## Sunshine Rally development and publishing

From `Sunshine Rally`, run `npm ci`, then `npm run dev` for local play, `npm run build` to type-check and build, or `npm run serve` to preview the production build. It uses the same Vite/TypeScript/PWA toolchain as Garden Guardians, with no separate lint or test runner.

The Pages workflow publishes it at `/KidsGame/sunshine-rally/`. Routes, best badges, and the optional sound setting are saved only on this browser/device; the game still works when storage is unavailable. Leaving the tab or app pauses the trip automatically. After an online visit and service-worker installation, the production game works offline in its own scope; Safari’s **Add to Home Screen** gives an app-like experience. All car and scenery artwork is original, drawn with Canvas/SVG; no Out Run assets or music are used.

## Garden Guardians development and publishing

From `Garden Guardians`, run `npm ci`, then `npm run dev` for local play or `npm run build` to type-check and produce the offline-capable game in `dist/`. Use `npm run serve` to preview the production build. There is no separate lint or test runner.

The GitHub Pages workflow builds every game and publishes the arcade when changes reach `main`. Garden Guardians is published at `/KidsGame/garden-guardians/`; the home button returns to the arcade. After the first online visit, the game can be played offline. On iPad, use Safari's **Add to Home Screen** for an app-like experience, then turn the device sideways. Completed gardens and stars are saved on that browser/device when storage is available.

## Share it

If your kids enjoy it, share the arcade link with friends and classrooms:  
**https://kasuken.github.io/KidsGame/**
