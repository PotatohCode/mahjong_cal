# Singapore Mahjong Calculator

A score calculator for Singapore-rules Mahjong. Built with React + Vite, hosted on GitHub Pages, with Sanity.io as the backend.

**Live app:** https://potatohcode.github.io/mahjong_cal/

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Server state | TanStack Query |
| Backend / DB | Sanity.io (free tier) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

---

## Features

- Create games with 2–4 players
- Configurable game settings: starting points, min/max tai, base points, shooter pay
- Tai builder for round results (tile tai, hand type, special hands, circumstance)
- Mid-round bonus recording for any player (kong, animal tiles, complete sets)
- Live scoreboard updated by both round wins and bonuses
- Full game history with round-by-round breakdown
- Resume in-progress games

### Scoring rules (Singapore)

**Base points formula:** `base × 2^(tai − 1)`

| Base | 1 tai | 2 tai | 3 tai | 4 tai | 5 tai |
|------|-------|-------|-------|-------|-------|
| 1 | 1 | 2 | 4 | 8 | 16 |
| 2 | 2 | 4 | 8 | 16 | 32 |
| 3 | 3 | 6 | 12 | 24 | 48 |

**Win payouts:**
- Self-draw: all 3 players pay `base points × 2`
- Discard: discarder pays `base points × 2`, others pay `base points`
- Shooter pay (game setting): discarder pays `base points × 4`, others pay nothing
- Pay-all: one player pays all three opponents

**Mid-round bonuses** (multiplier = base setting):

| Bonus | Points per player |
|---|---|
| Kong declaration | `base` |
| Animal tile | `base` |
| Animal tile (initial hand) | `base × 2` |
| Complete animal / flower / season set | `base × 2` |

Kong and animal tile bonuses can be set to discarder-only.

---

## Project Structure

```
├── src/
│   ├── engine/
│   │   ├── scoreEngine.js       # Core scoring logic (tai, points, exchanges)
│   │   ├── scoreEngine.test.js  # Vitest unit tests
│   │   └── bonusTypes.js        # Bonus definitions and exchange builder
│   ├── lib/
│   │   ├── sanityClient.js      # Sanity connection
│   │   └── queries.js           # All read/write queries
│   ├── pages/
│   │   ├── Home.jsx             # New game setup + resume in-progress
│   │   ├── GameSession.jsx      # Live scoreboard
│   │   ├── RoundCalculator.jsx  # Tai builder + win entry
│   │   ├── BonusEntry.jsx       # Mid-round bonus flow
│   │   ├── History.jsx          # Past sessions list
│   │   ├── SessionDetail.jsx    # Session detail + round breakdown
│   │   └── Players.jsx          # Player management
│   └── components/
│       └── Layout.jsx
├── sanity/
│   ├── schemas/                 # Sanity document schemas
│   │   ├── player.js
│   │   ├── gameSession.js
│   │   ├── round.js
│   │   └── bonus.js
│   └── studio/                  # Sanity Studio (local admin UI)
└── .github/workflows/deploy.yml # GitHub Actions deploy pipeline
```

---

## Local Development

### Prerequisites

- Node.js 20+
- A Sanity project (see Sanity Setup below)

### Run the app

```bash
# Install dependencies
npm install

# Start the React app
npm run dev
# → http://localhost:5173/mahjong_cal/

# (Optional) Start Sanity Studio
cd sanity/studio && npm run dev
# → http://localhost:3333
```

### Run tests

```bash
npm test
```

---

## Sanity Setup

1. Create a free account at [sanity.io](https://sanity.io) and create a new project
2. Install Studio dependencies and start it to verify the schemas load:

```bash
cd sanity/studio
npm install
npm run dev
```

You should see **Player**, **Game Session**, **Round**, and **Bonus** in the Studio sidebar.

### Reset the database

```bash
cd sanity/studio
npx sanity dataset delete production
npx sanity dataset create production --visibility private
```

---

## GitHub Pages Deployment

Deployments trigger automatically on every push to `main` via GitHub Actions. The workflow builds the app, runs tests, and publishes to the `gh-pages` branch.

### First-time setup

1. Configure the required credentials in your repository settings
2. Enable Pages under **Settings → Pages → Source**: deploy from the `gh-pages` branch
3. Push to `main` to trigger the first deploy

The live URL will be `https://<username>.github.io/mahjong_cal/`
