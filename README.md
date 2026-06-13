# EboyApp — Autism Support Platform

A production-ready, cross-platform autism support application for families, caregivers, and therapists. Built with React Native Expo (frontend) and FastAPI + PostgreSQL (backend).

## Why This App Matters

Children and young adults with autism and speech delay need consistent, structured, and calm digital tools. EboyApp provides:

- **AAC Communication** — tap-to-speak boards with audio playback
- **Visual Schedules** — picture-based daily routines to reduce anxiety
- **Task Training** — step-by-step life skills with OT support
- **Behavior/Emotion Tracking** — log, visualize, and understand patterns
- **Token Rewards** — positive reinforcement built into every interaction
- **Progress Tracking** — goal dashboards for caregivers and therapists
- **Admin Oversight** — full user management and audit trails
- **AI Caregiver Support** — safe, disclaimed guidance placeholder (not therapy)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native, Expo SDK 51, TypeScript |
| State Management | Zustand + TanStack Query (React Query) |
| Navigation | React Navigation v6 |
| Animations | React Native Reanimated v3 |
| Backend API | Python FastAPI |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2.0 + Alembic |
| Auth | JWT (access + refresh tokens) |
| Caching | Redis |
| Containerization | Docker + docker-compose |

---

## Project Structure

```
EBOY-APP/
├── frontend/          # React Native Expo app
├── backend/           # FastAPI application
├── docker-compose.yml # Full stack local setup
└── README.md
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone and configure

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

### 2. Start backend services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- FastAPI on port 8000

### 3. Run database migrations

```bash
docker-compose exec api alembic upgrade head
docker-compose exec api python -m app.db.seed
```

### 4. Start the Expo app

```bash
cd frontend
npm install
npx expo start
```

---

## Demo Accounts

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eboyapp.com | Admin123! |
| Parent | parent@example.com | Parent123! |
| Therapist | therapist@example.com | Therapist123! |

---

## Sample Child Profiles

The seed data includes two sample child profiles:
- **Liam Chen** (age 7) — ASD Level 2, limited verbal, visual schedule user
- **Aisha Okafor** (age 11) — ASD Level 1, emerging communication, AAC user

---

## Environment Variables

See `backend/.env.example` for all required variables.

---

## API Documentation

When running locally, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Safety & Privacy

EboyApp is designed with HIPAA-style privacy principles:
- Sensitive fields are encrypted at rest
- Role-based access limits data exposure
- Audit logs track all key actions
- No dark patterns or invasive data collection
- Ethical, evidence-informed tone throughout

> **AI Disclaimer:** The AI assistant module provides educational support and caregiver guidance only. It is not a replacement for licensed medical or therapeutic care.

---

## License

MIT — Open for educational and non-commercial use.
