# Task Tracker

A full-stack Task Tracker with authentication and role-based access control (Admin / Manager / Member), built with:

- **Frontend:** React + TypeScript + Vite, React Router, Tailwind CSS, Axios
- **Backend:** Node.js + Express + TypeScript, layered as `controller → service → repository`
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT, passwords hashed with bcrypt
- **Docs:** Swagger/OpenAPI at `/api-docs`

```
/backend    Express + TypeScript API
/frontend   React + TypeScript SPA
docker-compose.yml   Postgres + backend + frontend, all in one command
```

## Seeded credentials

After seeding, three users exist (see [Seeding the database](#3-seed-the-database)), all sharing the password below:

| Role    | Email                    | Password       |
|---------|---------------------------|----------------|
| Admin   | admin@tasktracker.dev     | `Password123!` |
| Manager | manager@tasktracker.dev   | `Password123!` |
| Member  | member@tasktracker.dev    | `Password123!` |

You can also sign up new accounts from the UI — they're always created as **Member**; an Admin can promote them from the User Management page.

---

## Option A: Run everything with Docker Compose (fastest)

Requires Docker + Docker Compose.

```bash
docker compose up --build
```

This starts:
- Postgres on `localhost:5432`
- Backend API on `http://localhost:4000` (Swagger docs at `http://localhost:4000/api-docs`)
- Frontend on `http://localhost:5173`

The backend container automatically runs `prisma migrate deploy` on startup. After the containers are up, seed the database once:

```bash
docker compose exec backend npm run seed
```

Then open `http://localhost:5173` and log in with any of the seeded credentials above.

---

## Option B: Run locally without Docker

### 1. Start PostgreSQL

Use Docker for just the database, or point at any local Postgres instance:

```bash
docker run --name tasktracker-db -e POSTGRES_USER=tasktracker \
  -e POSTGRES_PASSWORD=tasktracker -e POSTGRES_DB=tasktracker \
  -p 5432:5432 -d postgres:16-alpine
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env      # adjust DATABASE_URL / JWT_SECRET if needed
npm install
npx prisma migrate dev --name init   # creates tables
npm run seed                          # creates Admin/Manager/Member users
npm run dev                           # starts API on http://localhost:4000
```

API docs: `http://localhost:4000/api-docs`
Health check: `http://localhost:4000/health`

### 3. Seeding the database

`npm run seed` (from `/backend`) upserts the three seeded users listed above. It's safe to re-run.

### 4. Frontend setup

```bash
cd frontend
cp .env.example .env       # VITE_API_URL defaults to http://localhost:4000/api
npm install
npm run dev                # starts the SPA on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Running backend tests

```bash
cd backend
npm test
```

Unit tests cover the RBAC rules in `tasks.service.ts` (e.g. a Member can only view/update tasks assigned to them and may only change `status`; Manager/Admin have full access).

> **Note on this environment:** the code was authored and syntax/type-checked in a network-restricted sandbox that could not reach `binaries.prisma.sh` to download Prisma's query engine, so `prisma generate` and the Jest suite could not be executed end-to-end here. In a normal environment with full network access, `npm install && npx prisma generate` resolves this automatically — it's a one-time download, not a code issue. The frontend was fully installed, type-checked, and built successfully in this sandbox.

---

## API overview

| Category | Endpoint                        | Method | Access                          |
|----------|----------------------------------|--------|----------------------------------|
| Auth     | `/api/auth/signup`               | POST   | Public                          |
| Auth     | `/api/auth/login`                | POST   | Public                          |
| Users    | `/api/users`                     | GET    | Admin                           |
| Users    | `/api/users/:id/role`            | PUT    | Admin                           |
| Tasks    | `/api/tasks`                     | POST   | Manager, Admin                  |
| Tasks    | `/api/tasks`                     | GET    | Member, Manager, Admin          |
| Tasks    | `/api/tasks/:id`                 | GET    | Member, Manager, Admin          |
| Tasks    | `/api/tasks/:id`                 | PUT    | Member (status only, own tasks), Manager, Admin |
| Tasks    | `/api/tasks/:id`                 | DELETE | Manager, Admin                  |
| Comments | `/api/tasks/:id/comments`        | POST   | Member, Manager, Admin          |
| Comments | `/api/tasks/:id/comments`        | GET    | Member, Manager, Admin          |

Full request/response schemas are documented in Swagger at `/api-docs` once the backend is running.

### Role rules, implemented in `tasks.service.ts` / `comments.service.ts`

- **Member**: sees and can comment only on tasks assigned to them; can update only the `status` field on their own tasks.
- **Manager**: can create tasks, assign them to any user, view/edit/comment on all tasks.
- **Admin**: everything a Manager can do, plus user management (list users, change roles).

## Database schema

Defined in `backend/prisma/schema.prisma`:

- `users` — id, name, email (unique), passwordHash, role (`ADMIN`/`MANAGER`/`MEMBER`), createdAt
- `tasks` — id, title, description, priority (`LOW`/`MEDIUM`/`HIGH`), status (`TODO`/`IN_PROGRESS`/`DONE`), dueDate, createdById, assignedToId, createdAt, updatedAt
- `comments` — id, message, taskId, createdById, createdAt

## Bonus features included

- Search tasks by title/description (`search` query param)
- Pagination for the task list (`page` / `pageSize`)
- Swagger/OpenAPI docs (`/api-docs`)
- Unit tests for RBAC logic (Jest)
- Docker Compose for one-command local setup
