export * from "./schema";

import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const db = drizzle(connectionString, { schema });
export { historicalMatchesTable } from "./schema";
