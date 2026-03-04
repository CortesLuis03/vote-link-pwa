import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCampaignRequest, type UpdateCampaignRequest } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useCampaigns() {
  return useQuery({
    queryKey: [api.campaigns.list.path],
    queryFn: async () => {
      const res = await apiRequest("GET", api.campaigns.list.path);
      return api.campaigns.list.responses[200].parse(await res.json());
    },
  });
}

export function useCampaign(id: number) {
  return useQuery({
    queryKey: [api.campaigns.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.campaigns.get.path, { id });
      const res = await apiRequest("GET", url);
      return api.campaigns.get.responses[200].parse(await res.json());
    },
  });
}

export function useCampaignByLink(uniqueLink: string) {
  return useQuery({
    queryKey: [api.campaigns.getByLink.path, uniqueLink],
    queryFn: async () => {
      const url = buildUrl(api.campaigns.getByLink.path, { uniqueLink });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo obtener la campaña por el enlace");
      return api.campaigns.getByLink.responses[200].parse(await res.json());
    },
    retry: false
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCampaignRequest) => {
      const res = await apiRequest(api.campaigns.create.method, api.campaigns.create.path, data);
      return api.campaigns.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateCampaignRequest) => {
      const url = buildUrl(api.campaigns.update.path, { id });
      const res = await apiRequest(api.campaigns.update.method, url, updates);
      return api.campaigns.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.campaigns.get.path, variables.id] });
    },
  });
}

export function useCampaignResults(id: number) {
  return useQuery({
    queryKey: [api.campaigns.getResults.path, id],
    queryFn: async () => {
      const url = buildUrl(api.campaigns.getResults.path, { id });
      const res = await apiRequest("GET", url);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return api.campaigns.getResults.responses[200].parse(json);
      } catch (e) {
        console.error("[Hook] Failed to parse JSON. Response was:", text.substring(0, 100));
        throw new Error("El servidor no devolvió un formato válido de datos (JSON)");
      }
    },
    refetchInterval: 10000, // optionally auto-refresh every 5 seconds
  });
}
