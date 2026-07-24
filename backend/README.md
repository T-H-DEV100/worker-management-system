# Worker Management System — Backend

Restructured from a single `server.js` file into a proper MVC-style layout.

## Folder structure

```
backend/
├── config/
│   └── db.js                 # MySQL connection pool
├── controllers/
│   ├── authController.js     # login, register logic
│   ├── attendanceController.js  # check-in, check-out, history logic
│   └── adminController.js    # workers, today's attendance, late reports logic
├── middleware/
│   └── authMiddleware.js     # JWT verification (authenticateToken)
├── routes/
│   ├── authRoutes.js         # /api/auth/*
│   ├── attendanceRoutes.js   # /api/attendance/*
│   └── adminRoutes.js        # /api/admin/*
├── .env.example
├── package.json
└── server.js                 # app entry point — wires routes together
```

## Why this structure

- **routes/** only define *which URL calls which function*. No business logic here.
- **controllers/** hold the actual logic for each route (what used to be inline in `server.js`).
- **middleware/** holds reusable request-processing logic (auth checking).
- **config/** holds setup/configuration (DB connection).
- **server.js** becomes tiny — it just loads middleware and mounts routes.

This makes it much easier to:
- Find code (e.g. all attendance logic lives in one file)
- Test controllers independently
- Add new features without server.js growing indefinitely
- Onboard collaborators, since the structure is self-explanatory

## Setup

1. Copy `.env.example` to `.env` and fill in your real values:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   npm start
   ```
   or, for auto-restart on file changes:
   ```bash
   npm run dev
   ```

## API Endpoints

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | /api/auth/login | No | Worker login |
| POST | /api/auth/register | No | Worker registration |
| POST | /api/attendance/check-in | Yes | Check in for the day |
| POST | /api/attendance/check-out | Yes | Check out for the day |
| GET | /api/attendance/history | Yes | Get attendance history |
| GET | /api/admin/workers | Yes | List all workers |
| GET | /api/admin/attendance/today | Yes | Today's attendance for all workers |
| GET | /api/admin/late-reports | Yes | List late reports |
| PUT | /api/admin/late-reports/:id/review | Yes | Mark a late report reviewed |
| DELETE | /api/admin/workers/:id | Yes | Delete a worker |

## Note on secrets

The original file had a hardcoded `JWT_SECRET` fallback and empty DB password.
For production, set real values in `.env` and never commit that file to GitHub —
it's good practice to add `.env` to `.gitignore`.
