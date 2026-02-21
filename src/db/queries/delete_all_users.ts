import { db } from "../index.js";
import { users } from "../schema.js";  // ← added this

export async function deleteAllUsers() {
  await db.delete(users);
}
