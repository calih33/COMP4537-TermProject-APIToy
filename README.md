# COMP4537-TermProject-APIToy

Health-Reactive Toy Blaster API. Team PrjS3: Justice, Isaac, Cali.

We're building a Web API that lets a video game control a physical toy blaster. When the player loses health, an AI model (Jev, TypeSafe's System One API, model `jev-latest`) decides how many seconds the gel blaster should fire, the server checks that decision against safety limits, and a Raspberry Pi turns the blaster to face the player and fires.

## What's in here

| Folder | What it is |
| --- | --- |
| `backend/` | API server (Node.js + Express, MySQL) |
| `frontend/` | Client app (React + TypeScript) |

The client and the API server are hosted on two different origins.

## Running it

1. Set up and start the API server: see [backend/README.md](backend/README.md).
2. Set up and start the client: see [frontend/README.md](frontend/README.md).
3. Open http://localhost:5173 and log in with a demo account below.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| User | john@john.com | 123 |
| Admin | admin@admin.com | 111 |

Test accounts only. Passwords are stored as hashes.
