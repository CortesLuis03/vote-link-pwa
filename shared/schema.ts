import { pgTable, text, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default('active'), // active, inactive
  uniqueLink: text("unique_link").notNull().unique(),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  voterIdentification: text("voter_identification").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => {
  return [
    uniqueIndex("unique_vote_per_campaign").on(t.campaignId, t.voterIdentification)
  ];
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});


export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true });
export const insertCandidateSchema = createInsertSchema(candidates).omit({ id: true });
export const insertVoteSchema = createInsertSchema(votes).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// API Contract Types
export type CreateCampaignRequest = InsertCampaign;
export type UpdateCampaignRequest = Partial<InsertCampaign>;
export type CreateCandidateRequest = InsertCandidate;
export type SubmitVoteRequest = InsertVote;
export type LoginRequest = z.infer<typeof insertUserSchema>;



