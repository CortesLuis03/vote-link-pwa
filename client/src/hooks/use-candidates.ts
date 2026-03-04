import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCandidateRequest } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useCandidates(campaignId: number | undefined) {
  return useQuery({
    queryKey: [api.candidates.listByCampaign.path, campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const url = buildUrl(api.candidates.listByCampaign.path, { campaignId });
      const res = await apiRequest("GET", url);
      return api.candidates.listByCampaign.responses[200].parse(await res.json());
    },
    enabled: !!campaignId,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaignId, data }: { campaignId: number; data: Omit<CreateCandidateRequest, 'campaignId'> }) => {
      const url = buildUrl(api.candidates.create.path, { campaignId });
      const res = await apiRequest(api.candidates.create.method, url, data);
      return api.candidates.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.candidates.listByCampaign.path, variables.campaignId] });
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaignId, id, data }: { campaignId: number; id: number; data: Partial<Omit<CreateCandidateRequest, 'campaignId'>> }) => {
      const url = buildUrl(api.candidates.update.path, { campaignId, id });
      const res = await apiRequest(api.candidates.update.method, url, data);
      return api.candidates.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.candidates.listByCampaign.path, variables.campaignId] });
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaignId, id }: { campaignId: number; id: number }) => {
      const url = buildUrl(api.candidates.delete.path, { campaignId, id });
      const res = await apiRequest(api.candidates.delete.method, url);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.candidates.listByCampaign.path, variables.campaignId] });
      // Also invalidate results since a candidate was removed
      queryClient.invalidateQueries({ queryKey: [api.campaigns.getResults.path, variables.campaignId] });
    },
  });
}
