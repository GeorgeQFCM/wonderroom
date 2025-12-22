# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev        # Start Vite dev server on port 3000
npm run build      # TypeScript check + Vite production build
npm run preview    # Preview production build
npm run android    # Build + sync + open in Android Studio
npm run cap:sync   # Sync web assets to Android
npm run cap:open   # Open Android project in Android Studio
```

Type checking: `npx tsc --noEmit`

## Architecture

Wonder Room H5 is a children's cognitive training game built with **Phaser 3 + TypeScript + Vite**, with Capacitor for Android deployment.

### Scene Flow
```
SplashScene → PreloadScene → RoomScene ← → ShadowScene
                                ↑            ↓
                                └────── StoryScene
```

- **PreloadScene** - Loads all assets (animal PNGs, UI elements) with progress bar
- **RoomScene** - Main menu styled as an interactive room; toy box leads to ShadowScene, bookshelf leads to StoryScene
- **ShadowScene** - "Shadow Safari" game: drag animals to match their shadows. 20 levels with increasing difficulty (more items + distractors)
- **StoryScene** - "Story Blocks" game: arrange story cards in correct sequence. 20 levels with different story themes (3-5 cards per level)

### Key Patterns

**Game Configuration** (`src/main.ts`):
- Canvas: 1280x720 (16:9), scales with `Phaser.Scale.FIT`
- Landscape-only with CSS-based rotate prompt for portrait mode
- Touch input with 3 active pointers

**Drag-and-Drop Mechanics** (both game scenes):
- Items use Container objects with custom hit areas
- `SNAP_DISTANCE` (100px) determines successful placement
- Animations use Phaser tweens with Back/Bounce easing
- Success triggers particle effects via 'particle' texture

**Level Generation**:
- `ShadowScene`: Dynamically selects animals from `ANIMAL_TYPES`, positions calculated based on item count
- `StoryScene`: Uses `STORY_THEMES` array with predefined step sequences and colors

### File Structure
- `src/utils/constants.ts` - Game dimensions, colors, timing values
- `src/utils/helpers.ts` - Shared utilities (particle textures, animations)
- `public/assets/animals/` - Animal PNG sprites
- `public/assets/ui/` - UI elements (buttons, arrows, star)

### Build Notes
- Phaser is split into separate chunk via Rollup manual chunks
- Production build uses Terser with console removal
- gzip compression plugin available but currently disabled
