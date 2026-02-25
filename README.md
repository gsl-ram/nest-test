# Job Portal Backend

Backend API server built with **NestJS 11**, **MongoDB** (Mongoose), **Redis**, and **JWT authentication**. A **Job Seeking & Hiring Platform** that connects employers and job seekers.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | MongoDB (Mongoose) |
| Cache / Queue | Redis (Bull) |
| Auth | JWT (Passport) |
| Validation | class-validator, class-transformer |
| Password hashing | bcrypt |
| Migrations | migrate-mongo |
| Rate limiting | @nestjs/throttler |
| File uploads | Multer |

---

## Features

### Core
- **User management** – CRUD for users with role-based access
- **JWT authentication** – Login / logout with Bearer tokens
- **Role-based permissions** – admin, job_seeker, employer roles with per-module permissions

### Job Portal
- **Companies** – Employers create and manage company profiles
- **Job seeker profiles** – Education, skills, experience, resume, salary preferences
- **Employer profiles** – Designation, company link, verification status
- **Jobs** – Create, list, search, and manage job postings (DRAFT/OPEN/CLOSED)
- **Applications** – Seekers apply; employers manage candidates (APPLIED → SHORTLISTED → INTERVIEW → REJECTED → HIRED)
- **Job search** – Filter by skills, location, salary, experience, employment type

### Platform
- **File uploads** – Resume (PDF), profile image, company logo
- **Notifications** – In-app notifications for application events
- **Messaging** – Employer–seeker conversations and messages
- **Admin** – Verify companies, moderate jobs, ban users
- **Saved jobs** – Job seekers bookmark jobs
- **Activity logs** – Audit trail for important actions
- **Rate limiting** – Throttling on all routes; stricter limit on applications
- **Background jobs** – Auto-close expired jobs (Bull + Redis)

---

## Project Structure

```
src/
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   ├── skip-permission.decorator.ts
│   │   ├── require-permission.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── permissions.guard.ts
│   └── interfaces/
│       └── jwt-payload.interface.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── companies/
│   ├── job-seeker-profiles/
│   ├── employer-profiles/
│   ├── jobs/
│   ├── applications/
│   ├── uploads/
│   ├── notifications/
│   ├── conversations/
│   ├── messages/
│   ├── admin/
│   ├── saved-jobs/
│   └── activity-logs/
├── database/
│   ├── database.module.ts
│   └── seeders/
├── app.module.ts
└── main.ts

migrations/
uploads/                    # Uploaded files (resumes, images)
```

---

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB (local or cloud)
- Redis (for Bull background jobs)

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
| `REDIS_HOST` | Redis host for Bull (default: `localhost`) |
| `REDIS_PORT` | Redis port (default: `6379`) |

### 3. Run migrations

Apply database migrations:

```bash
npm run migrate:up
```

### 4. Seed the database

Creates roles (admin, job_seeker, employer) and default admin user:

```bash
npm run seed
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

**Protected routes:** Send the token as `Authorization: Bearer <access_token>`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login. Returns `{ access_token }` |
| POST | `/auth/logout` | Required | Logout (client discards token) |

```json
POST /auth/login
{ "username": "admin", "password": "1234" }
```

---

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create user |
| GET | `/users` | List all users |
| GET | `/users/:id` | Get one user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

---

### Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/roles` | Create role |
| GET | `/roles` | List all roles |
| GET | `/roles/:id` | Get one role |
| PATCH | `/roles/:id` | Update role |
| DELETE | `/roles/:id` | Delete role |

---

### Companies

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/companies` | Create company |
| GET | `/companies` | List all companies |
| GET | `/companies/my` | List my companies |
| GET | `/companies/:id` | Get one company |
| PATCH | `/companies/:id` | Update company |
| DELETE | `/companies/:id` | Delete company |

---

### Job Seeker Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/job-seeker-profiles` | Create profile |
| GET | `/job-seeker-profiles/me` | Get my profile |
| GET | `/job-seeker-profiles/:id` | Get profile by ID |
| PATCH | `/job-seeker-profiles/me` | Update my profile |
| PATCH | `/job-seeker-profiles/:id` | Update profile |
| DELETE | `/job-seeker-profiles/:id` | Delete profile |

---

### Employer Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/employer-profiles` | Create profile |
| GET | `/employer-profiles/me` | Get my profile |
| GET | `/employer-profiles/:id` | Get profile by ID |
| PATCH | `/employer-profiles/me` | Update my profile |
| PATCH | `/employer-profiles/:id` | Update profile |
| DELETE | `/employer-profiles/:id` | Delete profile |

---

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/jobs` | Create job |
| GET | `/jobs` | List/search jobs (query: skills, location, salaryMin, salaryMax, experienceLevel, employmentType, search, page, limit) |
| GET | `/jobs/my` | List my jobs |
| GET | `/jobs/:id` | Get one job |
| PATCH | `/jobs/:id` | Update job |
| PATCH | `/jobs/:id/status` | Update job status (DRAFT/OPEN/CLOSED) |
| DELETE | `/jobs/:id` | Delete job |

---

### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications` | Create application (body: jobId, resumeSnapshot?, coverLetter?) |
| GET | `/applications/my` | List my applications |
| GET | `/applications/job/:jobId` | List applications for a job (employer only) |
| GET | `/applications/:id` | Get one application |
| PATCH | `/applications/:id/status` | Update status (APPLIED/SHORTLISTED/INTERVIEW/REJECTED/HIRED) |
| DELETE | `/applications/:id` | Delete application |

---

### Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/uploads/resume` | Upload resume (PDF, max 5MB). Form field: `file` |
| POST | `/uploads/profile-image` | Upload profile image (JPEG/PNG/GIF/WebP, max 2MB) |
| POST | `/uploads/company-logo` | Upload company logo |

Returns `{ url: "/uploads/..." }`. Files served at `/uploads/*`.

---

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications (query: unreadOnly, page, limit) |
| GET | `/notifications/count/unread` | Get unread count |
| GET | `/notifications/:id` | Get one notification |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |

---

### Conversations & Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/conversations` | Create conversation (body: participantIds, jobId?) |
| GET | `/conversations` | List my conversations |
| GET | `/conversations/:id` | Get one conversation |
| POST | `/conversations/:conversationId/messages` | Send message (body: content) |
| GET | `/conversations/:conversationId/messages` | List messages (query: page, limit) |
| PATCH | `/conversations/:conversationId/messages/:id/read` | Mark message as read |

---

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/jobs/pending` | List jobs pending moderation |
| GET | `/admin/companies/pending` | List companies pending verification |
| PATCH | `/admin/companies/:id/verify` | Verify company (body: status) |
| PATCH | `/admin/jobs/:id/moderate` | Moderate job (body: status) |
| PATCH | `/admin/users/:id/ban` | Ban/unban user (body: banned) |

---

### Saved Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/saved-jobs/:jobId` | Save job |
| GET | `/saved-jobs` | List saved jobs |
| GET | `/saved-jobs/:jobId/check` | Check if job is saved |
| DELETE | `/saved-jobs/:jobId` | Remove saved job |

---

## Roles & Permissions

| Role | Description |
|------|-------------|
| **admin** | Full access to all modules |
| **job_seeker** | View jobs; create/view applications; manage own profile |
| **employer** | Manage companies; create/edit jobs; manage applications for own jobs; manage own profile |

---

## Database Migrations

Migrations are run with [migrate-mongo](https://github.com/seppevs/migrate-mongo).

| Command | Description |
|---------|-------------|
| `npm run migrate:create <name>` | Create a new migration file |
| `npm run migrate:up` | Apply pending migrations |
| `npm run migrate:down` | Rollback last migration |
| `npm run migrate:status` | Show migration status |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start server |
| `npm run start:dev` | Start with watch mode |
| `npm run start:prod` | Start production build |
| `npm run build` | Compile TypeScript |
| `npm run seed` | Run seeders (roles + admin user) |
| `npm run migrate:create` | Create migration |
| `npm run migrate:up` | Run migrations |
| `npm run migrate:down` | Rollback migration |
| `npm run migrate:status` | Migration status |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests |
| `npm run lint` | Lint and fix |

---

## Default Seeded Data

| Username | Password | Role |
|----------|----------|------|
| admin | 1234 | admin |

**Roles seeded:** admin, job_seeker, employer

**Important:** Change the default password in production. Run `npm run seed` only once per environment; it skips if data already exists.

---

## Documentation

- [LEARN.md](LEARN.md) – NestJS basics, auth, guards
- [LEARN_2.md](LEARN_2.md) – Roles, migrations, seeders, permissions
- [LEARN_3.md](LEARN_3.md) – Job portal expansion: all new modules and changes
