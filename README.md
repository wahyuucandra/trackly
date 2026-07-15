# TRACKLY

**Sistem Monitoring Program PDO & AO** — Lacak progres, kelola tugas, dan verifikasi pekerjaan lapangan.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Database** | PostgreSQL (Neon Serverless) |
| **ORM** | Prisma v7 |
| **Auth** | Auth.js v5 (NextAuth) |
| **Forms** | React Hook Form + Zod |
| **State** | Zustand + TanStack Query |
| **HTTP** | Axios |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Export** | xlsx (SheetJS) |
| **Deploy** | Vercel-ready + Docker |

---

## Struktur Folder

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth route group (login)
│   │   ├── login/page.tsx      # Login page
│   │   └── layout.tsx          # Auth layout (gradient background)
│   ├── (dashboard)/            # Dashboard route group
│   │   ├── page.tsx            # Dashboard (PDO & AO views)
│   │   ├── programs/page.tsx   # Program management
│   │   ├── tasks/page.tsx      # My Tasks (AO)
│   │   ├── approvals/page.tsx  # Approve/reject
│   │   ├── export/page.tsx     # Export XLSX
│   │   ├── users/page.tsx      # User management
│   │   ├── layout.tsx          # Dashboard layout wrapper
│   │   ├── loading.tsx         # Dashboard loading skeleton
│   │   └── error.tsx           # Dashboard error boundary
│   ├── api/                    # API Route Handlers
│   │   ├── auth/[...nextauth]/ # Auth.js API
│   │   ├── programs/           # Program CRUD
│   │   ├── tasks/              # Task CRUD
│   │   ├── users/              # User CRUD
│   │   ├── approvals/          # Approve/reject
│   │   └── export/             # XLSX export
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Design tokens + animations
│   ├── not-found.tsx           # 404 page
│   └── error.tsx               # Global error boundary
│
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── layout/                 # Topbar, DashboardLayout
│   ├── common/                 # StatusBadge, EmptyState, StatCard
│   └── features/               # Feature-specific (auth/LoginForm)
│
├── lib/                        # Core utilities
│   ├── prisma.ts              # Prisma client singleton
│   ├── auth.ts                # Auth.js config
│   ├── axios.ts               # Axios instance
│   └── utils.ts               # cn() helper
│
├── hooks/                      # Custom hooks (ready for use)
├── store/                      # Zustand stores (useAuthStore)
├── types/                      # Global TypeScript types
├── constants/                  # App constants (roles, colors, etc.)
├── utils/                      # Formatters, calendar
├── schemas/                    # Zod validation schemas
├── services/                   # Service layer (ready for use)
└── middleware.ts               # Auth middleware
```

---

## Cara Install

```bash
# Clone repo
git clone <repo-url>
cd trackly

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan kredensial database Neon Anda

# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push

# Seed data awal
npx prisma db seed
```

---

## Cara Menjalankan

```bash
# Development
npm run dev
# Buka http://localhost:3000

# Production build
npm run build
npm start
```

### Login Credentials (Default)

| Username | Password | Role | Akses |
|----------|----------|------|-------|
| `admin` | `admin` | Admin | Full access |
| `andri` | `andri` | AO | Surabaya |
| `puja` | `andri` | AO | Surabaya |
| `banu` | `andri` | AO | Surabaya |
| `sandy` | `andri` | AO | Jakarta |
| `ferdinan` | `andri` | AO | Jakarta |
| `febri` | `andri` | AO | Jakarta |
| `bagus` | `andri` | AO | Jakarta |

---

## Deploy ke Vercel

1. Push project ke GitHub
2. Di Vercel, import repository
3. Set environment variables:
   - `DATABASE_URL` — Neon pooled connection
   - `AUTH_SECRET` — generate: `openssl rand -base64 32`
   - `AUTH_URL` — `https://domain-anda.vercel.app`
4. Deploy

### Docker

```bash
# Build
docker build -t trackly .

# Run (pastikan .env sudah diisi)
docker run -p 3000:3000 --env-file .env trackly

# Docker Compose
docker compose up
```

---

## Konfigurasi Environment

`.env.example`:

```env
# Neon PostgreSQL (Serverless)
DATABASE_URL="postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require"

# Auth.js
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="TRACKLY"
```

---

## Konfigurasi Database PostgreSQL

### Setup Neon DB

1. Daftar di [neon.tech](https://neon.tech)
2. Buat database baru
3. Copy **pooled connection string**
4. Paste ke `.env` sebagai `DATABASE_URL`

### Migration

```bash
# Push schema (development)
npx prisma db push

# Generate migration (production)
npx prisma migrate dev --name init
```

### Seed

```bash
npx prisma db seed
```

### Studio (GUI)

```bash
npx prisma studio
```

---

## Alur Aplikasi

```
┌─────────────────────────────────────────────────┐
│                   LOGIN                          │
│         Username + Password                     │
└────────────────────┬────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
    ┌──────────┐          ┌──────────┐
    │  ADMIN   │          │    AO    │
    │ (PDO)    │          │          │
    └────┬─────┘          └────┬─────┘
         │                     │
    ┌────┴────────────────┐    ├── Dashboard
    │ Dashboard           │    ├── My Tasks
    │ Program Management  │    │   └── Update status
    │ Task Management     │    │   └── Submit for review
    │ Approvals           │    │   └── View rejection
    │ Export XLSX         │    │
    │ User Management     │    │
    └─────────────────────┘    │
         │                     │
         ▼                     ▼
    ┌─────────────────────────────────┐
    │      APPROVAL WORKFLOW          │
    │  AO submits → Admin reviews     │
    │  Approve ✅ or Reject ❌        │
    └─────────────────────────────────┘
```

---

## Menambah Halaman Baru

1. Buat folder di `src/app/(dashboard)/nama-halaman/`
2. Buat `page.tsx`:
```tsx
"use client";

export default function NamaHalaman() {
  return <div>...</div>;
}
```

---

## Menambah API Baru

1. Buat folder di `src/app/api/nama-endpoint/`
2. Buat `route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ...
}
```

---

## Menggunakan Zustand

```tsx
import { useAuthStore } from "@/store/useAuthStore";

function MyComponent() {
  const { session, isAdmin } = useAuthStore();
  // ...
}
```

---

## Menggunakan React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mySchema } from "@/schemas/my.schema";

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(mySchema),
  });
  // ...
}
```

---

## Best Practice

- **Server Components** by default, `"use client"` hanya jika butuh interaktivitas
- **Pisahkan logic dari UI** — custom hooks untuk data fetching, service untuk API calls
- **Gunakan TanStack Query** untuk semua data fetching (caching, refetch, optimistic updates)
- **Zustand** hanya untuk state global (auth, UI, theme)
- **Validasi di client dan server** — Zod schema digunakan di form dan API route
- **Error handling** — try/catch di service, error boundary di UI
- **Loading state** — skeleton loading untuk UX yang baik

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Can't reach database server` | Cek `DATABASE_URL` di `.env` |
| `Module not found: @/generated/prisma` | Run `npx prisma generate` |
| Login gagal | Cek password di database, atau run `npx prisma db seed` |
| Build error TypeScript | Run `npx tsc --noEmit` untuk lihat detail |
| `middleware` deprecated warning | Bisa diabaikan, Next.js 16 masih support |

---

## License

Proprietary — Astra Credit Companies

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
