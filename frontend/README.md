# BudgetBox (frontend)

This is the frontend scaffold for BudgetBox — a minimal Next.js TypeScript PWA with local persistence and a demo sync API.

## Run locally

cd frontend
npm install
npm run dev

Open http://localhost:3000

## Notes
- Local persistence: localforage stored budgets under key `budget:<id>`
- Demo sync: POST /api/budget (in-memory store)
- To test offline: DevTools → Network → Offline
