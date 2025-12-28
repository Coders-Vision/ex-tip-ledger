# Tip Ledger

A full-stack digital tip tracking system for merchants and employees. Built with NestJS (backend) and Next.js (frontend).

## Overview

Tip Ledger provides a complete solution for managing tips in hospitality businesses:

- **Merchants** can track tip totals by status (pending, confirmed, reversed)
- **Employees** can view their complete ledger with all transactions
- **QR Code Integration** for table-based tipping
- **Real-time Processing** via RabbitMQ message queue

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | NestJS 11, TypeORM, PostgreSQL 15 |
| **Messaging** | RabbitMQ |
| **Auth** | JWT (Access + Refresh tokens) |
| **Containerization** | Docker, Docker Compose |

## Project Structure

```
ex-tip-ledger/
├── frontend/                 # Next.js dashboard
│   ├── app/                  # App router pages
│   │   ├── actions/          # Server actions (API calls)
│   │   ├── dashboard/        # Merchant & Employee dashboards
│   │   └── login/            # Authentication
│   ├── components/           # UI components (shadcn/ui)
│   └── lib/                  # Utilities, types, auth context
│
├── backend/                  # NestJS API
│   └── src/
│       ├── modules/          # Feature modules
│       │   ├── auth/         # Authentication
│       │   ├── users/        # User management
│       │   ├── merchants/    # Merchant operations
│       │   ├── employees/    # Employee operations
│       │   ├── tips/         # Tip processing
│       │   ├── ledger/       # Transaction ledger
│       │   └── table-qrs/    # QR code management
│       └── common/           # Shared utilities
│
└── docker-compose.yml        # Full stack deployment
```


## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Coders-Vision/ex-tip-ledger.git
cd ex-tip-ledger

# Start all services
docker compose up --build 
```

Services will be available at:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/docs
- **RabbitMQ UI**: http://localhost:15672 (guest/guest)

### Option 2: Local Development

```bash
# Install dependencies
cd backend && pnpm install
cd ../frontend && pnpm install

# Start PostgreSQL and RabbitMQ (via Docker)
docker compose up postgres rabbitmq -d

# Run backend
cd backend
pnpm start:dev

# Run frontend (new terminal)
cd frontend
pnpm dev
```

## Environment Variables

### Backend (`backend/.env`)

```env
# App
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=tips_db

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Test Credentials

After seeding the database:

```
Merchant: <Any Email for Merchant (Take from Swagger)>
Employee: <Any Email for Employee based on Merchant (Take from Swagger)>
Password: Password123!
```

## Features

### Merchant Dashboard
- View tip totals by status (Pending, Confirmed, Reversed)
- Net total calculation (Confirmed - Reversed)
- Summary statistics with visual breakdown

### Employee Dashboard
- Complete transaction ledger
- Credit/Debit breakdown
- Running balance calculation

### API Features
- RESTful endpoints with Swagger documentation
- JWT authentication with refresh tokens
- Event-driven tip processing via RabbitMQ
- Idempotent tip creation with deduplication
- Database seeding for development

## API Documentation

Swagger UI: http://localhost:3000/docs

Key endpoints:
- `POST /auth/login` - User authentication
- `GET /merchants/:id/tips/summary` - Merchant tip summary
- `GET /employees/:id/tips` - Employee ledger
- `POST /tips/intents` - Create tip intent

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | 3001 | Next.js dashboard |
| `tip-ledger-api` | 3000 | NestJS API |
| `postgres` | 5433 | PostgreSQL database |
| `rabbitmq` | 5672, 15672 | Message broker + Management UI |

## Scripts

### Backend
```bash
pnpm start:dev      # Development with hot reload
pnpm build          # Build for production
pnpm start:prod     # Run production build
pnpm test           # Run tests
pnpm seed           # Seed database
```

### Frontend
```bash
pnpm dev            # Development server
pnpm build          # Build for production
pnpm start          # Run production build
pnpm lint           # Run ESLint
```

## Assessment Guide

To review and test the full system end-to-end:

1. **Start the stack** (see Quick Start above).
2. **Access API documentation** at [http://localhost:3000/docs](http://localhost:3000/docs) (Swagger UI).
3. **Seeded data**: The system auto-seeds essential data (merchants, employees, etc.) on first run.
4. **Get IDs for testing:**
   - Use the `/users`, `/merchants`, or `/employees` endpoints in Swagger to list available users and get their IDs.
5. **Create a tip intent:**
   - Use the `/tips/intents` POST endpoint in Swagger.
   - Provide a valid `merchantId`, `employeeId`, `tableCode`, `amount`, and a unique `idempotencyKey`.
6. **Complete the tip flow:**
   - The backend will process the tip intent (RabbitMQ, DB update, etc.).
   - You can verify the ledger and tip status via the `/employees/{id}/tips` and `/merchants/{id}/tips/summary` endpoints.
7. **UI Verification:**
   - Login as a merchant or employee using the test credentials in this README.
   - View dashboards to confirm the tip/ledger updates.

> **For detailed documentation**, see the README files in each app:
> - [Backend README](./backend/README.md) - API endpoints, database schema, RabbitMQ setup, testing
> - [Frontend README](./frontend/README.md) - Components, server actions, authentication flow


## License

UNLICENSED - Private project
