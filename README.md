# ShelterOS

<div align="center">

<img src="apps/admin/public/logo.png" alt="ShelterOS Logo" width="160" style="border-radius: 16px;" />

<br />
<br />

<img src="apps/admin/public/Admin%20Dashboard.png" alt="ShelterOS Admin Dashboard" width="900" style="border-radius: 16px;" />

<br />

*AI-equipped operating system for animal rescue organizations*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

</div>


ShelterOS helps shelters manage the complete lifecycle of an animal — from rescue to forever home — in one clean, modern platform.

Rescue → Intake → Medical Care → Foster → Adoption

---

## Overview

Animal shelters often run on spreadsheets, chats, and paper notes. Important details get lost, foster matching is manual, and staff spend too much time coordinating instead of caring for animals.

**ShelterOS** brings everything into one system:

- Staff get a full admin workspace for animals, medical records, fosters, adoptions, and analytics
- The public can browse animals and apply to foster or adopt
- AI helps match foster volunteers to the right animals with clear scores and reasons

Built with a focus on:

- Supporting animal shelters, rescues, and foster programs
- Improving animal adoption and matching
- Improving animal welfare and quality of life

---

## Core Features

### 1. Animal Intake & Profiles
- Create and manage animal records
- Track species, breed, age, gender, weight, personality, and description
- Upload photos and videos
- Assign unique animal IDs (e.g. `DOG-90128`)
- Manage status across the full pipeline:
  - `rescued`
  - `intake`
  - `medical`
  - `foster`
  - `adoption_ready`
  - `adopted`

### 2. Animal Timeline
- Visual journey history for every animal
- Events like rescued, intake, vaccinated, medical checkup, fostered, and adopted
- Metadata support for location, people involved, reference codes, and notes
- Demo-friendly and useful for staff decisions

### 3. Medical Records
- Vaccination history
- Medications with dosage and frequency
- Conditions tracking
- Next checkup reminders
- Notes for veterinary observations
- Overdue checkup visibility on the dashboard

### 4. Foster Management
- Public foster applications
- Admin review of foster requests
- Status flow: `applied` → approved/active → completed/terminated
- Foster profile data:
  - experience level
  - availability
  - preferred species
  - housing type
  - kids / other pets
  - activity preference
  - special-needs experience
- AI match score stored with each request

### 5. Adoption Marketplace
- Public listing of adoption-ready animals
- Animal profile sheets with personality, health summary, and simplified timeline
- Adoption application flow
- Admin-side application tracking

### 6. AI Foster Matching
Powered by **Google Gemini**

When a foster applies, ShelterOS:
1. Reads the foster profile
2. Reads the animal profile + latest medical conditions
3. Generates a compatibility score from **0–100**
4. Returns:
   - match score
   - recommendation (`strong` / `moderate` / `weak` / `not_recommended`)
   - summary
   - strengths
   - concerns
   - suggested questions for staff

There is also **batch recommendation scoring** so logged-in fosters can see personalized “Recommended for You” animals without scoring one-by-one.

### 7. Analytics Dashboard
Admin dashboard includes:

**Metric cards**
- Animals in Shelter
- Ready for Adoption
- Pending Foster Requests
- Adoptions This Month
- Overdue Checkups

**Charts**
- Animals by status
- Activity over time

**Operational panels**
- Recent activity feed
- Needs attention:
  - overdue medical checkups
  - stale foster applications
  - animals stuck in medical too long

**Quick stats**
- Active fosters
- Registered adopters
- Average days from intake to adoption

### 8. User Roles
- `admin`
- `shelter_staff`
- `foster_volunteer`
- `adopter`

Role-based access controls what each user can view and do.

---

## User Flows

### Shelter Staff
1. Add a rescued animal
2. Log intake + medical records
3. Update timeline events
4. Review foster / adoption applications
5. Use AI match scores to approve the best foster
6. Track shelter health from the dashboard

### Foster Volunteer
1. Sign up with foster questionnaire
2. Browse available animals
3. See AI-recommended matches
4. Apply to foster
5. Wait for shelter review and contact

### Adopter
1. Sign up as adopter
2. Browse adoption-ready animals
3. Open animal profile
4. Submit adoption application

---

## Tech Stack

### Frontend
- React Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts (dashboard charts)
- React Hook Form + Zod

### Backend
- Fastify
- JWT authentication
- Role-based middleware
- Drizzle ORM

### Database
- PostgreSQL (Neon)

### Media
- Cloudinary (image/video upload + delete by `public_id`)

### AI
- Google Gemini
  - single foster-animal scoring
  - batch recommendation scoring

---

## Project Structure (High Level)

```text
apps/
  admin/               # Admin Portal
  web/                 # Web
  backend/             # Fastify backend
packages/
  db/                  # Drizzle schema + types
  auth/                # JWT helpers
```

---

## AI Matching Details

Foster experience is stored as a packed profile string, for example:

```text
[experience:previous_foster][duration:1 month][species:both][housing:house_fenced][fencedYard:yes][activityLevel:medium][hasKids:no][hasOtherPets:dogs][specialNeeds:yes][maxAnimals:2]
```

The AI uses:
- foster experience tags
- availability
- location
- animal species/breed/age/personality
- latest medical conditions

Output example:

```json
{
  "matchScore": 87,
  "recommendation": "strong",
  "summary": "Strong fit based on dog preference and intermediate experience.",
  "strengths": ["Has prior foster experience", "Fenced yard available"],
  "concerns": ["May need support with high-energy training"],
  "suggestedQuestions": ["Can you commit for at least 4 weeks?"]
}
```

---

## Why ShelterOS matters

### For shelters
- Less operational chaos
- Clear animal status tracking
- Faster foster decisions
- Better visibility into bottlenecks

### For fosters & adopters
- Simple application flow
- Personalized recommendations
- Transparent animal profiles and journey history

### For animals
- Better temporary care matches
- Smoother path to adoption
- Higher chance of the right home, not just any home

---

---

## Future Improvements

Possible next steps:
- Post-adoption follow-up tracking
- Lost-and-found / microchip integration
- SMS/email notification system
- Advanced adoption matching
- Multi-shelter support
- Mobile app for field intake

---

## Team Note

ShelterOS was built with a product mindset: fewer scattered tools, clearer workflows, and AI that supports human judgment instead of replacing it.

If shelters can move faster and match better, more animals get home.

## Local Setup

### 1. Prerequisites
- Node.js 24
- pnpm
- Docker & Docker Compose
- PostgreSQL (local or Neon)

### 2. Clone and install

```bash
git clone https://github.com/talha5978/shelter-os.git
cd shelter-os
pnpm install
```

### 3. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Typical variables:

```env
# Environment
NODE_ENV=development
VITE_ENV=development

# Backend Port
BACKEND_PORT=3000

# Apps and Backend URLs
ADMIN_URL=http://localhost:5173
WEB_URL=http://localhost:5174
API_BASE_URL=http://localhost:3000

# Database Connection
PG_CONNECTION_STRING=postgresql://xxxxxxxxxxxxxxxxxx

# JWT
JWT_SECRET=MAfqVePSUzVISF4ugE8BlKB14XXXXXXXXXXXXXX
JWT_EXPIRES_IN=1h

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=xxxxxxxxxxxxxxxxxxxxxx
CLOUDINARY_API_KEY=xxxxxxxxxxxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxx
```

### 4. Database setup

From the monorepo root all migration files are given. Copy the commands and run in the postgres db editor or use:

```bash
pnpm db:push
```

If you have change the database schema then run from the root:

```bash
pnpm db:generate
pnpm db:push
```

### 5. Run locally with pnpm

Run these commands from the root:

```bash
# Backend API
pnpm backend:dev

# Public website
pnpm web:dev

# Admin portal
pnpm admin:dev
```

Default local ports (adjust if needed):
- Web: `http://localhost:5174`
- Admin: `http://localhost:5173`
- Backend: `http://localhost:3000`

---

## Docker Setup

ShelterOS is a **pnpm + Turborepo monorepo**. All Docker images must be built from the **repository root** so shared packages and root config files are available.

---

### Prerequisites
- Docker
- Docker Compose
- A filled `.env` file in the project root

```bash
cp .env.example .env
```

---

### 1. Build images

#### Admin portal
```bash
docker build -f apps/admin/Dockerfile -t shelter-os-admin .
```

#### Public website
```bash
docker build -f apps/web/Dockerfile -t shelter-os-web .
```

#### Backend API
```bash
docker build -f apps/backend/Dockerfile -t shelter-os-backend .
```

---

### 2. Run containers

#### Admin
```bash
docker rm -f shelter-os-admin 2>/dev/null || true

docker run --rm \
  --env-file .env \
  -p 3001:3001 \
  --name shelter-os-admin \
  shelter-os-admin
```

Open: [http://localhost:3001](http://localhost:3001)

#### Web
```bash
docker rm -f shelter-os-web 2>/dev/null || true

docker run --rm \
  --env-file .env \
  -p 3000:3000 \
  --name shelter-os-web \
  shelter-os-web
```

Open: [http://localhost:3000](http://localhost:3000)

#### Backend
```bash
docker rm -f shelter-os-backend 2>/dev/null || true

docker run --rm \
  --env-file .env \
  -p 4000:4000 \
  --name shelter-os-backend \
  shelter-os-backend
```

Open: [http://localhost:4000](http://localhost:4000)

---

### 3. Docker Compose (recommended)

Make sure `docker-compose.yml` exists in the repo root:

Start everything:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

---

### 4. Dockerfile requirements (important)

Each app Dockerfile should copy these **root files**:

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.json`

And these workspace packages:

- `packages/db`
- `packages/auth`

Example admin build command used in Docker:

```bash
pnpm admin:build
```

Example admin start command:

```bash
pnpm admin:start
```

---

### 5. Local ports

| Service | URL |
|---------|-----|
| Public Web | http://localhost:3000 |
| Admin Portal | http://localhost:3001 |
| Backend API | http://localhost:4000 |

---

### 6. Notes

- Always build from the monorepo root, not from `apps/admin` or `apps/web`
- Make sure `.env` contains all the valid values
- If Turbo fails inside Docker, confirm `turbo.json` is copied
- If TypeScript fails inside Docker, confirm root `tsconfig.json` is copied