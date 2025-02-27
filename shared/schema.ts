import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Custom transformers for proper type handling
const dateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
  return arg;
}, z.date());

const numberSchema = z.preprocess((arg) => {
  if (typeof arg === 'string') return Number(arg);
  return arg;
}, z.number().min(0));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isArtist: boolean("is_artist").notNull().default(false),
  walletAddress: text("wallet_address"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  date: timestamp("date").notNull(),
  venue: text("venue").notNull(),
  price: integer("price").notNull(),
  totalSupply: integer("total_supply").notNull(),
  remainingSupply: integer("remaining_supply").notNull(),
  artistId: integer("artist_id").notNull(),
  contractAddress: text("contract_address"),
  chainId: integer("chain_id").notNull(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  tokenId: integer("token_id").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    isArtist: true,
    walletAddress: true,
  });

export const insertEventSchema = createInsertSchema(events)
  .extend({
    date: dateSchema,
    price: numberSchema,
  })
  .pick({
    title: true,
    description: true,
    imageUrl: true,
    date: true,
    venue: true,
    price: true,
    totalSupply: true,
    remainingSupply: true,
    artistId: true,
    contractAddress: true,
    chainId: true,
  });

export const insertTicketSchema = createInsertSchema(tickets)
  .extend({
    purchaseDate: dateSchema,
  })
  .pick({
    eventId: true,
    userId: true,
    tokenId: true,
    purchaseDate: true,
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;