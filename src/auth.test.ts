import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, checkPasswordHash, makeJWT, validateJWT } from "./auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for the wrong password", async () => {
    const result = await checkPasswordHash("wrongPassword", hash1);
    expect(result).toBe(false);
  });

  it("different passwords produce different hashes", () => {
    expect(hash1).not.toBe(hash2);
  });
});

describe("JWT Creation & Validation", () => {
  const userID = "user-123";
  const secret = "super-secret-key";
  const expiresIn = 3600; // 1 hour in seconds

  let validToken: string;

  beforeAll(() => {
    validToken = makeJWT(userID, expiresIn, secret);
  });

  it("creates a valid JWT", () => {
    expect(validToken).toBeTruthy();
    expect(typeof validToken).toBe("string");
    expect(validToken.split(".")).toHaveLength(3); // header.payload.signature
  });

  it("validates a correct JWT and returns user ID", () => {
    const decodedUserId = validateJWT(validToken, secret);
    expect(decodedUserId).toBe(userID);
  });

  it("rejects JWT with wrong secret", () => {
    expect(() => validateJWT(validToken, "wrong-secret")).toThrow();
  });

  it("rejects expired JWT", () => {
    const expiredToken = makeJWT(userID, -3600, secret); // expired 1 hour ago
    expect(() => validateJWT(expiredToken, secret)).toThrow();
  });

  it("rejects malformed JWT", () => {
    expect(() => validateJWT("not-a-jwt", secret)).toThrow();
  });
});
