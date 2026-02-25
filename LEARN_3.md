# Learning Guide 3: Job Portal Backend Expansion

This guide documents all **changes and new additions** made when evolving the NestJS authentication system into a full **Job Seeking & Hiring Platform**. It assumes familiarity with [LEARN.md](LEARN.md) and [LEARN_2.md](LEARN_2.md).

---

## Table of Contents

1. [Overview: What Was Added](#1-overview-what-was-added)
2. [Phase 1: Identity & Access Layer](#2-phase-1-identity--access-layer)
3. [Phase 2: Profile System](#3-phase-2-profile-system)
4. [Phase 3: Job Management](#4-phase-3-job-management)
5. [Phase 4: Application Workflow](#5-phase-4-application-workflow)
6. [Phase 5: Job Discovery & Search](#6-phase-5-job-discovery--search)
7. [Phase 6: Resume & File Management](#7-phase-6-resume--file-management)
8. [Phase 7: Notifications System](#8-phase-7-notifications-system)
9. [Phase 8: Messaging System](#9-phase-8-messaging-system)
10. [Phase 9: Admin & Moderation](#10-phase-9-admin--moderation)
11. [Phase 10: Platform Enhancements](#11-phase-10-platform-enhancements)
12. [New Dependencies](#12-new-dependencies)
13. [API Routes Summary](#13-api-routes-summary)

---

## 1. Overview: What Was Added

The application grew from a simple auth + users + roles system into a **job portal backend** with:

| New Modules | Purpose |
|-------------|---------|
| **Companies** | Employers create and manage company profiles |
| **JobSeekerProfiles** | Job seekers store education, skills, experience, resume |
| **EmployerProfiles** | Employers link to companies and track verification |
| **Jobs** | Create, list, search, and manage job postings |
| **Applications** | Seekers apply; employers manage candidates |
| **Uploads** | Resume, profile image, company logo uploads |
| **Notifications** | In-app notifications for platform events |
| **Conversations** | Employer–seeker chat threads |
| **Messages** | Messages within conversations |
| **Admin** | Verify companies, moderate jobs, ban users |
| **SavedJobs** | Job seekers bookmark jobs |
| **ActivityLogs** | Audit trail for important actions |

**Platform-wide additions:**
- **ThrottlerGuard** — rate limiting for all routes
- **BullModule** — background jobs (job expiry cleanup)
- **ServeStaticModule** — serve uploaded files

---

## 2. Phase 1: Identity & Access Layer

### Changes to Existing Code

**Role schema** (`src/modules/roles/schemas/role.schema.ts`):
- Permissions became flexible: `Record<string, ModulePermissions>` instead of fixed `users` + `roles`
- Added support for: `jobs`, `applications`, `companies`, `profiles`, `admin`

**Role DTOs** (`src/modules/roles/dto/`):
- `PermissionsDto` extended with optional `jobs`, `applications`, `companies`, `profiles`, `admin`

**Role seeder** (`src/database/seeders/role.seeder.ts`):
- Removed `user` role
- Added `job_seeker` and `employer` roles with appropriate permissions
- Updated `admin` role with full access to all new modules

### New Files

| File | Purpose |
|------|---------|
| `migrations/20260225000000-add-job-portal-roles.js` | Add job_seeker/employer roles; update admin permissions |

### New Roles & Permission Matrix

| Role | Permissions |
|------|-------------|
| **admin** | Full access to users, roles, jobs, applications, companies, profiles, admin |
| **job_seeker** | View jobs; create/view applications; manage own profile |
| **employer** | Manage companies; create/edit jobs; manage applications for own jobs; manage own profile |

---

## 3. Phase 2: Profile System

### New Modules

#### Companies

| File | Purpose |
|------|---------|
| `src/modules/companies/schemas/company.schema.ts` | name, description, website, industry, companySize, location, logo, createdBy, verificationStatus |
| `src/modules/companies/dto/create-company.dto.ts` | Validation for company creation |
| `src/modules/companies/dto/update-company.dto.ts` | Partial update DTO |
| `src/modules/companies/companies.service.ts` | CRUD; ownership checks for edit/delete |
| `src/modules/companies/companies.controller.ts` | REST endpoints |
| `src/modules/companies/companies.module.ts` | Module config |

**Routes:** `POST/GET/PATCH/DELETE /companies`, `GET /companies/my`

#### JobSeekerProfiles

| File | Purpose |
|------|---------|
| `src/modules/job-seeker-profiles/schemas/job-seeker-profile.schema.ts` | userId, education[], skills[], experience[], resume, expectedSalary, preferredLocation, portfolioLinks[] |
| `src/modules/job-seeker-profiles/dto/` | Create/update DTOs |
| `src/modules/job-seeker-profiles/job-seeker-profiles.service.ts` | 1:1 with User; CRUD |
| `src/modules/job-seeker-profiles/job-seeker-profiles.controller.ts` | REST endpoints |

**Routes:** `POST/GET/PATCH/DELETE /job-seeker-profiles`, `GET/PATCH /job-seeker-profiles/me`

#### EmployerProfiles

| File | Purpose |
|------|---------|
| `src/modules/employer-profiles/schemas/employer-profile.schema.ts` | userId, designation, companyId, verificationStatus |
| `src/modules/employer-profiles/dto/` | Create/update DTOs |
| `src/modules/employer-profiles/employer-profiles.service.ts` | 1:1 with User; CRUD |
| `src/modules/employer-profiles/employer-profiles.controller.ts` | REST endpoints |

**Routes:** `POST/GET/PATCH/DELETE /employer-profiles`, `GET/PATCH /employer-profiles/me`

### New Common Decorator

| File | Purpose |
|------|---------|
| `src/common/decorators/current-user.decorator.ts` | Extracts `userId`, `username`, `role`, `permissions` from `req.user` |

---

## 4. Phase 3: Job Management

### New Module

| File | Purpose |
|------|---------|
| `src/modules/jobs/schemas/job.schema.ts` | title, description, requiredSkills[], salaryMin, salaryMax, employmentType, location, companyId, createdBy, status (DRAFT/OPEN/CLOSED), moderationStatus, expiryDate, experienceLevel |
| `src/modules/jobs/dto/create-job.dto.ts` | Create job validation |
| `src/modules/jobs/dto/update-job.dto.ts` | Partial update |
| `src/modules/jobs/dto/search-jobs.dto.ts` | Query params for search |
| `src/modules/jobs/jobs.service.ts` | CRUD; ownership; company validation |
| `src/modules/jobs/jobs.controller.ts` | REST endpoints |
| `src/modules/jobs/jobs.module.ts` | Module config |

**Routes:** `POST/GET/PATCH/DELETE /jobs`, `GET /jobs/my`, `PATCH /jobs/:id/status`

**Logic:** Only employers can create jobs; company must belong to the employer. Jobs can be DRAFT, OPEN, or CLOSED.

---

## 5. Phase 4: Application Workflow

### New Module

| File | Purpose |
|------|---------|
| `src/modules/applications/schemas/application.schema.ts` | jobId, seekerId, resumeSnapshot, coverLetter, status (APPLIED → SHORTLISTED → INTERVIEW → REJECTED → HIRED), appliedAt |
| `src/modules/applications/dto/create-application.dto.ts` | jobId, resumeSnapshot, coverLetter |
| `src/modules/applications/dto/update-application-status.dto.ts` | status update |
| `src/modules/applications/applications.service.ts` | Create; list by seeker/job; update status; ownership checks |
| `src/modules/applications/applications.controller.ts` | REST endpoints |
| `src/modules/applications/applications.module.ts` | Module config |

**Routes:** `POST /applications`, `GET /applications/my`, `GET /applications/job/:jobId`, `GET/:id`, `PATCH/:id/status`, `DELETE/:id`

**Logic:** One application per seeker per job (unique constraint). Employers can update status for applications on their jobs. Creates notification on job owner when application submitted.

---

## 6. Phase 5: Job Discovery & Search

Integrated into the **Jobs** module. `GET /jobs` accepts query params:

| Param | Type | Purpose |
|-------|------|---------|
| skills | string[] | Filter by required skills |
| location | string | Regex match on location |
| salaryMin | number | Job's salaryMax >= value |
| salaryMax | number | Job's salaryMin <= value |
| experienceLevel | string | Exact match |
| employmentType | enum | FULL_TIME, PART_TIME, CONTRACT, REMOTE, HYBRID |
| search | string | Regex on title + description |
| page | number | Pagination |
| limit | number | Page size (max 100) |

Returns `{ jobs, total, page, limit }`.

---

## 7. Phase 6: Resume & File Management

### New Module

| File | Purpose |
|------|---------|
| `src/modules/uploads/uploads.controller.ts` | Multer-based file uploads |
| `src/modules/uploads/uploads.module.ts` | Module config |

**Endpoints:**
- `POST /uploads/resume` — PDF only, max 5MB
- `POST /uploads/profile-image` — JPEG/PNG/GIF/WebP, max 2MB
- `POST /uploads/company-logo` — Same as profile-image

**Storage:** Local disk under `uploads/resumes` and `uploads/images`. Files served via `ServeStaticModule` at `/uploads/*`.

**Permissions:** `profiles.edit` for resume/profile-image; `companies.edit` for company-logo.

---

## 8. Phase 7: Notifications System

### New Module

| File | Purpose |
|------|---------|
| `src/modules/notifications/schemas/notification.schema.ts` | userId, type, title, body, relatedId, read |
| `src/modules/notifications/notifications.service.ts` | Create; list by user; mark read |
| `src/modules/notifications/notifications.controller.ts` | REST endpoints |
| `src/modules/notifications/notifications.module.ts` | Module config |

**Routes:** `GET /notifications`, `GET /notifications/count/unread`, `GET /notifications/:id`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`

**Types:** `job_application_submitted`, `candidate_shortlisted`, `interview_scheduled`, `job_expiring_soon`, `application_status_updated`

**Integration:** ApplicationsService creates a notification when a job application is submitted.

---

## 9. Phase 8: Messaging System

### New Modules

#### Conversations

| File | Purpose |
|------|---------|
| `src/modules/conversations/schemas/conversation.schema.ts` | participants[], jobId, timestamps |
| `src/modules/conversations/dto/create-conversation.dto.ts` | participantIds, jobId |
| `src/modules/conversations/conversations.service.ts` | Create; find by user; participant check |
| `src/modules/conversations/conversations.controller.ts` | REST endpoints |
| `src/modules/conversations/conversations.module.ts` | Module config |

**Routes:** `POST /conversations`, `GET /conversations`, `GET /conversations/:id`

#### Messages

| File | Purpose |
|------|---------|
| `src/modules/messages/schemas/message.schema.ts` | conversationId, senderId, content, read |
| `src/modules/messages/dto/create-message.dto.ts` | content |
| `src/modules/messages/messages.service.ts` | Create; list by conversation; mark read |
| `src/modules/messages/messages.controller.ts` | REST endpoints |
| `src/modules/messages/messages.module.ts` | Module config |

**Routes:** `POST /conversations/:conversationId/messages`, `GET /conversations/:conversationId/messages`, `PATCH /conversations/:conversationId/messages/:id/read`

**Logic:** Only participants can access conversations and messages. Pagination on messages.

---

## 10. Phase 9: Admin & Moderation

### Schema Changes

| Schema | New Field | Purpose |
|--------|-----------|---------|
| `User` | `isBanned` | Block banned users from login |
| `Company` | `verificationStatus` | pending, verified |
| `Job` | `moderationStatus` | PENDING_APPROVAL, APPROVED, REJECTED |

### Auth Change

- `AuthService.login()` rejects users with `isBanned: true`

### New Module

| File | Purpose |
|------|---------|
| `src/modules/admin/admin.service.ts` | Verify companies; moderate jobs; ban users; list pending |
| `src/modules/admin/admin.controller.ts` | REST endpoints |
| `src/modules/admin/admin.module.ts` | Module config |

**Routes:** `GET /admin/jobs/pending`, `GET /admin/companies/pending`, `PATCH /admin/companies/:id/verify`, `PATCH /admin/jobs/:id/moderate`, `PATCH /admin/users/:id/ban`

**Permissions:** `admin.view` and `admin.edit` required (admin role only).

### New Migration

| File | Purpose |
|------|---------|
| `migrations/20260225000001-add-admin-fields.js` | Add isBanned, verificationStatus, moderationStatus to existing documents |

---

## 11. Phase 10: Platform Enhancements

### Saved Jobs

| File | Purpose |
|------|---------|
| `src/modules/saved-jobs/schemas/saved-job.schema.ts` | userId, jobId |
| `src/modules/saved-jobs/saved-jobs.service.ts` | Save; list; remove; check if saved |
| `src/modules/saved-jobs/saved-jobs.controller.ts` | REST endpoints |
| `src/modules/saved-jobs/saved-jobs.module.ts` | Module config |

**Routes:** `POST /saved-jobs/:jobId`, `GET /saved-jobs`, `GET /saved-jobs/:jobId/check`, `DELETE /saved-jobs/:jobId`

### Activity Logs

| File | Purpose |
|------|---------|
| `src/modules/activity-logs/schemas/activity-log.schema.ts` | userId, action, resource, metadata |
| `src/modules/activity-logs/activity-logs.service.ts` | Log; find by user |
| `src/modules/activity-logs/activity-logs.module.ts` | Module config |

**Integration:** ApplicationsService logs `apply` action when a job application is created.

### Rate Limiting

- **ThrottlerModule** added globally with three tiers:
  - short: 10 req / 1 sec
  - medium: 50 req / 10 sec
  - long: 200 req / 60 sec
- **ThrottlerGuard** registered as `APP_GUARD`
- **Applications** `POST` has custom throttle: 5 per 60 sec

### Background Jobs

| File | Purpose |
|------|---------|
| `src/modules/jobs/jobs-expiry.processor.ts` | Bull processor: close expired jobs |
| `src/modules/jobs/jobs-expiry.service.ts` | Schedule job expiry cron |
| `BullModule` in `app.module.ts` | Redis-backed queue config |

**Cron:** `close-expired` job runs hourly (cron: `0 * * * *`).

---

## 12. New Dependencies

| Package | Purpose |
|---------|---------|
| `@nestjs/mapped-types` | `PartialType` for DTOs |
| `@nestjs/serve-static` | Serve uploaded files |
| `@nestjs/throttler` | Rate limiting |
| `@nestjs/bull` | Background job queues |
| `bull` | Redis-backed queue |
| `multer` | File upload handling |
| `@types/multer` | TypeScript types for multer |
| `uuid` | Unique filenames (uploads use `crypto.randomUUID` instead) |

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `REDIS_HOST` | Redis host for Bull (default: localhost) |
| `REDIS_PORT` | Redis port (default: 6379) |

---

## 13. API Routes Summary

| Module | Method | Route | Permission |
|--------|--------|-------|------------|
| **Auth** | POST | /auth/login | Public |
| **Auth** | POST | /auth/logout | Authenticated |
| **Roles** | * | /roles/:id | roles.view/create/edit/delete |
| **Users** | * | /users/:id | users.view/create/edit/delete |
| **Companies** | * | /companies | companies.view/create/edit/delete |
| **Companies** | GET | /companies/my | companies.view |
| **JobSeekerProfiles** | * | /job-seeker-profiles | profiles.view/create/edit/delete |
| **JobSeekerProfiles** | GET/PATCH | /job-seeker-profiles/me | profiles.view/edit |
| **EmployerProfiles** | * | /employer-profiles | profiles.view/create/edit/delete |
| **EmployerProfiles** | GET/PATCH | /employer-profiles/me | profiles.view/edit |
| **Jobs** | * | /jobs | jobs.view/create/edit/delete |
| **Jobs** | GET | /jobs/my | jobs.view |
| **Jobs** | PATCH | /jobs/:id/status | jobs.edit |
| **Applications** | * | /applications | applications.view/create/edit/delete |
| **Applications** | GET | /applications/my | applications.view |
| **Applications** | GET | /applications/job/:jobId | applications.view |
| **Uploads** | POST | /uploads/resume | profiles.edit |
| **Uploads** | POST | /uploads/profile-image | profiles.edit |
| **Uploads** | POST | /uploads/company-logo | companies.edit |
| **Notifications** | GET | /notifications | profiles.view |
| **Notifications** | GET | /notifications/count/unread | profiles.view |
| **Notifications** | PATCH | /notifications/:id/read | profiles.edit |
| **Notifications** | PATCH | /notifications/read-all | profiles.edit |
| **Conversations** | * | /conversations | profiles.view/create |
| **Messages** | * | /conversations/:id/messages | profiles.view/create/edit |
| **Admin** | GET | /admin/jobs/pending | admin.view |
| **Admin** | GET | /admin/companies/pending | admin.view |
| **Admin** | PATCH | /admin/companies/:id/verify | admin.edit |
| **Admin** | PATCH | /admin/jobs/:id/moderate | admin.edit |
| **Admin** | PATCH | /admin/users/:id/ban | admin.edit |
| **SavedJobs** | * | /saved-jobs | jobs.view |

---

## Run Commands

```bash
# Run migrations
npm run migrate:up

# Seed roles (admin, job_seeker, employer)
npm run seed

# Start server (requires MongoDB + Redis)
npm run start:dev
```
