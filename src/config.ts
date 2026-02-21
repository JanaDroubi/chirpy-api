import dotenv from "dotenv";
dotenv.config({ path: ".env" });

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export type APIConfig = {
  fileserverHits: number;
  platform: string;          // ← new
  jwtSecret: string;     // ← new line
  polkaKey: string;      // ← new
};

export type DBConfig = {
  url: string;
  migrationConfig: {
    migrationsFolder: string;
  };
};

export type AppConfig = {
  api: APIConfig;
  db: DBConfig;
};

export const config: AppConfig = {
  api: {
    fileserverHits: 0,
    platform: envOrThrow("PLATFORM"),   // ← new
    jwtSecret: envOrThrow("JWT_SECRET"),   // ← new line  
    polkaKey: envOrThrow("POLKA_KEY"),   // ← new
},
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: {
      migrationsFolder: "./src/db/migrations",
    },
  },
};
