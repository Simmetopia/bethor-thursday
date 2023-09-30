import { blob, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  sub: text("sub").notNull(),
  givenName: text("given_name"),
  familyName: text("family_name"),
  email: text("email"),
  // other user attributes
});

export const session = sqliteTable("user_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  activeExpires: blob("active_expires", {
    mode: "bigint"
  }).notNull(),
  idleExpires: blob("idle_expires", {
    mode: "bigint"
  }).notNull()
});

export const key = sqliteTable("user_key", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  hashedPassword: text("hashed_password")
});
export const burger_day = sqliteTable("todos", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  user_id: text("user_id").references(() => user.id).notNull(),
  day: integer("timestamp", { mode: "number" }).notNull(),
});

export const burger_day_user = sqliteTable("burger_day_user", {
  user_id: text("user_id").references(() => user.id).notNull(),
  burger_day_id: integer("burger_day_id", { mode: "number" }).references(() => burger_day.id).notNull(),
  payed: integer("payed", { mode: "boolean" }).notNull().default(false),
  special_orders: text("special_orders"),
}, (table) => {
  return {
    pk: primaryKey(table.user_id, table.burger_day_id),
  }
});

