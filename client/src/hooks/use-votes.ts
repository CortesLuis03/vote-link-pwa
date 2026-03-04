import { useMutation } from "@tanstack/react-query";
import { api, type SubmitVoteRequest } from "@shared/routes";

export function useSubmitVote() {
  return useMutation({
    mutationFn: async (data: SubmitVoteRequest) => {
      const res = await fetch(api.votes.submit.path, {
        method: api.votes.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          // Backend uniqueness constraint violation usually comes here
          throw new Error("Ya has votado en esta campaña o has proporcionado datos inválidos.");
        }
        throw new Error("No se pudo emitir el voto. Por favor, inténtalo de nuevo.");
      }
      return api.votes.submit.responses[201].parse(await res.json());
    },
  });
}
