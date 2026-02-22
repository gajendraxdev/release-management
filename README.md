# ReleaseCheck

**A Release Checklist Tool** — A full-stack web application that helps development teams track and complete tasks when releasing new versions of their software. Never miss a step again.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Checklist Steps](#checklist-steps)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Database](#database)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

ReleaseCheck is a single-page application (SPA) that allows teams to create release plans, track completion of standard checklist steps, and manage release metadata. Each release has a name, date, optional notes, and seven fixed steps that must be completed before shipping.

The app automatically computes release status as **planned**, **ongoing**, or **done** based on how many steps are completed.

---

## Features

| Feature | Description |
|---------|-------------|
| **View Releases** | See all releases in a table (desktop) or card layout (mobile) |
| **Create Release** | Add new releases with name, date, and optional additional info |
| **Checklist** | Check or uncheck each of the 7 fixed steps per release |
| **Edit Release** | Update name, date, or additional information anytime |
| **Delete Release** | Remove releases you no longer need |
| **Status** | Auto-computed status: planned → ongoing → done |
| **Toast Notifications** | Success and error feedback via toast messages |
| **Responsive UI** | Works on desktop, tablet, and mobile |
| **Date Validation** | Prevents selecting past dates for release date |

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, Axios, React Hot Toast |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL with Prisma 7.x ORM (Prisma Accelerate supported) |
| **Testing** | Vitest, Supertest |

---

## Checklist Steps

The following steps are fixed for every release:

1. All PRs merged  
2. CHANGELOG updated  
3. Tests passing  
4. Release created in GitHub  
5. Deployed to staging  
6. Tested in staging  
7. Deployed to production  

---

## Quick Start

### Prerequisites

- **Node.js** 18+  
- **PostgreSQL** 12+ (or use [Prisma Accelerate](https://www.prisma.io/accelerate) / [Docker](#using-docker-compose))  
- **npm**

### Install and run locally

```bash
# Clone the repository
git clone <repository-url>
cd release-checklist

# Install all dependencies
npm run install:all

# Backend: create .env from .env.example, set DATABASE_URL, then:
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run dev

# Frontend: in a new terminal
cd frontend
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)  
- **Backend API:** [http://localhost:3001](http://localhost:3001)  
- **Health check:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

### Using Docker Compose

```bash
# Start PostgreSQL + backend
docker-compose up -d

# Frontend
cd frontend && npm install && npm run dev
```

---

## Project Structure

```
release-checklist/
├── backend/
│   ├── constants/          # App constants (e.g. default steps)
│   ├── controllers/        # HTTP request handlers
│   ├── db/                 # Prisma Client setup
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Migrations
│   ├── repositories/       # Database access layer
│   ├── routes/             # Express routes
│   ├── utils/              # Helpers (status, mappers)
│   ├── test/               # Unit + integration tests
│   ├── server.js           # Express entry point
│   ├── vercel.json         # Vercel deployment config
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # ReleaseList, ReleaseDetail
│   │   ├── api.js          # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
├── docker-compose.yaml
├── DEPLOYMENT.md           # Vercel deployment guide
└── README.md
```

---

## API Reference

**Base URL:** `http://localhost:3001/api` (replace with your API URL in production)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/releases` | List all releases |
| `POST` | `/releases` | Create a release |
| `GET` | `/releases/:id` | Get one release |
| `PATCH` | `/releases/:id` | Update a release |
| `PATCH` | `/releases/:id/toggle-step` | Toggle a checklist step |
| `DELETE` | `/releases/:id` | Delete a release |

**Example — create release:**

```bash
curl -X POST http://localhost:3001/api/releases \
  -H "Content-Type: application/json" \
  -d '{"name":"v1.0.0","date":"2024-01-15T00:00:00.000Z","additional_info":"Initial release"}'
```

**Example — toggle step:**

```bash
curl -X PATCH http://localhost:3001/api/releases/{id}/toggle-step \
  -H "Content-Type: application/json" \
  -d '{"stepIndex":0}'
```

---

## Database

Schema is managed with Prisma. Key model:

```prisma
model Release {
  id              String   @id @default(uuid())
  name            String
  date            DateTime
  additionalInfo  String?  @map("additional_info")
  stepsCompleted  Json     @default("[]") @map("steps_completed")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
}
```

**Status rules:**

- **planned** — no steps completed  
- **ongoing** — some steps completed  
- **done** — all steps completed  

**Useful Prisma commands:**

```bash
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Create/apply migrations
npx prisma studio        # Open DB GUI
```

---

## Testing

```bash
cd backend
npm test           # Run all tests
npm run test:watch # Watch mode
npm run test:coverage
```

| Test type | Location | Description |
|-----------|----------|-------------|
| Unit | `test/utils/` | Status, release mapper |
| Repository | `test/repositories/` | DB operations (mocked Prisma) |
| Controller | `test/controllers/` | HTTP handlers (mocked repo) |
| Integration | `test/integration/` | Full API (real DB) |

---

## Deployment

Deploy both frontend and backend to **Vercel** using two projects:

1. **Backend** — Root: `backend`; set `DATABASE_URL`, `CORS_ORIGIN`  
2. **Frontend** — Root: `frontend`; set `VITE_API_URL` to your API URL  

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step instructions.

---

## License

MIT
