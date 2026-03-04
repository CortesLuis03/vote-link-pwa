import { db } from "./db";
import {
  campaigns,
  candidates,
  votes,
  users,
  type Campaign,
  type InsertCampaign,
  type Candidate,
  type InsertCandidate,
  type Vote,
  type InsertVote,
  type User,
  type InsertUser,
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignByLink(uniqueLink: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign>;
  
  getCandidatesByCampaign(campaignId: number): Promise<Candidate[]>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate>;
  deleteCandidate(id: number): Promise<void>;
  getCandidateVoteCount(candidateId: number): Promise<number>;
  
  submitVote(vote: InsertVote): Promise<Vote>;
  hasVoted(campaignId: number, voterIdentification: string): Promise<boolean>;
  getCampaignResults(campaignId: number): Promise<{ candidateId: number; candidateName: string; voteCount: number }[]>;

  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async getCampaignByLink(uniqueLink: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.uniqueLink, uniqueLink));
    return campaign;
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns)
      .values({
        ...insertCampaign,
        uniqueLink: insertCampaign.uniqueLink || crypto.randomBytes(6).toString('hex'), // Ensure unique link
      })
      .returning();
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign> {
    const [updated] = await db.update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, id))
      .returning();
    if (!updated) throw new Error("Campaña no encontrada");
    return updated;
  }

  async getCandidatesByCampaign(campaignId: number): Promise<Candidate[]> {
    return await db.select().from(candidates).where(eq(candidates.campaignId, campaignId));
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async updateCandidate(id: number, updates: Partial<InsertCandidate>): Promise<Candidate> {
    const [updated] = await db.update(candidates)
      .set(updates)
      .where(eq(candidates.id, id))
      .returning();
    if (!updated) throw new Error("Candidato no encontrado");
    return updated;
  }

  async deleteCandidate(id: number): Promise<void> {
    await db.delete(candidates).where(eq(candidates.id, id));
  }

  async getCandidateVoteCount(candidateId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`CAST(COUNT(${votes.id}) AS INTEGER)` })
      .from(votes)
      .where(eq(votes.candidateId, candidateId));
    return result?.count || 0;
  }

  async submitVote(vote: InsertVote): Promise<Vote> {
    const [newVote] = await db.insert(votes).values(vote).returning();
    return newVote;
  }

  async hasVoted(campaignId: number, voterIdentification: string): Promise<boolean> {
    const existingVotes = await db.select().from(votes).where(
      and(
        eq(votes.campaignId, campaignId),
        eq(votes.voterIdentification, voterIdentification)
      )
    );
    return existingVotes.length > 0;
  }

  async getCampaignResults(campaignId: number): Promise<{ candidateId: number; candidateName: string; voteCount: number }[]> {
    console.log(`[Storage] Querying results for campaign ID: ${campaignId}`);
    
    // Explicitly casting count to integer to avoid string issues with some PG drivers
    const results = await db
      .select({
        candidateId: candidates.id,
        candidateName: candidates.name,
        voteCount: sql<number>`CAST(COUNT(${votes.id}) AS INTEGER)`,
      })
      .from(candidates)
      .leftJoin(votes, eq(candidates.id, votes.candidateId))
      .where(eq(candidates.campaignId, campaignId))
      .groupBy(candidates.id, candidates.name);
    
    console.log(`[Storage] Foundation query returned ${results.length} rows`);
    return results;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
