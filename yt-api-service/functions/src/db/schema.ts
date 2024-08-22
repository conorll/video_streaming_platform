// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const users = pgTable("users", {
  id: varchar("id", { length: 50 }).primaryKey(),
  email: varchar("email", { length: 200 }).notNull(),
  photoUrl: varchar("photo_url", { length: 200 }).notNull(),
});

export const videos = pgTable("videos", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 5000 }).notNull(),
  userId: varchar("user_id", { length: 50 })
    .notNull()
    .references(() => users.id),
  resolution: integer("resolution"),
  processed: boolean("processed").default(false).notNull(),
});
