# My Nest App

Backend API server built with **NestJS 11**, **MongoDB** (Mongoose), and **JWT authentication**. Designed as the backend for application clients.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | MongoDB (Cloud) |
| ODM | Mongoose |
| Auth | JWT (Passport) |
| Validation | class-validator, class-transformer |
| Password hashing | bcrypt |
| Migrations | migrate-mongo |

---

## Features

- **User management** – CRUD for users (create, read, update, delete)
- **JWT authentication** – Login / logout with Bearer tokens
- **MongoDB** – Cloud MongoDB via Mongoose
- **Database migrations** – Versioned schema changes via migrate-mongo
- **Seeders** – Default admin user for initial setup

---

## Project Structure

```
src/
├── common/                     # Shared utilities
│   ├── decorators/
│   │   └── public.decorator.ts     # @Public() – skip JWT auth on route
│   ├── guards/
│   │   └── jwt-auth.guard.ts       # Global JWT guard
│   └── interfaces/
│       └── jwt-payload.interface.ts
├── modules/
│   ├── auth/                       # Authentication
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   └── dto/login.dto.ts
│   └── users/                      # User CRUD
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── schemas/user.schema.ts
│       └── dto/
├── database/
│   ├── database.module.ts           # Mongoose connection
│   └── seeders/
│       ├── seeder.ts               # Seeder runner
│       └── user.seeder.ts          # Default admin user
├── app.module.ts
└── main.ts

migrations/                          # migrate-mongo migration files
```

---

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB (local or cloud)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment setup

Copy the example env file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/dbname`) |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRATION` | Token lifetime (e.g. `1d`, `7d`) |
| `PORT` | Server port (default: `3000`) |

### 3. Seed the database (optional)

Creates the default admin user (`admin` / `1234`):

```bash
npm run seed
```

### 4. Run migrations (optional)

For schema changes managed by migrate-mongo:

```bash
npm run migrate:up
```

### 5. Start the server

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server runs at `http://localhost:3000` (or your `PORT`).

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login. Returns `{ access_token }` |
| POST | `/auth/logout` | Required | Logout (client discards token) |

**Login request:**

```json
POST /auth/login
{
  "username": "admin",
  "password": "1234"
}
```

**Protected routes:** Send the token as `Authorization: Bearer <access_token>`

---

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users` | Required | Create user |
| GET | `/users` | Required | List all users |
| GET | `/users/:id` | Required | Get one user |
| PATCH | `/users/:id` | Required | Update user |
| DELETE | `/users/:id` | Required | Delete user |

**Create user request:**

```json
POST /users
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "user"   // optional, default: "user"
}
```

---

## Database Migrations

Migrations are run with [migrate-mongo](https://github.com/seppevs/migrate-mongo).

| Command | Description |
|---------|-------------|
| `npm run migrate:create <name>` | Create a new migration file |
| `npm run migrate:up` | Apply pending migrations |
| `npm run migrate:down` | Rollback last migration |
| `npm run migrate:status` | Show migration status |

Config: `migrate-mongo-config.js` (reads `MONGODB_URI` from `.env`).

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start server |
| `npm run start:dev` | Start with watch mode |
| `npm run start:prod` | Start production build |
| `npm run build` | Compile TypeScript |
| `npm run seed` | Run seeders (admin user) |
| `npm run migrate:create` | Create migration |
| `npm run migrate:up` | Run migrations |
| `npm run migrate:down` | Rollback migration |
| `npm run migrate:status` | Migration status |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests |
| `npm run lint` | Lint and fix |

---

## Default Seeded User

| Username | Password | Role |
|----------|----------|------|
| admin | 1234 | admin |

**Important:** Change the default password in production. Run `npm run seed` only once per environment; it skips if admin already exists.
