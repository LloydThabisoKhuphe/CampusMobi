# CampusMobi — Backend (Node.js/Express)

A REST API for the CampusMobi React frontend, converted from Java Spring Boot to Node.js/Express.

## Stack

- Node.js 18+ with Express.js (v4.18+)
- JWT authentication (jsonwebtoken) — stateless, `Authorization: Bearer <token>`
- SQLite for development (zero setup) — PostgreSQL for production
- Bcrypt password hashing
- Sequelize ORM for database management

## Installation & Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Steps

1. **Install dependencies:**240746708
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Start the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

The API starts on **http://localhost:8080/api** — matching the Java version exactly.

## Demo User

A demo student is seeded automatically on first run:

| Field    | Value              |
|----------|--------------------|
| username | `demo.student`     |
| password | `Password123!`     |

Or use **Continue as Guest** — `POST /auth/guest` — which creates a limited session with:
- No wallet access
- No student card access
- No calendar editing (read-only)

## Configuration

All config lives in `.env`:

| Variable                   | Default                                   | Purpose                          |
|-----------------------------|--------------------------------------------|-----------------------------------|
| `NODE_ENV`                  | `development`                             | Runtime environment              |
| `PORT`                      | `8080`                                    | Server port                      |
| `CORS_ALLOWED_ORIGINS`      | `http://localhost:3000`                   | Comma-separated allowed origins  |
| `JWT_SECRET`                | dev placeholder — **change in prod**      | HS256 signing key (min 32 chars) |
| `JWT_EXPIRATION_MINUTES`    | `1440` (24h)                              | Token lifetime                   |
| `DB_URL`                    | uses SQLite in dev                        | PostgreSQL URL (production only) |
| `DB_SSL`                    | `false`                                   | Enable SSL for database          |

### Production Setup with PostgreSQL

1. Set `NODE_ENV=production` in `.env`
2. Configure PostgreSQL connection:
   ```
   DB_URL=postgresql://user:password@host:5432/campusmobi
   ```
3. Change `JWT_SECRET` to a strong random key

## API Reference

Base path: `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth (public)

| Method | Path                     | Body                                          | Response |
|--------|---------------------------|------------------------------------------------|----------|
| POST   | `/auth/register`          | `{ username, password, fullName, studentId? }` | `{ token, user }` |
| POST   | `/auth/login`              | `{ username, password }`                       | `{ token, user }` |
| POST   | `/auth/guest`               | —                                               | `{ token, user }` (isGuest: true) |
| POST   | `/auth/forgot-password`     | `{ username }`                                  | `{ message }` |

### Wallet (auth required, blocked for guests → `403`)

| Method | Path             | Body                          | Response |
|--------|-------------------|--------------------------------|----------|
| GET    | `/wallet`          | —                               | `{ balance, currency, transactions[] }` |
| POST   | `/wallet/topup`    | `{ amount }`                    | updated wallet |
| POST   | `/wallet/pay`      | `{ amount, label? }`            | updated wallet (`400` if insufficient) |

### Calendar (auth required; writes blocked for guests → `403`)

| Method | Path                    | Query / Body                              |
|--------|--------------------------|---------------------------------------------|
| GET    | `/calendar/events`       | `?date=2026-08-12` or `?month=2026-08`    |
| POST   | `/calendar/events`       | `{ date, time, title }`                    |
| DELETE | `/calendar/events/{id}`  | —                                          |

### Notifications (auth required — guests included)

| Method | Path                        | Notes |
|--------|------------------------------|-------|
| GET    | `/notifications`             | User + broadcast, newest first |
| PATCH  | `/notifications/{id}/read`   | Mark as read |

### Student Card (auth required, blocked for guests → `403`)

| Method | Path    |
|--------|----------|
| GET    | `/card`  |

### Services & Campus Map (public)

| Method | Path              |
|--------|-------------------|
| GET    | `/services`       |
| GET    | `/map/locations`  |

## Project Structure

```
src/
├── index.js              # Application entry point
├── config/
│   └── database.js       # Sequelize configuration
├── models/               # Database entities
│   ├── User.js
│   ├── Wallet.js
│   ├── Transaction.js
│   ├── CalendarEvent.js
│   ├── Notification.js
│   ├── StudentCard.js
│   ├── CampusLocation.js
│   ├── ServiceItem.js
│   └── index.js          # Associations
├── services/             # Business logic
│   ├── authService.js
│   ├── walletService.js
│   ├── calendarService.js
│   ├── notificationService.js
│   ├── studentCardService.js
│   ├── campusService.js
│   └── jwtService.js
├── routes/               # REST endpoints
│   ├── authRoutes.js
│   ├── walletRoutes.js
│   ├── calendarRoutes.js
│   ├── notificationRoutes.js
│   ├── cardRoutes.js
│   ├── servicesRoutes.js
│   └── mapRoutes.js
├── middleware/           # Request middleware
│   ├── authMiddleware.js
│   └── errorHandler.js
└── seeders/              # Database initialization
    └── dataSeeder.js
```

## Key Differences from Java Version

1. **ORM**: Sequelize instead of Spring Data JPA
2. **Async/Await**: Promise-based instead of imperative
3. **Middleware**: Express middleware chains instead of Spring Filters
4. **Validation**: express-validator instead of Spring Validation
5. **Error Handling**: Custom ApiError class instead of @ExceptionHandler
6. **Configuration**: .env file instead of application.yml

## Development Tips

- Use `npm run dev` for development with nodemon auto-reload
- Check logs for detailed error messages
- SQLite database file: `data/campusmobi.sqlite`
- JWT secret should be 32+ characters in production
- CORS origins can be comma-separated for multiple origins

## Running Tests

```bash
npm test
```

## Notes

- Guest accounts have `isGuest: true` and receive throwaway tokens
- Wallet and calendar data is scoped per authenticated user
- Passwords are BCrypt-hashed (10 rounds)
- Database auto-syncs schema on startup (`Sequelize.sync()`)
- In production, consider using migrations instead of auto-sync
