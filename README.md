<div align="center">

# Chirpy API 🐦✨

**Full Twitter/X clone REST API** built during the [Boot.dev Backend Career Path](https://www.boot.dev).

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-8A2BE2?style=for-the-badge&logo=postgresql&logoColor=white)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Secure • Type-safe • Well-documented • Boot.dev certified**

</div>

## ✨ Features

- 🔐 User registration & login with **Argon2** password hashing
- 🪙 JWT access tokens (1 hour) + long-lived refresh tokens (60 days)
- 🔄 Refresh & revoke tokens
- 🐦 Chirp (tweet) full CRUD with **ownership authorization**
- 🚫 Profanity filtering (kerfuffle, sharbert, fornax → ****)
- 🔍 Chirp filtering (`?authorId=…`) & sorting (`?sort=asc|desc`)
- 💎 Chirpy Red membership via **Polka payment webhooks** (API key protected)
- 📊 Admin tools: reset DB & view hit counter
- 🧪 Unit tests with Vitest
- 📖 Comprehensive API documentation

## 🛠 Tech Stack

| Layer            | Technology                           | Purpose                              |
|------------------|--------------------------------------|--------------------------------------|
| Runtime          | Node.js 20+                          | Server execution                     |
| Framework        | Express 5                            | HTTP routing & middleware            |
| Language         | TypeScript 5                         | Type safety & developer experience   |
| Database         | PostgreSQL 16                        | Relational storage                   |
| ORM              | Drizzle ORM                          | Type-safe queries                    |
| Passwords        | Argon2                               | Secure hashing                       |
| Tokens           | jsonwebtoken                         | JWT signing/verification             |
| Testing          | Vitest                               | Fast unit tests                      |
| Config           | dotenv                               | Environment variables                |

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/janadroubi/chirpy-api.git
cd chirpy-api
npm install


### 2. Create `.env`

```bash
# Create manually (no .env.example yet)
nano .env
```

Minimal content:

```env
# PostgreSQL connection
DB_URL=postgres://postgres:postgres@localhost:5432/chirpy?sslmode=disable

# Enables /admin/reset
PLATFORM=dev

# JWT signing secret (generate with: openssl rand -base64 64)
JWT_SECRET=your-super-long-random-secret-min-64-bytes

# Polka webhook API key (from Boot.dev lesson)
POLKA_KEY=f271c81ff7084ee5b99a5091b42d486e
```

### 3. Run PostgreSQL (Docker – recommended)

```bash
docker run -d \
  --name chirpy-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
```

(Or use local PostgreSQL)

### 4. Migrations & start

```bash
npm run db:generate    # create migration files if schema changed
npm run db:migrate     # apply migrations

npm run dev            # compile TS & start server
```

Server available at: **http://localhost:8080**

## 📜 Available Scripts

```bash
npm run dev            # compile + run dev server (recommended)
npm run build          # compile to dist/
npm run start          # run compiled server
npm run test           # run unit tests (Vitest)
npm run db:generate    # generate migration files
npm run db:migrate     # apply migrations
```

## 🔐 Environment Variables

| Name         | Required | Description                                      | Example/Default                              |
|--------------|----------|--------------------------------------------------|----------------------------------------------|
| `DB_URL`     | Yes      | PostgreSQL connection string                     | `postgres://postgres:postgres@localhost:5432/chirpy?sslmode=disable` |
| `PLATFORM`   | Yes      | `dev` to enable /admin/reset                     | `dev`                                        |
| `JWT_SECRET` | Yes      | Secret for signing/verifying JWTs                | random 64+ byte base64 string                |
| `POLKA_KEY`  | Yes      | API key for Polka webhooks                       | `f271c81ff7084ee5b99a5091b42d486e`          |

**Never commit `.env`!** (it's in `.gitignore`)

## 📖 Full API Documentation

Base URL: `http://localhost:8080/api`

### Authentication

Authenticated endpoints require:

```
Authorization: Bearer <access-jwt-token>
```

Access tokens expire after **1 hour**.  
Use `/api/refresh` with refresh token to get new access token.

### Users

<details>
<summary>POST /api/users – Register new user</summary>

```http
POST /api/users HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "strongpass123"
}
```

Response (201 Created):

```json
{
  "id": "uuid-v4",
  "email": "user@example.com",
  "createdAt": "2026-02-21T15:00:00.000Z",
  "updatedAt": "2026-02-21T15:00:00.000Z",
  "isChirpyRed": false
}
```

</details>

<details>
<summary>POST /api/login – Login & get tokens</summary>

```http
POST /api/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "strongpass123"
}
```

Response (200 OK):

```json
{
  "id": "uuid-v4",
  "email": "...",
  "createdAt": "...",
  "updatedAt": "...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "64-char-hex-string",
  "isChirpyRed": false
}
```

</details>

<details>
<summary>PUT /api/users – Update own email/password (authenticated)</summary>

```http
PUT /api/users HTTP/1.1
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "email": "new@email.com",
  "password": "newstrongpass456"
}
```

Response (200 OK):

```json
{
  "id": "uuid-v4",
  "email": "new@email.com",
  "createdAt": "...",
  "updatedAt": "...",
  "isChirpyRed": false
}
```

</details>

### Chirps

<details>
<summary>POST /api/chirps – Create chirp (authenticated)</summary>

```http
POST /api/chirps HTTP/1.1
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "body": "Hello Chirpy world! (max 140 chars)"
}
```

Response (201 Created):

```json
{
  "id": "uuid-v4",
  "createdAt": "...",
  "updatedAt": "...",
  "body": "...",
  "userId": "uuid-v4"
}
```

</details>

<details>
<summary>GET /api/chirps – List chirps</summary>

Query parameters:
- `authorId=uuid` — filter by author
- `sort=asc|desc` — sort by created_at (default: asc)

```http
GET /api/chirps?authorId=uuid-v4&sort=desc HTTP/1.1
```

Response (200 OK):

```json
[
  {
    "id": "uuid-v4",
    "createdAt": "...",
    "updatedAt": "...",
    "body": "...",
    "userId": "uuid-v4"
  },
  ...
]
```

</details>

<details>
<summary>GET /api/chirps/:chirpId – Get single chirp</summary>

```http
GET /api/chirps/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
```

Response (200 OK):

```json
{
  "id": "...",
  "createdAt": "...",
  "updatedAt": "...",
  "body": "...",
  "userId": "..."
}
```

(404 if not found)

</details>

<details>
<summary>DELETE /api/chirps/:chirpId – Delete chirp (only by owner)</summary>

```http
DELETE /api/chirps/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer <access-token>
```

Response: **204 No Content**

Errors:
- 401 Unauthorized
- 403 Forbidden (not owner)
- 404 Not Found

</details>

### Refresh Tokens

<details>
<summary>POST /api/refresh – Get new access token</summary>

```http
POST /api/refresh HTTP/1.1
Authorization: Bearer <refresh-token>
```

Response (200 OK):

```json
{
  "token": "new-jwt-access-token"
}
```

</details>

<details>
<summary>POST /api/revoke – Revoke refresh token</summary>

```http
POST /api/revoke HTTP/1.1
Authorization: Bearer <refresh-token>
```

Response: **204 No Content**

</details>

### Polka Webhooks (Chirpy Red)

<details>
<summary>POST /api/polka/webhooks – Handle membership upgrades (Polka only)</summary>

Header required:
```
Authorization: ApiKey f271c81ff7084ee5b99a5091b42d486e
```

Example body:
```json
{
  "event": "user.upgraded",
  "data": {
    "userId": "uuid-v4"
  }
}
```

Responses:
- **204 No Content** → success or ignored event
- **401 Unauthorized** → invalid/missing API key
- **404 Not Found** → user not found

</details>

### Admin Endpoints

**GET /admin/metrics** – View hit counter (HTML page)

**POST /admin/reset** – Reset counter & delete all users (dev only)

Response: **200** "Hits reset to 0 and all users deleted"

## 📜 License

MIT
