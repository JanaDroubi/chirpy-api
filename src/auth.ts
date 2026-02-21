import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import crypto from "crypto";

export function makeRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex"); // 64 chars hex = 256 bits
}

// ======================
// Password Hashing
// ======================

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

// ======================
// JWT Creation
// ======================

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
  const payload: JwtPayload = {
    iss: "chirpy",                  // issuer
    sub: userID,                    // subject = user ID
    iat: Math.floor(Date.now() / 1000),   // issued at (seconds)
    exp: Math.floor(Date.now() / 1000) + expiresIn,  // expiration
  };

  return jwt.sign(payload, secret);
}

// ======================
// JWT Validation
// ======================

export function validateJWT(tokenString: string, secret: string): string {
  try {
    const decoded = jwt.verify(tokenString, secret) as JwtPayload;

    if (typeof decoded === "string") {
      throw new Error("Invalid JWT payload");
    }

    if (!decoded.sub) {
      throw new Error("JWT missing subject (user ID)");
    }

    return decoded.sub as string; // return user ID
  } catch (err) {
    throw new Error("Invalid or expired JWT");
  }
}

// ======================
// Bearer Token Extraction
// ======================

export function getBearerToken(req: Request): string {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const [bearer, token] = authHeader.split(" ");

  if (bearer.toLowerCase() !== "bearer" || !token) {
    throw new Error("Invalid Authorization header format - expected 'Bearer <token>'");
  }

  return token.trim();
}


export function getAPIKey(req: Request): string {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const [api, key] = authHeader.split(" ");

  if (api.toLowerCase() !== "apikey" || !key) {
    throw new Error("Invalid Authorization header format - expected 'ApiKey <key>'");
  }

  return key.trim();
}
