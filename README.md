<div align="center">

# Chirpy API 🐦✨

**A complete Twitter/X clone REST API** built during the [Boot.dev Backend Career Path](https://www.boot.dev).

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
| Language         | TypeScript 5                         | Type safety & DX                     |
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
2. Create .env
Bash# Create manually (no .env.example yet)
nano .env
Minimal content:
envDB_URL=postgres://postgres:postgres@localhost:5432/chirpy?sslmode=disable
PLATFORM=dev
JWT_SECRET=your-super-long-random-secret-min-64-bytes
POLKA_KEY=f271c81ff7084ee5b99a5091b42d486e
3. Run PostgreSQL (Docker – recommended)
Bashdocker run -d \
  --name chirpy-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
(Or use local PostgreSQL)
4. Migrations & start
Bashnpm run db:generate    # create migration files if schema changed
npm run db:migrate     # apply migrations

npm run dev            # compile TS & start server
Server available at: http://localhost:8080
📜 Available Scripts
Bashnpm run dev            # compile + run dev server (recommended)
npm run build          # compile to dist/
npm run start          # run compiled server
npm run test           # run unit tests (Vitest)
npm run db:generate    # generate migration files
npm run db:migrate     # apply migrations
🔐 Environment Variables



































NameRequiredDescriptionExample/DefaultDB_URLYesPostgreSQL connection stringpostgres://postgres:postgres@localhost:5432/chirpy?sslmode=disablePLATFORMYesdev to enable /admin/resetdevJWT_SECRETYesSecret for signing/verifying JWTsrandom 64+ byte base64 stringPOLKA_KEYYesAPI key for Polka webhooksf271c81ff7084ee5b99a5091b42d486e
Never commit .env! (it's in .gitignore)
📖 Full API Documentation
Base URL: http://localhost:8080/api
Authentication
Authenticated endpoints require:
textAuthorization: Bearer <access-jwt-token>
Access tokens expire after 1 hour.
Use /api/refresh with refresh token to get new access token.
Users



Chirps




Refresh Tokens


Polka Webhooks (Chirpy Red)

Admin Endpoints
GET /admin/metrics – View hit counter (HTML page)
POST /admin/reset – Reset counter & delete all users (dev only)
Response: 200 "Hits reset to 0 and all users deleted"
📜 License
MIT
Made with ❤️ during Boot.dev backend path
Questions? Open an issue or reach out on GitHub!
text### How to apply this now

1. Replace your current README:

   ```bash
   cat > README.md << 'EOF'
   # paste the entire content above here (copy from this message)
   EOF
Or open with nano and paste manually:
Bashnano README.md

Commit & push:Bashgit add README.md
git commit -m "Update README with very detailed, beautiful API documentation"
git push origin main
