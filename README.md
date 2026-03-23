# SocialPulse Analytics Dashboard MVP

A production-minded social media analytics dashboard built with Next.js 15, TypeScript, Tailwind CSS, and Prisma.

## Current Status
- [x] Full UI scaffold with dark modern theme
- [x] Mock data services for Meta and YouTube
- [x] Normalized metric strategy
- [x] API route stubs for OAuth and Sync
- [x] Prisma database schema
- [x] Responsive KPI cards and Recharts integration

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4
- **Components:** Custom shadcn-inspired components
- **Charts:** Recharts
- **Database:** Prisma ORM with PostgreSQL
- **Animations:** Framer Motion

## Folder Structure
- `src/app`: Next.js pages and API routes
- `src/components`: Reusable UI components
- `src/services`: Platform-specific API logic and normalization
- `src/lib`: Utility functions and shared logic
- `prisma`: Database schema

## Integration TODOs (For Next Agent)

### 1. OAuth Implementation
- Implement `GET /api/connect/meta` to redirect to Meta's OAuth dialog.
- Implement `GET /api/connect/youtube` to redirect to Google's OAuth dialog.
- Create callback handlers to exchange codes for access tokens.
- Store tokens in the `OAuthConnection` model.

### 2. Data Sync Logic
- Implement the `POST /api/sync/*` routes.
- Use `meta.service.ts` to fetch Page/Instagram insights.
- Use `youtube.service.ts` to fetch Channel/Video analytics.
- Use `metrics-normalizer.ts` to standardize data before saving to `DailyMetric`.

### 3. Database Connection
- Configure a real PostgreSQL database in `.env`.
- Run `npx prisma db push` to sync the schema.
- Update API routes to fetch real data from Prisma instead of returning mock objects.

### 4. Real-time Insights
- Implement a background job (e.g., using Inngest or a simple cron) to trigger periodic syncs.
- Add a "Sync Now" button in the Settings page.

## Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up environment variables: `cp .env.example .env`
4. Generate Prisma client: `npx prisma generate`
5. Run development server: `npm run dev`
