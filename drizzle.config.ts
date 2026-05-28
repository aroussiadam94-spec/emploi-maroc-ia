import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

const useTurso = connectionString.startsWith("libsql://") || connectionString.startsWith("https://") || !!process.env.DATABASE_AUTH_TOKEN;
const useSqlite = useTurso || connectionString.startsWith("./") || connectionString.endsWith(".db");

export default defineConfig({
  schema: useSqlite ? "./drizzle/sqlite-schema.ts" : "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: useSqlite ? "sqlite" : "mysql",
  ...(useTurso ? {
    driver: 'turso',
    dbCredentials: {
      url: connectionString,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    }
  } : {
    dbCredentials: {
      url: connectionString,
    }
  }),
});
