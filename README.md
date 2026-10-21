# rapidcharge-api

NestJS backend for RapidCharge Hub: REST API, WebSocket gateway, background jobs, and the SQL Server and Redis integration.

## Tech

NestJS · TypeScript · SQL Server (`mssql`) · Redis (`ioredis`) · BullMQ · Socket.io · Passport (local, JWT, Google OAuth 2.0) · class-validator · Helmet

## Folder structure

```
src/
├─ config/             Validated environment configuration
├─ common/             Guards, filters, pipes, interceptors, middleware, decorators
├─ infrastructure/
│  ├─ database/        mssql connection pool
│  ├─ redis/           Redis client and helper service
│  ├─ queue/           BullMQ setup
│  └─ logger/
├─ modules/
│  ├─ auth/            Local login, Google OAuth, token rotation, roles
│  ├─ users/
│  ├─ stations/        CRUD and Redis geo search
│  ├─ chargers/        Status and free-slot query (recursive CTE)
│  ├─ bookings/        Redis hold + usp_book_charger
│  ├─ sessions/        Start and stop, usp_end_session_and_bill
│  ├─ payments/        Webhooks and idempotency keys
│  ├─ analytics/       Peak-hour and utilization CTEs
│  ├─ notifications/
│  ├─ audit/
│  └─ health/          Liveness and readiness checks
├─ realtime/           Socket.io gateway and Redis subscriber
└─ jobs/processors/    Hold expiry and no-show release
test/                  unit, e2e, load
```

## Setup

```bash
cp .env.example .env     # fill in DB, Redis, JWT and Google values
npm install
npm run start:dev
```

Requires SQL Server and Redis running (`docker compose up -d` from the repo root) and the scripts in `../database/migrations` applied.

Generate a JWT secret with `openssl rand -base64 48`.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT`, `API_PREFIX` | Server port and route prefix (`api/v1`) |
| `CORS_ORIGIN`, `FRONTEND_URL` | Allowed browser origin and OAuth redirect target |
| `COOKIE_SECURE` | `true` in production (HTTPS only cookies) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` | SQL Server login (least privilege, never `sa`) |
| `DB_ENCRYPT`, `DB_TRUST_SERVER_CERT` | TLS to SQL Server |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Redis connection |
| `JWT_ACCESS_SECRET`, `JWT_ACCESS_TTL`, `REFRESH_TTL_DAYS` | Token settings |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google OAuth |
| `THROTTLE_TTL_SECONDS`, `THROTTLE_LIMIT` | Rate limiting |
| `RAZORPAY_*` | Payments (test mode) |

## API overview

Base path: `/api/v1`

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Email and password login |
| GET | `/auth/google` | Public | Start Google OAuth |
| GET | `/auth/google/callback` | Public | OAuth callback |
| POST | `/auth/oauth/exchange` | Public | Exchange one-time code for tokens |
| POST | `/auth/refresh` | Cookie | Rotate refresh token |
| POST | `/auth/logout` | Cookie | Revoke refresh token |
| GET | `/stations/nearby` | Driver | Redis geo search (`lat`, `lng`, `radius`, `connector`) |
| GET | `/chargers/:id/slots` | Driver | Free slots for a date |
| POST | `/bookings` | Driver | Hold and create a booking |
| POST | `/sessions/start` | Driver | Start charging |
| POST | `/sessions/:id/stop` | Driver | Stop and bill |
| POST | `/payments/webhook` | Signed | Payment provider webhook |
| GET | `/analytics/peak-hours` | Owner | Peak-hour analysis |
| GET | `/analytics/utilization` | Owner | Utilization trend |
| GET | `/health` | Public | Health check |

## Error codes from stored procedures

| SQL error | Meaning | HTTP |
|---|---|---|
| 50001 | Invalid time range | 400 |
| 50002 | Charger unavailable | 400 |
| 50003 | Slot already booked | 409 |
| 50010 | Session not active | 409 |
| 50020 | Provider email not verified | 403 |

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start with watch mode |
| `npm run build` | Compile for production |
| `npm run lint` | Lint the code |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |

## Security notes

- Every DTO uses `whitelist` and `forbidNonWhitelisted` validation.
- All SQL uses parameters; no string-built queries.
- Roles come from the database, never from the client.
- Rate limiting is applied to login, OAuth exchange, booking and payments.
- See `../SECURITY.md` for the full policy.
