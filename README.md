# COMP4537-TermProject-APIToy

Health-Reactive Toy Blaster API. Team PrjS3: Justice, Isaac, Cali.

We're building a Web API that lets a video game control a physical toy blaster. When the player loses health, an AI model decides how many shots to fire, the server checks that decision against safety limits, and a Raspberry Pi turns the blaster to face the player and fires.

## What's in here

| Folder | What it is |
| --- | --- |
| `backend/` | API server (Node.js + Express, MySQL) |
| `frontend/` | Client app (React + TypeScript) |
| `docs/` | Architecture diagram and milestone report |

The client and the API server are hosted on two different origins.

## Running it

Each folder has its own README with setup steps. Copy `.env.example` to `.env` and fill it in. Never commit `.env`.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| User | john@john.com | 123 |
| Admin | admin@admin.com | 111 |

Test accounts only. Passwords are stored as hashes.
