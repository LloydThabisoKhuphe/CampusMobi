# Quick Start Guide - CampusMobi Node.js Backend

Get the API running in 5 minutes.

## Prerequisites

- Node.js 18+ ([Download here](https://nodejs.org))
- npm (comes with Node.js)
- Git (optional, if cloning)

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- express (web framework)
- sequelize (database ORM)
- sqlite3 (dev database)
- jsonwebtoken (JWT authentication)
- bcryptjs (password hashing)
- cors (cross-origin handling)
- dotenv (environment config)

## Step 2: Setup Environment

```bash
cp .env.example .env
```

The `.env` file is already configured for local development. No changes needed!

## Step 3: Start the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

You should see:
```
CampusMobi API running on http://localhost:8080/api
```

## Step 4: Test the API

### Login with Demo Account

Open your terminal and run:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo.student",
    "password": "Password123!"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "demo.student",
    "fullName": "Demo Student",
    "studentId": "DEMO001",
    "role": "STUDENT",
    "isGuest": false
  }
}
```

### Access Protected Route

Copy the token from above and run:

```bash
curl -X GET http://localhost:8080/api/wallet \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Expected Response:**
```json
{
  "id": 1,
  "balance": 500,
  "currency": "ZAR",
  "transactions": []
}
```

## Common Endpoints to Try

```bash
# Login as Guest
curl -X POST http://localhost:8080/api/auth/guest

# Register New User
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "SecurePass123!",
    "fullName": "New User",
    "studentId": "STU123"
  }'

# Get Public Services
curl http://localhost:8080/api/services

# Get Campus Locations
curl http://localhost:8080/api/map/locations

# Get Notifications (need token)
curl http://localhost:8080/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Calendar Events (need token)
curl "http://localhost:8080/api/calendar/events?date=2026-08-30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Directory Structure

```
nodejs-backend/
├── src/
│   ├── index.js              # Main entry point
│   ├── models/               # Database models
│   ├── services/             # Business logic
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth, validation, errors
│   ├── config/               # Database config
│   └── seeders/              # Demo data
├── data/                     # SQLite database (auto-created)
├── package.json              # Dependencies
├── .env                      # Environment variables
└── README.md                 # Full documentation
```

## Database

The database is automatically created in `data/campusmobi.sqlite` on first run.

### Database File Location
```
nodejs-backend/data/campusmobi.sqlite
```

### Reset Database

To start fresh:

```bash
# Stop the server (Ctrl+C)
# Delete the database file
rm data/campusmobi.sqlite

# Restart the server
npm run dev
```

## Environment Variables

Edit `.env` to change:

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default: 8080) |
| `CORS_ALLOWED_ORIGINS` | Frontend URL |
| `JWT_SECRET` | Token signing key (change in production!) |
| `JWT_EXPIRATION_MINUTES` | Token validity (default: 24 hours) |

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=8081
```

### Database Locked
```bash
# Delete and recreate
rm data/campusmobi.sqlite
npm run dev
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Connection Refused
- Make sure server is running (`npm run dev`)
- Check the port is correct (default 8080)
- Verify API base URL includes `/api` path

## Development Workflow

1. Make code changes
2. Server auto-restarts (with `npm run dev`)
3. Test endpoints with curl or Postman
4. Check terminal for logs and errors

## Next: Connect Frontend

In your React frontend's `.env`:

```
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

Then start the frontend:

```bash
npm start
```

Both frontend and backend should now communicate!

## Production Deployment

When ready to deploy:

1. Set `NODE_ENV=production` in `.env`
2. Use a real database (PostgreSQL recommended)
3. Set a strong `JWT_SECRET`
4. Use a process manager (PM2, systemd)
5. Add rate limiting and monitoring

See `README.md` for full production setup guide.

## Need Help?

- Check the full `README.md` for detailed API docs
- Review `MIGRATION_GUIDE.md` to understand the architecture
- View example cURL commands above
- Check server logs for error details
