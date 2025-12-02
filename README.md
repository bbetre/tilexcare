# TilexCare

TilexCare is a telehealth platform that connects Ethiopian patients with verified healthcare specialists through secure video consultations, appointment scheduling, and integrated payments.

This repository contains the implementation of the TilexCare MVP based on `tilexcare_PRD.md`, focusing on **Phase 1 – Core Infrastructure** and **Phase 2 – Appointment System**.

## Architecture

- **Frontend**: Next.js 14 (App Router) + TypeScript in `web/`
- **Backend**: Node.js + Express + TypeScript + Prisma in `api/`
- **Database**: PostgreSQL
- **Containerisation**: Docker + docker-compose

## MVP Scope (from PRD)

### Phase 1 – Core Infrastructure

- Authentication (email/password)
- Patient onboarding
- Doctor onboarding & verification
- Admin panel foundations

### Phase 2 – Appointment System

- Scheduling workflows
- On-demand workflows (matching available doctor) – *to be refined*
- Payments via Chapa & Stripe – *stubbed integration in MVP*
- Automatic payouts – *stubbed in MVP*

## Implemented Features (current status)

### Backend (api)

- **Authentication & Roles**
  - Email/password auth with JWT.
  - User roles: `PATIENT`, `DOCTOR`, `ADMIN`.
  - Automatic bootstrap of an initial admin user from environment variables.

- **Patient Onboarding**
  - `POST /auth/register/patient` to create a patient user and profile (basic info + optional medical history).

- **Doctor Onboarding & Verification**
  - `POST /auth/register/doctor` to create a doctor user and profile (specialties, bio, fee, etc.).
  - Doctors start with `PENDING` verification status.
  - Admin APIs to list and approve/reject doctors:
    - `GET /admin/doctors/pending`
    - `GET /admin/doctors` (filterable by status)
    - `POST /admin/doctors/:id/approve`
    - `POST /admin/doctors/:id/reject`

- **Appointment Booking (Scheduled, with Payment Stub)**
  - `POST /appointments` for patients to book scheduled appointments with a specific doctor.
  - Basic validation that the doctor exists and is approved.
  - Creation of an associated `Payment` record with **stubbed success** (no real gateway call).
  - Appointment marked as `CONFIRMED` for now to simulate successful payment.
  - `GET /appointments/me/patient` and `GET /appointments/me/doctor` to list appointments for the current user.

- **Health Check**
  - `GET /health` for liveness checks.

### Not Yet Implemented (planned per PRD)

- Zoom Video SDK integration.
- In-call chat, consultation notes, and prescription generation.
- On-demand doctor matching logic.
- Real payment gateway integrations for Chapa and Stripe.
- Automated payouts to providers.
- Advanced logging, analytics, and GDPR workflows.

## Local Development

### Prerequisites

- Node.js 18+ (recommended 20+)
- Docker + Docker Compose

### Environment Variables

Backend (`api` service) uses the following environment variables:

- `DATABASE_URL` – PostgreSQL connection string (set in `docker-compose.yml`).
- `JWT_SECRET` – secret for signing JWTs.
- `ADMIN_EMAIL` – email for initial admin user.
- `ADMIN_PASSWORD` – password for initial admin user.
- `PORT` – API port (defaults to `4000`).

Frontend (`web` service):

- `NEXT_PUBLIC_API_BASE_URL` – base URL for the backend API (defaults to `http://localhost:4000` in Docker setup).

### Running with Docker

From the repository root:

```bash
docker-compose up --build
```

This will start:

- `postgres` on port `5432`.
- `api` (Express + Prisma) on port `4000`.
- `web` (Next.js) on port `3000`.

#### Database migrations

From inside the `api` directory (in another terminal on your host machine):

```bash
cd api
npm install
npx prisma migrate dev
npx prisma generate
```

After migrations have been applied, restart the `api` container if needed.

### Running without Docker (local-only)

Backend:

```bash
cd api
npm install
# set DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD in a .env file
npx prisma migrate dev
npm run dev
```

Frontend:

```bash
cd web
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## API Overview (Phase 1–2)

### Auth

- `POST /auth/register/patient`
- `POST /auth/register/doctor`
- `POST /auth/login`

### Admin

All admin routes require an authenticated user with role `ADMIN`.

- `GET /admin/doctors/pending`
- `GET /admin/doctors` (optional `status` query param)
- `POST /admin/doctors/:id/approve`
- `POST /admin/doctors/:id/reject`

### Appointments

All appointment routes require authentication.

- `POST /appointments` – patient books appointment (scheduled, with stubbed payment success).
- `GET /appointments/me/patient` – list appointments for current patient.
- `GET /appointments/me/doctor` – list appointments for current doctor.

### Health

- `GET /health` – simple health check endpoint.

---

This README will be updated as additional TilexCare features from the PRD are implemented (video consultations, chat, prescriptions, payouts, and compliance tooling).
