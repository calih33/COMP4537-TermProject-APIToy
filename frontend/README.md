# Frontend (client app)

React + TypeScript + Vite. Talks to the API server on a different origin, sending the auth cookie with every request.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `VITE_API_URL` to the API server (e.g. `http://localhost:3000`).
   - `VITE_USE_MOCK=true` uses fake responses from `src/api/mockData.ts`, to work on the UI without the backend. Never enable it in production.
3. Start the dev server: `npm run dev`, then open http://localhost:5173

## Deploying

Run `npm run build` with `VITE_API_URL` set to the deployed API, and host the `dist/` folder.
The host must serve `index.html` for every path (single-page app), otherwise refreshing `/user` or `/admin` gives a 404.

## Pages

| Path | Who | What |
|---|---|---|
| `/login`, `/register` | anyone | Email + password forms |
| `/user` | logged-in users | Email, API usage, and the Jev health-event demo |
| `/admin` | admins | Registered users and API usage per endpoint |
