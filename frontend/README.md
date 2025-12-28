# Tip Ledger Frontend

A Next.js dashboard for the Tip Ledger system - digital tip tracking for merchants and employees.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **Server Actions** - API calls (CORS-free)

## Features

### Merchant Dashboard
- View tip totals by status (Pending, Confirmed, Reversed)
- Net total calculation
- Summary statistics with visual breakdown

### Employee Dashboard
- Complete ledger with all transactions
- Credit/Debit breakdown
- Total balance calculation
- Transaction history table

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
cd frontend
pnpm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

### Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
frontend/
├── app/
│   ├── actions/           # Server actions (API calls)
│   │   ├── auth.ts        # Login action
│   │   └── dashboard.ts   # Dashboard data actions
│   ├── dashboard/
│   │   ├── merchant/      # Merchant dashboard
│   │   └── employee/      # Employee dashboard
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Home page
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── api.ts             # Storage helpers
│   ├── auth-context.tsx   # Auth state management
│   └── types.ts           # TypeScript types
└── public/
```

## Authentication

- JWT-based authentication
- Tokens stored in localStorage
- Auth state managed via React Context
- Auto-redirect based on user role

## API Integration

All API calls use **Server Actions** to avoid CORS issues:

| Action | File | Purpose |
|--------|------|---------|
| `loginAction` | `app/actions/auth.ts` | User login |
| `getMerchantTipSummaryAction` | `app/actions/dashboard.ts` | Merchant tip stats |
| `getEmployeeTipsAction` | `app/actions/dashboard.ts` | Employee ledger |

## Test Credentials

```
Merchant: mountain_Bechtelar@gmail.com
Employee: Brad_Trantow@hotmail.com
Password: Password123!
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Docker

### Build Frontend Only

```bash
cd frontend
docker build -t tip-ledger-frontend .
docker run -p 3001:3001 -e NEXT_PUBLIC_API_URL=http://localhost:3000 tip-ledger-frontend
```

### Run Full Stack (from root)

```bash
# From project root
docker-compose up -d
```

This starts:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5433
- **RabbitMQ**: localhost:5672 (Management: localhost:15672)
