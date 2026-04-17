# Handelbar — React + TypeScript frontend

Frontend for the Handelbar canteen ordering app, built with **Vite + React 18 + TypeScript**.
Talks to the FastAPI backend described in the API spec.

## Quick start

```bash
npm install

# Option A — run against the FastAPI backend (default)
#   The dev server proxies /api/* to http://localhost:8000
npm run dev

# Option B — run standalone against the in-memory mock API
VITE_USE_MOCK=1 npm run dev
```

Open http://localhost:5173.

## Project layout

```
src/
├─ main.tsx              # React entry
├─ App.tsx               # Layout + routing + theme
├─ styles.css            # Design tokens + all component styles
├─ types.ts              # TypeScript types matching the API contract
├─ api.ts                # Typed fetch client (talks to /api or mock)
├─ mockApi.ts            # In-memory mock for VITE_USE_MOCK=1
├─ components/
│  ├─ Sidebar.tsx
│  ├─ Icon.tsx
│  └─ Controls.tsx       # Countdown, ViewToggle, QtyStepper
└─ pages/
   ├─ TodayPage.tsx      # /meals/today + POST /orders/batch
   ├─ WeekPage.tsx       # Week-at-a-glance
   ├─ HistoryPage.tsx    # My orders
   └─ AdminPage.tsx      # /admin/meals + CSV export
```

## Environment variables

| Var | Purpose |
|---|---|
| `VITE_USE_MOCK` | `1` to use the in-memory mock API instead of the backend |
| `VITE_API_BASE` | Override the API base path (default `/api`, proxied to `localhost:8000`) |

Create a `.env.local`:

```
VITE_USE_MOCK=1
```

## How the ordering flow works

1. `GET /meals/today` returns the 3 dishes and the user's existing orders.
2. The user adjusts quantities with the `QtyStepper`. A diff is computed against the original.
3. On **Save order**, `POST /orders/batch` is sent with one entry per meal. `quantity: 0` deletes.
4. If `deadline_passed` is true, all inputs are disabled and a banner is shown.

## Auth

Currently mocked — a static `Authorization: Bearer mock-user-token` header is sent.
Swap the header in `src/api.ts` → `request()` for the Okta JWT once that's wired up.

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## Deploy to GitHub Pages (prototype mode)

This repository includes [deploy-pages.yml](.github/workflows/deploy-pages.yml).

Behavior on deploy:
- Uses mocked API (`VITE_USE_MOCK=1`), so no backend is required.
- Builds with base path `/handelbar/` for this repository name.

Setup once in GitHub:
1. Open **Settings → Pages**.
2. Set source to **GitHub Actions**.
3. Push to `main` (or run the workflow manually).

The site will be published at:
`https://<your-username>.github.io/handelbar/`
