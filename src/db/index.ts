import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Connection pool for serverless (Next.js API routes)
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
