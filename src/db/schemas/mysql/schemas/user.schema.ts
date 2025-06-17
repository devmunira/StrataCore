import {
  mysqlTable,
  varchar,
  int,
  mysqlEnum,
  timestamp,
} from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
export const UserRoles = mysqlEnum('users_roles', ['admin', 'user']);
export const UserStatus = mysqlEnum('users_status', ['active', 'inactive']);

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  roles: UserRoles.default('admin'),
  status: UserStatus.default('active'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export type User = typeof users.$inferSelect;

// Create Create user schema and schema type
export const CreateUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateUser = typeof users.$inferInsert;

// Create update user schema and schema type
export const UpdateUserSchema = CreateUserSchema.partial();
export type UpdateUser = Partial<typeof users.$inferInsert>;
