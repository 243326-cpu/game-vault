# GameVault

GameVault is now a single-stack Next.js application. The frontend and backend API run from the same Next.js project, so deployment only needs one app service plus a MongoDB connection string.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure a live MongoDB database in `.env.local`:

```bash
MONGODB_URI=mongodb+srv://USERNAME:URL_ENCODED_PASSWORD@CLUSTER.mongodb.net/gamevault
SESSION_SECRET=replace-with-a-long-random-secret
```

Use MongoDB Atlas or another hosted MongoDB provider. Replace `USERNAME`, `URL_ENCODED_PASSWORD`, and `CLUSTER` with your real database credentials. The database name at the end can stay `gamevault`. If your password contains symbols like `@`, encode them first. Set `SESSION_SECRET` to a long random value; it signs login sessions.

3. Start Next.js:

```bash
npm run dev
```

4. Open the app:

```bash
http://localhost:3000
```

## API Routes

These routes are served by Next.js route handlers under `app/api`:

- `GET /api`
- `GET /api/players`
- `GET /api/players?game=PUBG&rank=Diamond&name=shadow&limit=10`
- `GET /api/tournaments`
- `GET /api/teams`
- `GET /api/registrations`
- `GET /api/registrations/:id`
- `POST /api/registrations`
- `PUT /api/registrations/:id`
- `DELETE /api/registrations/:id`

Compatibility aliases are also available:

- `GET /api/tournaments/players`
- `POST /api/tournaments/players`
- `PUT /api/tournaments/players/:id`
- `DELETE /api/tournaments/players/:id`

## Migration Plan

1. Keep the existing Next.js app as the only runtime.
2. Move Express route behavior into `app/api` route handlers.
3. Move shared backend data and helpers into `lib`.
4. Keep MongoDB persistence through a cached server-side Mongoose connection.
5. Change client fetches to same-origin `/api/...` URLs.
6. Remove the standalone backend folder and backend deployment instructions.
7. Deploy the project as one Next.js service with `MONGODB_URI` and `SESSION_SECRET` configured.

## Deployment

Deploy the root folder only. On Vercel or another Next.js host, set this environment variable:

```bash
MONGODB_URI=mongodb+srv://USERNAME:URL_ENCODED_PASSWORD@CLUSTER.mongodb.net/gamevault
SESSION_SECRET=replace-with-a-long-random-secret
```

No separate Express server, backend port, CORS config, or `NEXT_PUBLIC_API_BASE_URL` is required.

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. Add your deployment IP to Network Access. For Vercel or changing IP hosts, use `0.0.0.0/0` only if you understand the security tradeoff.
4. Copy the driver connection string.
5. Put it in `.env.local` for local development and in your hosting provider's environment variables for production:

```bash
MONGODB_URI=mongodb+srv://USERNAME:URL_ENCODED_PASSWORD@CLUSTER.mongodb.net/gamevault
SESSION_SECRET=replace-with-a-long-random-secret
```
