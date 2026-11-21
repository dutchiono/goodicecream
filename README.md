# Good Ice Cream, Great Ice Cream

A small browser game built with Vite and TypeScript.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Layout

- `src/main.ts` starts the app and switches between game views.
- `src/game/` contains the core game state, customers, shop data, and news.
- `src/ui/` contains the screens shown to the player.
- `src/game/characters.ts` defines the four character bases and saved appearance options.
- `src/ui/characterSprite.ts` draws and animates the layered game sprites, including palette changes and PNG exports.
- `src/style.css` contains the app styling.
- `public/` contains static assets used by the game.

## Working With ChatGPT

For remote work in ChatGPT, connect this GitHub repo to ChatGPT/Codex, ask it to make a change, and have it run:

```bash
npm run build
```

before submitting a pull request.

## Character Demo

With the development server running, select **Characters** in the bottom bar,
or open `http://localhost:5173/?characters=1`.
The hosted demo also includes the studio at `https://goodicecream.miono.live/?characters=1`.
Choose a base, change colors, hair, outfits, and accessories, then select
**Use in shop** to put that appearance into the current order. From the title
screen this starts a four-customer demo using the current game state.
Appearance options are saved with customer orders. The download button bakes
a transparent PNG; the game itself renders the character layers live.

Run the focused appearance and legacy-save checks with Node 22.16 or newer:

```bash
npm run test:characters
```
