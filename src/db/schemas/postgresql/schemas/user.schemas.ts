import { createInsertSchema } from 'drizzle-zod';
import { varchar, uuid, pgTable, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const UserRole = pgEnum('user_roles', ['admin', 'user']);
export const UserStatus = pgEnum('user_status', ['active', 'inactive']);

// Create UserSchema
export const userTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  email: varchar('email').notNull().unique(),
  password: varchar('password').notNull(),
  role: UserRole('role').default('user'),
  status: UserStatus('status').default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Create User Table Type
export const User = typeof userTable.$inferSelect;

// Create Create user schema and schema type
export const CreateUserSchema = createInsertSchema(userTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateUser = typeof userTable.$inferInsert;

// Create update user schema and schema type
export const UpdateUserSchema = CreateUserSchema.partial();
export type UpdateUser = Partial<typeof userTable.$inferInsert>;
