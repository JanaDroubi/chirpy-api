import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";
import { config } from "../config.js";   // ← changed here

const conn = postgres(config.db.url);     // ← changed here
export const db = drizzle(conn, { schema });
