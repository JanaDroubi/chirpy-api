<div align="center">

# Chirpy API 🐦

**A full-featured Twitter/X clone REST API** built as part of the [Boot.dev Backend Career Path](https://www.boot.dev).

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-8A2BE2?style=for-the-badge&logo=postgresql&logoColor=white)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

**Production-ready** • **Secure** • **Well-documented** • **Boot.dev certified**

</div>

## ✨ Features

- 🔐 User registration & login with **Argon2 password hashing**
- 🪙 JWT access tokens (1 hour) + long-lived **refresh tokens** (60 days)
- 🔄 Refresh & revoke tokens
- 🐦 Chirp (tweet) CRUD operations with **ownership authorization**
- 🚫 Profanity filtering (kerfuffle → ****, etc.)
- 🔍 Chirp list filtering (`?authorId=…`) & sorting (`?sort=asc|desc`)
- 💎 Chirpy Red membership via **Polka payment webhooks** (API key protected)
- 📊 Admin endpoints: reset & metrics
- 🧪 Unit tests with Vitest
- 📖 Comprehensive API documentation

## 🛠 Tech Stack

| Layer            | Technology                           | Purpose                              |
|------------------|--------------------------------------|--------------------------------------|
| Runtime          | Node.js 20+                          | Server runtime                       |
| Framework        | Express                              | HTTP routing & middleware            |
| Language         | TypeScript 5                         | Type safety & developer experience   |
| Database         | PostgreSQL                           | Relational data storage              |
| ORM              | Drizzle ORM                          | Type-safe SQL queries                |
| Auth             | jsonwebtoken + Argon2                | JWT & password security              |
| Testing          | Vitest                               | Fast unit tests                      |
| Environment      | dotenv                               | Configuration management             |

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone https://github.com/janadroubi/chirpy-api.git
cd chirpy-api
npm install
