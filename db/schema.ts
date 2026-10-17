import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const developerRole = pgEnum('developer_role', ['Kurucu', 'Admin', 'Moderatör', 'Developer', 'Tasarımcı'])
export const accountStatus = pgEnum('account_status', ['pending', 'active'])

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  identityId: text('identity_id').unique(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  status: accountStatus('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const developers = pgTable('developers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  role: developerRole('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const activations = pgTable('activations', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  codeHash: text('code_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const authLimits = pgTable('auth_limits', {
  key: text('key').primaryKey(),
  attempts: integer('attempts').notNull().default(1),
  resetsAt: timestamp('resets_at', { withTimezone: true }).notNull(),
})
