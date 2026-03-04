import { z } from 'zod';
import { insertCampaignSchema, insertCandidateSchema, insertVoteSchema, campaigns, candidates, votes } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  campaigns: {
    list: {
      method: 'GET' as const,
      path: '/api/campaigns' as const,
      responses: {
        200: z.array(z.custom<typeof campaigns.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/campaigns/:id' as const,
      responses: {
        200: z.custom<typeof campaigns.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    getByLink: {
      method: 'GET' as const,
      path: '/api/campaigns/link/:uniqueLink' as const,
      responses: {
        200: z.custom<typeof campaigns.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/campaigns' as const,
      input: insertCampaignSchema,
      responses: {
        201: z.custom<typeof campaigns.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/campaigns/:id' as const,
      input: insertCampaignSchema.partial(),
      responses: {
        200: z.custom<typeof campaigns.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    getResults: {
      method: "GET" as const,
      path: "/api/results/campaign/:id" as const,
      responses: {
        200: z.array(z.object({
          candidateId: z.number(),
          candidateName: z.string(),
          voteCount: z.number(),
        })),
        404: errorSchemas.notFound,
      },
    },
  },
  candidates: {
    listByCampaign: {
      method: 'GET' as const,
      path: '/api/campaigns/:campaignId/candidates' as const,
      responses: {
        200: z.array(z.custom<typeof candidates.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/campaigns/:campaignId/candidates' as const,
      input: insertCandidateSchema.omit({ campaignId: true }), // Frontend doesn't need to send it in body, it's in URL
      responses: {
        201: z.custom<typeof candidates.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/campaigns/:campaignId/candidates/:id' as const,
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/campaigns/:campaignId/candidates/:id' as const,
      input: insertCandidateSchema.omit({ campaignId: true }).partial(),
      responses: {
        200: z.custom<typeof candidates.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  votes: {
    submit: {
      method: 'POST' as const,
      path: '/api/votes' as const,
      input: insertVoteSchema,
      responses: {
        201: z.custom<typeof votes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type CampaignResponse = z.infer<typeof api.campaigns.get.responses[200]>;
export type CandidateResponse = z.infer<typeof api.candidates.listByCampaign.responses[200]>[0];
export type VoteResponse = z.infer<typeof api.votes.submit.responses[201]>;

export { 
  type CreateCampaignRequest, 
  type UpdateCampaignRequest, 
  type CreateCandidateRequest, 
  type SubmitVoteRequest 
} from './schema';
