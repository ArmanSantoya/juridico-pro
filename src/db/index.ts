/**
 * Cliente Drizzle para Supabase
 * Singleton pattern para evitar múltiples conexiones
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  max: 10, // Importante para serverless
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
