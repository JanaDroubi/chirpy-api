import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "../config.js";

export async function runMigrations() {
  const migrationClient = postgres(config.db.url, { max: 1 });
  const migrationDb = drizzle(migrationClient);

  console.log("Running database migrations...");
  await migrate(migrationDb, config.db.migrationConfig);
  console.log("Migrations complete.");

  // Important: close the single-use connection
  await migrationClient.end();
}
