# ScoreSlayer

ScoreSlayer is a monorepo containing a mobile app and an API server for competitive scorekeeping.

## Prerequisites

- [Node.js](https://nodejs.org/) (v24 recommended)
- [pnpm](https://pnpm.io/) (v10+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (local or hosted)

## Local Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and update the `DATABASE_URL`.
   ```bash
   cp .env.example .env
   ```

3. **Initialize the database (optional)**:
   If you have a fresh database, you can push the schema:
   ```bash
   pnpm --filter @workspace/db run push
   ```

4. **Start Development**:
   To start both the API server and the Mobile app:
   ```bash
   pnpm run dev
   ```

   Individual components:
   - **API Server**: `pnpm --filter @workspace/api-server run dev`
   - **Mobile (Expo)**: `pnpm --filter @workspace/mobile run dev`

## Project Structure

- `artifacts/api-server`: Express 5 API
- `artifacts/mobile`: Expo React Native app
- `lib/db`: Shared Drizzle ORM layer
- `lib/api-spec`: OpenAPI specifications
- `lib/api-client-react`: Generated React Query hooks
- `lib/api-zod`: Generated Zod schemas
