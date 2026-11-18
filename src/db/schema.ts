import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export * from "./auth-schema";

// Timestamps are strings on purpose: the Wallet web service compares `updated_at` and echoes
// `passesUpdatedSince` back to Apple, so the exact value from Postgres must round-trip.
const tz = (name: string) => timestamp(name, { withTimezone: true, mode: "string" });

// Loyalty-card customers. Admins (baristas) only exist in the auth `user` table.
export const clients = pgTable(
  "clients",
  {
    // Also the Apple Wallet serial number and what the QR encodes.
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    image: text("image"),
    // Keep the upper bound in sync with COFFEES_TO_EXCHANGE (src/lib/constants.ts).
    coffees: smallint("coffees").notNull().default(0),
    totalCoffees: integer("total_coffees").notNull().default(0),
    rewardsRedeemed: integer("rewards_redeemed").notNull().default(0),
    lastCoffeeAt: tz("last_coffee_at"),
    rewardEarnedAt: tz("reward_earned_at"),
    // added | removed | redeemed | restored | reset
    lastChange: text("last_change"),
    createdAt: tz("created_at").notNull().defaultNow(),
    updatedAt: tz("updated_at").notNull().defaultNow(),
  },
  (t) => [
    check("clients_coffees_range", sql`${t.coffees} between 0 and 9`),
    check(
      "clients_counters_nonneg",
      sql`${t.totalCoffees} >= 0 and ${t.rewardsRedeemed} >= 0`
    ),
    check(
      "clients_last_change_values",
      sql`${t.lastChange} is null or ${t.lastChange} in ('added','removed','redeemed','restored','reset')`
    ),
  ]
);

// Devices that installed a client's pass (PassKit web service).
export const walletRegistrations = pgTable(
  "wallet_registrations",
  {
    deviceLibraryId: text("device_library_id").notNull(),
    serialNumber: uuid("serial_number")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    pushToken: text("push_token").notNull(),
    createdAt: tz("created_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.deviceLibraryId, t.serialNumber] }),
    index("wallet_registrations_serial_idx").on(t.serialNumber),
  ]
);

export type Client = typeof clients.$inferSelect;
