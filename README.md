# 🧾 Tip Ledger System

A robust digital tip tracking system built with **NestJS + TypeScript** and **PostgreSQL**, implementing a ledger-based approach for recording and managing tips in the hospitality industry.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Idempotency & Concurrency](#idempotency--concurrency)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)

---

## Overview

The Tip Ledger System is designed to handle digital tip transactions for restaurants and hospitality businesses. It uses an **append-only ledger** approach where tips are tracked through immutable ledger entries, ensuring full auditability and preventing data loss.

### Key Principles

| Principle | Implementation |
|-----------|---------------|
| **Idempotency** | Unique `idempotencyKey` ensures duplicate requests return the same result |
| **Concurrency Safety** | Pessimistic locking prevents race conditions during state transitions |
| **Immutable Ledger** | Append-only ledger entries - no updates or deletes |
| **State Machine** | Tips follow: `PENDING → CONFIRMED → REVERSED` |

---

## Features

- ✅ **Create Tip Intent** - Idempotent tip creation with unique key
- ✅ **Confirm Tip** - Thread-safe confirmation with ledger entry (CREDIT)
- ✅ **Reverse Tip** - Safe reversal with offsetting ledger entry (DEBIT)
- ✅ **Merchant Dashboard** - Tip summary grouped by status
- ✅ **Employee Ledger** - Full transaction history with running balance

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | NestJS 11 |
| **Language** | TypeScript 5.9 |
| **Database** | PostgreSQL 15 |
| **ORM** | TypeORM 0.3 |
| **Validation** | class-validator, class-transformer |
| **API Docs** | Swagger/OpenAPI |
| **Testing** | Jest, Supertest |
| **Logging** | Pino (nestjs-pino) |

---

## Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
│
├── common/                          # Shared modules & utilities
│   ├── config/                      # Environment configuration
│   ├── database/                    # Database setup
│   │   └── type-orm/
│   │       ├── entities/            # TypeORM entities
│   │       │   ├── merchant.entity.ts
│   │       │   ├── employee.entity.ts
│   │       │   ├── table-qr.entity.ts
│   │       │   ├── tip-intent.entity.ts
│   │       │   ├── ledger-entry.entity.ts
│   │       │   └── processed-event.entity.ts
│   │       ├── repositories/        # Custom repositories
│   │       └── data-source.ts       # TypeORM data source
│   ├── decorators/                  # Custom decorators
│   ├── dto/                         # Shared DTOs
│   ├── filters/                     # Exception filters
│   ├── guard/                       # Auth guards
│   ├── health/                      # Health check endpoint
│   ├── interceptors/                # Response interceptors
│   ├── logger/                      # Pino logger setup
│   ├── mailer/                      # Email service
│   └── swagger/                     # Swagger configuration
│
├── modules/                         # Feature modules
│   ├── tips/                        # Tips API
│   │   ├── tips.module.ts
│   │   ├── tips.controller.ts
│   │   ├── tips.service.ts
│   │   └── dto/
│   │       ├── create-tip-intent.dto.ts
│   │       └── tip-intent-response.dto.ts
│   │
│   ├── merchants/                   # Merchant API
│   │   ├── merchants.module.ts
│   │   ├── merchants.controller.ts
│   │   ├── merchants.service.ts
│   │   └── dto/
│   │
│   └── employees/                   # Employee API
│       ├── employees.module.ts
│       ├── employees.controller.ts
│       ├── employees.service.ts
│       └── dto/
│
├── migrations/                      # Database migrations
│
test/
├── tips-required.e2e-spec.ts        # Required E2E tests
└── jest-e2e.json                    # Jest E2E config
```

---

## Data Model

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Merchant   │───┬──▶│  Employee   │───┬──▶│ LedgerEntry │
└─────────────┘   │   └─────────────┘   │   └─────────────┘
       │          │          │          │          ▲
       │          │          │          │          │
       ▼          │          ▼          │          │
┌─────────────┐   │   ┌─────────────┐   │          │
│   TableQR   │───┘   │  TipIntent  │───┴──────────┘
└─────────────┘       └─────────────┘
```

### Entities

| Entity | Description |
|--------|-------------|
| **Merchant** | Restaurant/business that receives tips |
| **Employee** | Staff member who receives tips |
| **TableQR** | QR code linked to a table at a merchant |
| **TipIntent** | A tip transaction with state (PENDING/CONFIRMED/REVERSED) |
| **LedgerEntry** | Immutable record of tip credit/debit |
| **ProcessedEvent** | Tracks processed RabbitMQ events (for idempotency) |

### TipIntent State Machine

```
           ┌───────────┐
           │  PENDING  │
           └─────┬─────┘
                 │
                 │ confirm()
                 ▼
           ┌───────────┐
           │ CONFIRMED │
           └─────┬─────┘
                 │
                 │ reverse()
                 ▼
           ┌───────────┐
           │  REVERSED │
           └───────────┘
```

### Ledger Entry Types

| Type | When Created | Amount |
|------|--------------|--------|
| `CREDIT` | On tip confirmation | Positive |
| `DEBIT` | On tip reversal | Negative |

---

## API Reference

### Base URL
```
http://localhost:3000
```

### Tips API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tips/intents` | Create a new tip intent (idempotent) |
| `POST` | `/tips/intents/:id/confirm` | Confirm a pending tip (idempotent) |
| `POST` | `/tips/intents/:id/reverse` | Reverse a confirmed tip (idempotent) |
| `GET` | `/tips/intents/:id` | Get tip intent by ID |

#### Create Tip Intent

```bash
POST /tips/intents
Content-Type: application/json

{
  "merchantId": "uuid",
  "employeeId": "uuid",
  "tableCode": "T1",
  "amount": 5.250,
  "idempotencyKey": "unique-key-123"
}
```

**Response:**
```json
{
  "id": "uuid",
  "merchantId": "uuid",
  "employeeId": "uuid",
  "tableQRId": "uuid",
  "amount": 5.250,
  "status": "PENDING",
  "idempotencyKey": "unique-key-123",
  "tableCode": "T1",
  "createdAt": "2025-12-27T10:00:00Z"
}
```

### Merchants API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/merchants/:id/tips/summary` | Get tip summary grouped by status |

**Response:**
```json
{
  "merchantId": "uuid",
  "pending": { "count": 5, "totalAmount": 25.500 },
  "confirmed": { "count": 10, "totalAmount": 50.000 },
  "reversed": { "count": 2, "totalAmount": 10.000 },
  "netTotal": 40.000
}
```

### Employees API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/employees/:id/tips` | Get ledger entries and total for employee |

**Response:**
```json
{
  "employeeId": "uuid",
  "entries": [
    {
      "id": "uuid",
      "amount": 5.250,
      "type": "CREDIT",
      "notes": "Tip confirmed from T1",
      "createdAt": "2025-12-27T10:00:00Z"
    }
  ],
  "totalAmount": 45.500
}
```

---

## Idempotency & Concurrency

### Idempotency Strategy

The system ensures idempotency through multiple mechanisms:

1. **Unique `idempotencyKey`** on TipIntent
   - Same key → return existing record
   - Database constraint prevents duplicates

2. **State-based Idempotency**
   - `confirmTipIntent()`: If already CONFIRMED, return success
   - `reverseTipIntent()`: If already REVERSED, return success

```typescript
// Example: Idempotent confirmation
async confirmTipIntent(id: string) {
  // If already confirmed, return success (idempotent)
  if (tipIntent.status === TipIntentStatus.CONFIRMED) {
    return this.mapToResponse(tipIntent);
  }
  // ... proceed with confirmation
}
```

### Concurrency Safety

Pessimistic locking ensures only one transaction can modify a tip at a time:

```typescript
// Acquire exclusive lock on the row
const tipIntent = await manager.findOne(TipIntent, {
  where: { id },
  lock: { mode: 'pessimistic_write' }, // SELECT FOR UPDATE
});
```

This prevents:
- Double confirmation
- Race conditions during state transitions
- Duplicate ledger entries

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ex-tip-ledger

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

### Environment Variables

```env
APP_ENV=dev
APP_NAME=tip-ledger-service
NODE_ENV=dev
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=tips_db
```

### Database Setup

```bash
# Run migrations
pnpm migration:run
```

### Running the Application

```bash
# Development mode (with hot reload)
pnpm start:dev

# Production mode
pnpm build
pnpm start:prod
```

### API Documentation

Swagger UI available at: `http://localhost:3000/docs`

---

## Testing

### Required Tests

The system includes 3 required E2E test suites covering:

| Test Suite | Description | Tests |
|------------|-------------|-------|
| **Idempotent Tip Creation** | Same idempotencyKey returns same result | 3 tests |
| **Concurrent Confirmation** | Exactly 1 ledger entry with parallel requests | 3 tests |
| **Reversal Behavior** | DEBIT entry, state transitions, net-zero balance | 5 tests |

### Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e tips-required.e2e-spec.ts

# Run with coverage
pnpm test:cov
```

### Test Results

```
Tips E2E Tests - Required Test Cases
  1. Idempotent Tip Intent Creation
    ✓ should return the same tip intent when called with the same idempotencyKey
    ✓ should create only ONE record in the database for duplicate requests
    ✓ should create different tips for different idempotencyKeys
  2. Concurrent Confirmation Safety
    ✓ should create exactly ONE ledger entry when confirmed concurrently
    ✓ should return the same confirmed status for all concurrent requests
    ✓ should handle confirmation idempotency
  3. Reversal Behavior
    ✓ should reverse a confirmed tip and create a DEBIT ledger entry
    ✓ should be idempotent - calling reverse multiple times returns same result
    ✓ should NOT allow reversing a PENDING tip
    ✓ should result in net zero when tip is reversed (ledger balance)
    ✓ should NOT allow confirming a REVERSED tip

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

---

## Design Decisions & Trade-offs

### 1. Append-Only Ledger

**Decision:** Use immutable ledger entries instead of updating tip amounts.

**Trade-off:**
- ✅ Full audit trail
- ✅ No data loss on reversals
- ✅ Easy to calculate historical balances
- ❌ More storage required
- ❌ Requires summing entries for totals

### 2. Pessimistic Locking

**Decision:** Use `SELECT FOR UPDATE` for state transitions.

**Trade-off:**
- ✅ Guarantees consistency
- ✅ Prevents race conditions
- ❌ May reduce throughput under high load
- ❌ Risk of deadlocks (mitigated by short transactions)

**Alternative:** Optimistic locking with version column and retry logic.

### 3. Idempotency Key at Application Level

**Decision:** Use unique `idempotencyKey` field with database constraint.

**Trade-off:**
- ✅ Simple to implement
- ✅ Works across multiple instances
- ❌ Client must generate unique keys
- ❌ Keys stored indefinitely

**Alternative:** Time-based idempotency with TTL cache (Redis).

### 4. Decimal(10,3) for Amount

**Decision:** Use 3 decimal places for Kuwaiti Dinar (KWD) support.

**Trade-off:**
- ✅ Accurate currency representation
- ✅ No floating-point errors
- ❌ Requires explicit rounding in application code

### 5. State Machine with Enum

**Decision:** Use TypeORM enum for tip status.

**Trade-off:**
- ✅ Type safety
- ✅ Database-level validation
- ❌ Schema change required to add new states

---

## Future Enhancements

- [ ] Authentication & authorization
- [ ] Rate limiting
- [ ] Bulk tip operations
- [ ] Export functionality (CSV/PDF)

---

## License

UNLICENSED - Private project

---
