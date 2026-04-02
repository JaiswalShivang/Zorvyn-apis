# Zorvyn Finance Dashboard API

A RESTful backend for a role-based finance dashboard. Built with Node.js, Express, Prisma ORM, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js (ES6 Modules)
- **Framework:** Express v5
- **ORM:** Prisma v7 (`prisma-client-js`)
- **Database:** PostgreSQL
- **Auth:** JSON Web Tokens (JWT) + bcrypt password hashing
- **Adapter:** `@prisma/adapter-pg` with connection pooling via `pg.Pool`

## Role Hierarchy

| Role   | View Dashboard | Create Records | Update Records | Delete Records | View Records |
| :----- | :------------: | :------------: | :------------: | :------------: | :----------: |
| Admin  |       ✅       |       ✅       |       ✅       |       ✅       |      ✅      |
| Analyst|       ✅       |       ❌       |       ✅       |       ❌       |      ✅      |
| Viewer |       ❌       |       ❌       |       ❌       |       ❌       |      ✅      |

## Project Structure

```
├── config/
│   └── db.js                    # Shared Prisma client (singleton)
├── controllers/
│   ├── authController.js        # Signup & login handlers
│   ├── dashboardController.js   # Aggregated analytics
│   └── recordController.js      # CRUD + pagination/search
├── middlewares/
│   ├── authMiddleware.js        # JWT verification & role guard
│   └── errorMiddleware.js       # Centralized error handler
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   └── recordRoutes.js
├── prisma/
│   └── schema.prisma            # Database schema
├── generated/
│   └── prisma/                  # Auto-generated Prisma client
├── server.js                    # Entry point
└── package.json
```

## API Endpoints

### Auth

| Method | Endpoint         | Access  | Description              |
| :----- | :--------------- | :------ | :----------------------- |
| POST   | `/api/auth/signup`  | Public  | Register a new user      |
| POST   | `/api/auth/login`   | Public  | Authenticate & get token |
| GET    | `/api/auth/profile` | Token   | View authenticated user  |

### Financial Records

| Method | Endpoint            | Access          | Description                          |
| :----- | :------------------ | :-------------- | :----------------------------------- |
| GET    | `/api/records`      | All roles       | List records (paginated, searchable) |
| POST   | `/api/records`      | Admin only      | Create a record                      |
| PUT    | `/api/records/:id`  | Admin, Analyst  | Update a record                      |
| DELETE | `/api/records/:id`  | Admin only      | Delete a record                      |

#### Query Parameters for `GET /api/records`

| Param    | Type   | Default | Description                              |
| :------- | :----- | :------ | :--------------------------------------- |
| `page`   | Number | 1       | Page number                              |
| `limit`  | Number | 10      | Records per page                         |
| `type`   | String | —       | Filter by `INCOME` or `EXPENSE`          |
| `category` | String | —     | Filter by category name                  |
| `search` | String | —       | Case-insensitive search on notes & category |

**Example:** `GET /api/records?type=EXPENSE&page=2&limit=5&search=travel`

**Response:**
```json
{
  "records": [ ... ],
  "pagination": {
    "total": 150,
    "page": 2,
    "limit": 5,
    "totalPages": 30
  }
}
```

### Dashboard

| Method | Endpoint                | Access          | Description                  |
| :----- | :---------------------- | :-------------- | :--------------------------- |
| GET    | `/api/dashboard/summary` | Admin, Analyst | Aggregated financial summary |

**Response:**
```json
{
  "totalIncome": 50000,
  "totalExpense": 32000,
  "netBalance": 18000,
  "categoryTotals": [
    { "category": "Travel", "total": 12000 },
    { "category": "Food", "total": 8000 }
  ],
  "recentTransactions": [ ... ]
}
```

## Setup Instructions

### 1. Clone & Install

```bash
git clone <repository-url>
cd zorvyn-apis
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
JWT_SECRET="your_secure_random_secret"
NODE_ENV="development"
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev
```

This will:
- Apply all migrations in `prisma/migrations/`
- Generate the Prisma client into `generated/prisma/`

### 4. Generate Prisma Client (if needed)

```bash
npx prisma generate
```

### 5. Start the Server

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000` by default. Override with the `PORT` environment variable.

## Assumptions

1. **Viewers cannot access the Dashboard Summary.** Aggregated financial data is restricted to Analysts and Admins to limit exposure of organization-wide totals to lower-privilege users.

2. **Only Admins can create and delete records.** This enforces a write-restricted model where Analysts can view and update but not introduce or remove data.

3. **Search is scoped to `notes` and `category` fields.** Full-text search across all fields was not implemented to keep queries performant on the indexed columns.

4. **Pagination defaults to 10 records per page.** This prevents unbounded queries from degrading performance when the records table grows.

5. **JWT tokens expire after 1 hour.** Refresh token logic is not implemented; clients must re-authenticate after expiry.

6. **A single shared Prisma client instance is used.** The `config/db.js` singleton avoids creating multiple database connection pools during the application lifecycle.

7. **The `amount` field uses `Decimal(18, 2)`.** Financial amounts are stored with 2 decimal places to avoid floating-point precision errors.
