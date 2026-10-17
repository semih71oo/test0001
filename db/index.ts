import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema.js'

const connection = process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL) : null

export function getDb() {
  if (!connection) {
    throw new Error('DATABASE_URL is not defined. Set a PostgreSQL or Cloudflare-compatible database URL before using the app data layer.')
  }

  return drizzle(connection, { schema })
}
