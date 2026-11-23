# Backend (API server)

Node.js + Express 5 API with MySQL. Auth uses bcrypt-hashed passwords and a JWT in an HttpOnly cookie.
The AI decision comes from Jev's System One API (`typesafe/jev-1.14`).

## Setup

1. Install dependencies: `npm install`
2. Create the database and load the tables and demo accounts:
   ```bash
   mysql -u <user> -p -e "CREATE DATABASE toy_blaster"
   mysql -u <user> -p toy_blaster < db/schema.sql
   mysql -u <user> -p toy_blaster < db/seed.sql
   ```
3. Copy `.env.example` to `.env` and fill it in (DB credentials, a long random `JWT_SECRET`, the Jev `AI_API_KEY`).
4. Start the server: `npm run dev` (restarts on changes) or `npm start`.
5. Optional: check the Jev key with `node scripts/tryJev.js` (uses 4 credits).

## Deploying

Set the same variables in the host's environment settings, plus:
- `NODE_ENV=production` so the auth cookie is `SameSite=None; Secure` (needed because the client is on a different origin).
- `CLIENT_ORIGIN` to the deployed client's origin (comma-separate several, e.g. `http://localhost:5173,https://client.example`).
- `DB_SSL=true` if the MySQL provider requires TLS.

## Endpoints (all JSON, errors are `{ "error": "message" }`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | none | Health check |
| POST | `/api/v1/auth/register` | none | `{ email, password }`, creates a user |
| POST | `/api/v1/auth/login` | none | `{ email, password }`, sets the `token` cookie |
| POST | `/api/v1/auth/logout` | none | Clears the cookie |
| GET | `/api/v1/users/me` | user | Current user and their request count |
| POST | `/api/v1/health-events` | user | `{ previousHealth, currentHealth, maxHealth? }`, Jev picks a firing time, the safety check caps it |
| GET | `/api/v1/admin/users` | admin | All users with request counts |
| GET | `/api/v1/admin/stats` | admin | Request counts per endpoint |

Admin routes are protected on the server by `middleware/requireAdmin.js`.
