# Backend (API server)

Node.js + Express 5 API with MySQL. Auth uses bcrypt-hashed passwords and a JWT in an HttpOnly cookie.
The AI decision comes from Jev, TypeSafe's System One API (`https://api.typesafe.ai`, model `jev-latest`).

## Setup

1. Install dependencies: `npm install`
2. Create the database and load the tables and demo accounts:
   ```bash
   mysql -u <user> -p -e "CREATE DATABASE toy_blaster"
   mysql -u <user> -p toy_blaster < db/schema.sql
   mysql -u <user> -p toy_blaster < db/seed.sql
   ```
3. Copy `.env.example` to `.env` and fill it in (DB credentials, a long random `JWT_SECRET`, the Jev `AI_API_KEY` from https://console.typesafe.ai/keys).
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
| GET | `/api/v1/devices/turret/status` | user | Turret status |
| GET | `/api/v1/devices/turret/log` | user | Turret event log |
| POST | `/api/v1/devices/turret/pan/to` | user | `{ deg }`, move to an absolute angle |
| POST | `/api/v1/devices/turret/pan/by` | user | `{ deg }`, move by a relative angle |
| POST | `/api/v1/devices/turret/pan/center` | user | Move to center |
| POST | `/api/v1/devices/turret/pan/stop` | user | Stop pan movement |
| POST | `/api/v1/devices/turret/pan/zero` | user | Set the current position as zero |
| POST | `/api/v1/devices/turret/pan/release` | user | Release the pan motor |
| POST | `/api/v1/devices/turret/arm` | user | Arm the turret |
| POST | `/api/v1/devices/turret/disarm` | user | Disarm the turret |
| POST | `/api/v1/devices/turret/estop` | user | Stop and disarm the turret |
| POST | `/api/v1/devices/turret/fire` | user | `{ ms? }`, fire for the requested duration (hardware safety limits apply) |
| POST | `/api/v1/devices/turret/servo/angle` | user | `{ angle }`, set the servo angle (requires arming) |
| POST | `/api/v1/devices/turret/servo/rest` | user | Return the servo to its resting position |

Admin routes are protected on the server by `middleware/requireAdmin.js`.
All device routes require the authenticated user's `token` cookie. They proxy the
hardware service's JSON responses and errors; the Python turret service must be
running separately. Configure its base URL with `TURRET_URL` (default
`http://127.0.0.1:5000`) and the gateway request timeout with `TURRET_TIMEOUT_MS`
(default `10000`). Upstream client errors retain their status, upstream 5xx
responses become `502`, unavailable service responses become `503`, and gateway
timeouts become `504`.
