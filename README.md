# Typing Race

Real-time typing competition web application (TypeRacer-style). Built with Next.js 16, TypeScript, tRPC, Drizzle ORM, Supabase, and shadcn/ui.

## Features

- Anonymous authentication via Supabase (persists across page refreshes)
- Fixed-time rounds (60 seconds) with random English sentences
- Live typing input with character-by-character highlighting (green/red)
- Real-time player progress via Supabase Realtime broadcast channels
- Live results table showing typed text, player name, WPM, and accuracy
- Round results summary between rounds with winner highlight and trophy
- Column sorting (WPM, accuracy, player name) persisted in URL query params
- Pagination and configurable rows per page (5 / 10 / 20)
- Words per minute calculation (only correct characters count)
- Accuracy calculation (correct characters / total typed characters)
- Player stats persistence across rounds (avg WPM, accuracy, rounds played)
- Auto-generated player names (adjective + noun, e.g. "Swift Fox")
- Countdown timer with auto-transition to new rounds
- Loading and error states with shadcn/ui Skeleton
- Toast notifications with Sonner

## Development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Supabase setup:
1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Anonymous Sign-ins** in Authentication → Providers
3. Copy Project URL and Publishable Key from Settings → API

## Database

```bash
pnpm db:push      # Push schema to database
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
```

## Tests

```bash
pnpm test         # Run unit tests
pnpm test:watch   # Run in watch mode
```

Unit tests cover:
- WPM calculation (correct character counting, time scaling, edge cases)
- Accuracy calculation (perfect match, partial match, empty input, overflow)
- Zustand typing store (state transitions, reset, timestamp persistence)
- Constants (sentence randomness, player name generation format)

## Build

```bash
pnpm build
pnpm start
```

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **tRPC v11** with TanStack React Query
- **Drizzle ORM** (Postgres)
- **Supabase** (Anonymous Auth + Postgres + Realtime Broadcast)
- **Zustand** (client-side state management)
- **Zod** (input validation)
- **Tailwind CSS**
- **shadcn/ui**
- **Sonner** (toast notifications)
- **Vitest** + Testing Library (unit tests)
- **Lucide Icons**

## Architecture Decisions

### Supabase Realtime Broadcast (not DB changes)
Player progress is broadcast peer-to-peer via Supabase Realtime channels instead of writing to the database on every keystroke. This minimizes DB load and latency. Stats are only persisted to the database when a round ends.

### Zustand for Typing State
The typing input requires high-frequency state updates (every keystroke). Zustand provides direct synchronous access without React context re-renders, making it ideal for this use case. TanStack Query handles server state (rounds, players), while Zustand handles ephemeral client state (typed text, WPM, accuracy).

### tRPC for API Layer
Type-safe API endpoints with automatic TypeScript inference from server to client. Used for CRUD operations (rounds, players, stats) but not for real-time data flow.

### Anonymous Auth
Supabase Anonymous Sign-ins provide persistent user identity without requiring registration. The session survives page refreshes, allowing player stats to carry across rounds.

### URL-based Sort State
Table sorting is stored in URL query params (`?sortBy=wpm&sortDir=desc`) so it persists across page refreshes — a small but important UX detail.

### Drizzle ORM over Prisma
Drizzle provides a lightweight, SQL-like query builder with full TypeScript inference. Chosen for its minimal overhead and direct mapping to SQL, which fits the simple schema well.

### Round Results Phase
After each round, an 8-second results screen shows the final standings with the winner highlighted (trophy icon). This gives players time to see how they performed before the next round begins automatically.

## Future Improvements

- E2e tests with Playwright (browser-based game flow testing)
- Row Level Security (RLS) policies on Supabase tables
- Monitoring and error tracking (Sentry, Vercel Analytics)
- LLM-generated sentences via Supabase Edge Functions
- Player name editing
- Historical leaderboard across all rounds
- Mobile-optimized typing experience
- Live demo deployment on Vercel

## Data Model

```
players (id, auth_id, name, created_at)
rounds (id, sentence, start_time, duration, status)
round_players (id, round_id, player_id, progress_text, wpm, accuracy, updated_at)
```
