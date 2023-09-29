import type { Config } from "drizzle-kit";



console.log("DATABASE_URL", process.env.DATABASE_URL);
console.log("DATABASE_AUTH_TOKEN", process.env.DATABASE_AUTH_TOKEN);

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
} satisfies Config;
