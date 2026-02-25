# Postman Collection - Job Portal Backend API

This folder contains a complete Postman collection and environment for testing the Job Portal Backend API.

---

## Files

| File | Description |
|-----|-------------|
| `Job_Portal_Backend.postman_collection.json` | All API endpoints organized by module |
| `Job_Portal_Backend.postman_environment.json` | Environment variables (baseUrl, token, IDs) |

---

## Quick Start

### 1. Import into Postman

1. Open Postman
2. Click **Import** (top left)
3. Drag and drop both JSON files, or select them from your file system
4. Both the collection and environment will be imported

### 2. Select Environment

- In the top-right dropdown, select **Job Portal - Local**
- Ensure `baseUrl` is `http://localhost:3000` (or your server URL)

### 3. Get an Access Token

1. Expand the **Job Portal Backend API** collection
2. Open **Auth** > **Login**
3. Click **Send**
4. The collection has a **test script** that automatically saves the `access_token` to the `token` variable
5. All protected routes will now use `Authorization: Bearer {{token}}`

### 4. Run the API Flow

**Typical flow for testing:**

1. **Auth > Login** — Get token (saved automatically)
2. **Roles > List Roles** — Get role IDs for creating users
3. **Users > Create User** — Create job_seeker or employer (use roleId from step 2)
4. **Companies > Create Company** — Create a company (as employer)
5. **Jobs > Create Job** — Create a job (use companyId)
6. **Applications > Create Application** — Apply for job (as job_seeker, use jobId)
7. **Applications > Update Application Status** — Shortlist/interview (as employer)

**For file uploads:** Use the Uploads folder. Select a file in the Body > form-data tab (key: `file`).

---

## Collection Structure

| Folder | Endpoints | Auth |
|--------|-----------|------|
| **Auth** | Login, Logout | Login is public |
| **Users** | CRUD | Required |
| **Roles** | CRUD | Required |
| **Companies** | CRUD, List My | Required |
| **Job Seeker Profiles** | CRUD, Get/Update Me | Required |
| **Employer Profiles** | CRUD, Get/Update Me | Required |
| **Jobs** | CRUD, Search, List My, Update Status | Required |
| **Applications** | CRUD, List My, List by Job, Update Status | Required |
| **Uploads** | Resume, Profile Image, Company Logo | Required (form-data) |
| **Notifications** | List, Unread Count, Mark Read | Required |
| **Conversations** | Create, List, Get | Required |
| **Messages** | Send, List, Mark Read | Required |
| **Admin** | Pending Jobs/Companies, Verify, Moderate, Ban | Admin only |
| **Saved Jobs** | Save, List, Check, Remove | Required |

---

## Variables

The collection uses these variables (set in environment or collection):

| Variable | Purpose | How to Set |
|----------|---------|------------|
| `baseUrl` | API base URL | Environment (default: http://localhost:3000) |
| `token` | JWT access token | Auto-set by Login test script, or manual |
| `userId` | User ID for requests | Copy from response, set in environment |
| `companyId` | Company ID | Copy from Create Company response |
| `jobId` | Job ID | Copy from Create Job response |
| `applicationId` | Application ID | Copy from Create Application response |
| `conversationId` | Conversation ID | Copy from Create Conversation response |
| `roleId` | Role ID | Copy from List Roles response |

**Tip:** After creating a resource, copy the `_id` from the response and paste it into the corresponding environment variable for reuse in subsequent requests.

---

## Sample Payloads

All POST/PATCH requests include sample JSON bodies. Key examples:

### Login
```json
{ "username": "admin", "password": "1234" }
```

### Create User
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "{{roleId}}"
}
```

### Create Company
```json
{
  "name": "Acme Corp",
  "description": "Leading tech company",
  "website": "https://acme.com",
  "industry": "Technology",
  "companySize": "50-200",
  "location": "San Francisco, CA"
}
```

### Create Job
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for an experienced developer.",
  "requiredSkills": ["JavaScript", "TypeScript", "Node.js"],
  "salaryMin": 80000,
  "salaryMax": 120000,
  "employmentType": "FULL_TIME",
  "location": "Remote",
  "companyId": "{{companyId}}",
  "status": "OPEN"
}
```

### Create Application
```json
{
  "jobId": "{{jobId}}",
  "resumeSnapshot": "/uploads/resumes/my-resume.pdf",
  "coverLetter": "I am excited to apply for this position."
}
```

---

## Authentication

- **Collection-level auth:** Bearer token (`{{token}}`)
- **Login request:** Uses "No Auth" (overrides collection auth)
- **Token persistence:** Login response test script saves `access_token` to `token` variable

---

## Rate Limiting

The API has rate limits:
- **General:** 10 req/sec, 50 req/10 sec, 200 req/min
- **Applications (POST):** 5 per 60 seconds

If you hit a limit, you'll get `429 Too Many Requests`.
