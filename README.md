# GameVault

GameVault is a single-stack Next.js application backed by Supabase. The frontend and API routes run from this project, and all GameVault data is stored in Supabase tables or Supabase Auth.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and run the SQL in `supabase/schema.sql` from the Supabase SQL editor.

3. Configure `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Start Next.js:

```bash
npm run dev
```

5. Open the app:

```bash
http://localhost:3000
```

## API Routes

These routes are served by Next.js route handlers under `app/api`:

- `GET /api`
- `GET /api/players`
- `GET /api/players?game=PUBG&rank=Diamond&name=shadow&limit=10`
- `GET /api/leaderboard`
- `POST /api/leaderboard`
- `DELETE /api/leaderboard`
- `DELETE /api/leaderboard/:id`
- `GET /api/tournaments`
- `GET /api/teams`
- `GET /api/registrations`
- `GET /api/registrations/:id`
- `POST /api/registrations`
- `PUT /api/registrations/:id`
- `DELETE /api/registrations/:id`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Compatibility aliases are also available:

- `GET /api/tournaments/players`
- `POST /api/tournaments/players`
- `PUT /api/tournaments/players/:id`
- `DELETE /api/tournaments/players/:id`

## Supabase Data

Run `supabase/schema.sql` once before using the app. It creates and seeds:

- Supabase Auth-linked `profiles`
- `registrations`
- `leaderboard_scores`
- `players`
- `tournaments`
- `teams`

The app does not write GameVault data to local JSON files, MongoDB, or browser `localStorage`.

## Deployment

Deploy the root folder as one Next.js service. Set these environment variables in the hosting provider:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
