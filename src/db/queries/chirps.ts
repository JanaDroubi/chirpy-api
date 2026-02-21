import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { asc } from "drizzle-orm";
import { eq } from "drizzle-orm";

export async function getChirpById(id: string) {
  const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, id))
    .limit(1);

  return result || null; // return null if not found
}
export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
  return result;
}

export async function getAllChirps() {
  return await db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt));
}
