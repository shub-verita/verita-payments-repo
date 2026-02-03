# Verita Payments Portal

Contractor payments portal for Verita AI - Mercor-style earnings dashboard with Deel integration.

## Quick Start

### 1. Extract and navigate to the project

```bash
tar -xzvf verita-payments.tar.gz
cd verita-payments
```

### 2. Install dependencies

```bash
npm install
```

### 3. Push database schema to Supabase

```bash
npx prisma db push
```

### 4. Seed demo data (optional but recommended)

```bash
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to login.

---

## Authentication

This project uses **Clerk** for authentication. The credentials are already configured in `.env`.

- **Login page**: `/login`
- **Sign up page**: `/signup`
- Sign in with **Email** or **Google**

After signing in, you'll be redirected to `/dashboard`.

---

## Project Structure

```
verita-payments/
├── prisma/
│   ├── schema.prisma      # Database schema (18 models)
│   └── seed.ts            # Demo data seeder
├── src/
│   ├── app/
│   │   ├── login/         # Clerk sign-in
│   │   ├── signup/        # Clerk sign-up
│   │   ├── dashboard/     # Contractor dashboard
│   │   ├── payments/      # Payment history
│   │   ├── ops/           # Ops portal
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── ui/            # shadcn components
│   │   └── contractor/    # Earnings chart, badges
│   ├── lib/
│   │   ├── db.ts          # Prisma client
│   │   └── utils.ts       # Utilities
│   └── middleware.ts      # Clerk auth middleware
├── .env                   # Environment variables (configured)
├── CLAUDE_CODE_PROMPTS.md # Prompts for extending with Claude Code
└── README.md
```

---

## Available Routes

### Contractor Portal
- `/dashboard` - Earnings overview, charts, recent payments
- `/payments` - Full payment history
- `/documents` - Signed documents (Phase 2)
- `/profile` - Profile settings (Phase 2)

### Ops Portal
- `/ops` - Dashboard with stats and alerts
- `/ops/contractors` - Contractor list
- `/ops/hours` - Hours review and approval
- `/ops/payments` - Payment processing

### API Routes
- `GET /api/contractors` - List contractors
- `POST /api/contractors` - Create contractor
- `GET /api/contractors/[id]` - Get contractor with earnings
- `PATCH /api/contractors/[id]` - Update contractor

---

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (database browser)
npm run db:studio

# Seed demo data
npm run db:seed
```

---

## Next Steps

### Phase 1: MVP (Current)
- [x] Database schema
- [x] Contractor dashboard UI
- [x] Ops dashboard UI
- [ ] Connect to real Deel API
- [ ] Add Clerk authentication

### Phase 2: Insightful Integration
- [ ] Insightful API client
- [ ] Hours sync service
- [ ] Hours approval workflow
- [ ] Batch payment creation

### Phase 3: Checkr + Documents
- [ ] Checkr API integration
- [ ] Block payments for non-clear status
- [ ] Document management

---

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase connection string | ✅ |
| `DIRECT_URL` | Supabase direct connection | ✅ |
| `DEEL_API_KEY` | Deel API key | Phase 1 |
| `INSIGHTFUL_API_KEY` | Insightful API key | Phase 2 |
| `CHECKR_API_KEY` | Checkr API key | Phase 3 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Optional |
| `CLERK_SECRET_KEY` | Clerk secret key | Optional |

---

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

---

## Support

For questions, reach out to the team on Discord or check the technical blueprint in `/docs`.
