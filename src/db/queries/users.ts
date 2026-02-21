import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";


export async function createUser(user: NewUser) {
  try {
    console.log("[DB] Inserting user:", user);

    const [result] = await db
      .insert(users)
      .values(user)
      .onConflictDoNothing()
      .returning();

    console.log("[DB] Insert result:", result);
    return result;
  } catch (err) {
    console.error("[DB ERROR] Failed to insert user:", err);
    throw err;
  }
}

export async function upgradeToChirpyRed(userId: string) {
  const [result] = await db
    .update(users)
    .set({
      isChirpyRed: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return result || null;
}
