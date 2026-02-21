import express from "express";
import { Request, Response, NextFunction } from "express";
import { config } from "./config.js";
import { getAPIKey } from "./auth.js";

// Custom errors
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "./errors.js";

// Drizzle & DB imports
import { asc, eq, desc } from "drizzle-orm";
import { db } from "./db/index.js";
import { NewUser, NewChirp, users, chirps } from "./db/schema.js";

// Queries
import { createUser, upgradeToChirpyRed } from "./db/queries/users.js";
import { deleteAllUsers } from "./db/queries/delete_all_users.js";
import { createChirp, getAllChirps, getChirpById } from "./db/queries/chirps.js";
import { createRefreshToken, getRefreshToken, revokeRefreshToken } from "./db/queries/refresh_tokens.js";

// Auth utilities
import {
  hashPassword,
  checkPasswordHash,
  makeJWT,
  validateJWT,
  getBearerToken,
  makeRefreshToken,
} from "./auth.js";

// Automatic migrations
import { runMigrations } from "./db/migrator.js";
await runMigrations();

// Extend Express Request type
declare module "express" {
  interface Request {
    userId?: string;
  }
}

const app = express();
const PORT = 8080;

// JSON body parser
app.use(express.json());

// Log non-OK responses
const middlewareLogResponses = (req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    const status = res.statusCode;
    if (status < 200 || status >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${status}`);
    }
  });
  next();
};
app.use(middlewareLogResponses);

// Increment hits for /app routes
const middlewareMetricsInc = (req: Request, res: Response, next: NextFunction) => {
  config.api.fileserverHits += 1;
  next();
};

// Middleware: require valid JWT
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.jwtSecret);
    req.userId = userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized - invalid or missing token" });
  }
};

// Readiness
app.get("/api/healthz", (req: Request, res: Response) => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
});

// Admin metrics (HTML)
app.get("/admin/metrics", (req: Request, res: Response) => {
  res.set("Content-Type", "text/html; charset=utf-8");
  const html = `
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
      </body>
    </html>
  `;
  res.send(html);
});

// Admin reset (POST only, dev mode)
app.post("/admin/reset", async (req: Request, res: Response, next: NextFunction) => {
  if (config.api.platform !== "dev") {
    res.status(403).json({ error: "Forbidden - only available in dev mode" });
    return;
  }

  try {
    config.api.fileserverHits = 0;
    await deleteAllUsers();
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("Hits reset to 0 and all users deleted");
  } catch (err) {
    next(err);
  }
});

// Create user (with password hashing & duplicate handling)
app.post("/api/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as { email?: string; password?: string };

    if (!body || typeof body.email !== "string" || !body.email.trim() ||
        typeof body.password !== "string" || !body.password.trim()) {
      throw new BadRequestError("Invalid or missing email/password");
    }

    const email = body.email.trim();
    const password = body.password.trim();

    const hashedPassword = await hashPassword(password);

    const newUser: NewUser = {
      email,
      hashedPassword,
    };

    const created = await createUser(newUser);

    if (created) {
      res.status(201).json({
        id: created.id,
        email: created.email,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        isChirpyRed: created.isChirpyRed,
      });
      return;
    }

    // Duplicate email - fetch existing
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Failed to create or find user");
    }

    res.status(200).json({
      id: existing[0].id,
      email: existing[0].email,
      createdAt: existing[0].createdAt.toISOString(),
      updatedAt: existing[0].updatedAt.toISOString(),
      isChirpyRed: existing[0].isChirpyRed,
    });

  } catch (err) {
    console.error("Error in /api/users:", err);
    next(err);
  }
});

// Login - issue JWT + refresh token
app.post("/api/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as { email?: string; password?: string };

    if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
      throw new BadRequestError("Invalid or missing email/password");
    }

    const email = body.email.trim();
    const password = body.password.trim();

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        hashedPassword: users.hashedPassword,
        isChirpyRed: users.isChirpyRed,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || user.hashedPassword === "unset") {
      res.status(401).json({ error: "incorrect email or password" });
      return;
    }

    const isMatch = await checkPasswordHash(password, user.hashedPassword);

    if (!isMatch) {
      res.status(401).json({ error: "incorrect email or password" });
      return;
    }

    const accessToken = makeJWT(user.id, 3600, config.api.jwtSecret); // 1 hour
    const refreshToken = makeRefreshToken();
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days

    await createRefreshToken(refreshToken, user.id, expiresAt);

    res.status(200).json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      token: accessToken,
      refreshToken,
      isChirpyRed: user.isChirpyRed,
    });

  } catch (err) {
    next(err);
  }
});

// Refresh access token
app.post("/api/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req);

    const refresh = await getRefreshToken(token);

    if (!refresh) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    if (refresh.revokedAt) {
      res.status(401).json({ error: "Refresh token revoked" });
      return;
    }

    if (refresh.expiresAt < new Date()) {
      res.status(401).json({ error: "Refresh token expired" });
      return;
    }

    const newAccessToken = makeJWT(refresh.userId, 3600, config.api.jwtSecret);

    res.status(200).json({
      token: newAccessToken,
    });

  } catch (err) {
    next(err);
  }
});

// Revoke refresh token
app.post("/api/revoke", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getBearerToken(req);
    await revokeRefreshToken(token);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Polka webhook - upgrade to Chirpy Red
// POST /api/polka/webhooks - Polka payment events (protected by API key)
app.post("/api/polka/webhooks", async (req: Request, res: Response, next: NextFunction) => {
  // Check API key FIRST - before any processing
  try {
    const apiKey = getAPIKey(req);
    if (apiKey !== config.api.polkaKey) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }
  } catch (err) {
    res.status(401).json({ error: "Missing or invalid API key" });
    return;
  }

  // Now process the webhook (no need for try/catch here unless DB fails)
  const body = req.body as { event?: string; data?: { userId?: string } };

  if (!body || !body.event || body.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  if (!body.data || !body.data.userId) {
    res.status(204).send();
    return;
  }

  const updated = await upgradeToChirpyRed(body.data.userId);

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(204).send();
});


// Protected: Create chirp
app.post("/api/chirps", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as { body?: string };

    if (!body || typeof body.body !== "string") {
      throw new BadRequestError("Invalid or missing body");
    }

    const chirpText = body.body.trim();

    if (chirpText.length > 140) {
      throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const profaneWords = ["kerfuffle", "sharbert", "fornax"];
    let cleanedBody = chirpText;
    profaneWords.forEach((bad) => {
      const regex = new RegExp(`\\b${bad}\\b`, "gi");
      cleanedBody = cleanedBody.replace(regex, "****");
    });

    const newChirp: NewChirp = {
      body: cleanedBody,
      userId: req.userId!,
    };

    const created = await createChirp(newChirp);

    if (!created) {
      throw new Error("Failed to create chirp");
    }

    res.status(201).json({
      id: created.id,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      body: created.body,
      userId: created.userId,
    });

  } catch (err) {
    next(err);
  }
});

// Get all chirps
// GET /api/chirps - get all chirps, optionally filtered by authorId
// GET /api/chirps - get all chirps, optionally sorted by created_at
app.get("/api/chirps", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sortQuery = req.query.sort;

    let sortOrder = asc(chirps.createdAt); // default: asc

    if (typeof sortQuery === "string") {
      if (sortQuery.toLowerCase() === "desc") {
        sortOrder = desc(chirps.createdAt);
      } else if (sortQuery.toLowerCase() === "asc") {
        sortOrder = asc(chirps.createdAt);
      }
      // ignore invalid values - stick with default asc
    }

    const chirpsList = await db
      .select()
      .from(chirps)
      .orderBy(sortOrder);

    const response = chirpsList.map((chirp) => ({
      id: chirp.id,
      createdAt: chirp.createdAt.toISOString(),
      updatedAt: chirp.updatedAt.toISOString(),
      body: chirp.body,
      userId: chirp.userId,
    }));

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});


// Get single chirp
app.get("/api/chirps/:chirpId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chirpId = req.params.chirpId as string;

    if (!chirpId || chirpId.length !== 36) {
      throw new BadRequestError("Invalid chirp ID format");
    }

    const chirp = await getChirpById(chirpId);

    if (!chirp) {
      throw new NotFoundError("Chirp not found");
    }

    res.status(200).json({
      id: chirp.id,
      createdAt: chirp.createdAt.toISOString(),
      updatedAt: chirp.updatedAt.toISOString(),
      body: chirp.body,
      userId: chirp.userId,
    });

  } catch (err) {
    next(err);
  }
});

// Delete chirp (only by owner)
app.delete("/api/chirps/:chirpId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chirpId = req.params.chirpId as string;

    if (!chirpId || chirpId.length !== 36) {
      throw new BadRequestError("Invalid chirp ID format");
    }

    const [chirp] = await db
      .select()
      .from(chirps)
      .where(eq(chirps.id, chirpId))
      .limit(1);

    if (!chirp) {
      throw new NotFoundError("Chirp not found");
    }

    if (chirp.userId !== req.userId) {
      throw new ForbiddenError("You are not authorized to delete this chirp");
    }

    await db.delete(chirps).where(eq(chirps.id, chirpId));

    res.status(204).send();

  } catch (err) {
    next(err);
  }
});

// Static files
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

// Global error handler (last)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err);

  if (err instanceof BadRequestError ||
      err instanceof UnauthorizedError ||
      err instanceof ForbiddenError ||
      err instanceof NotFoundError) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({
      error: "Something went wrong on our end"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
