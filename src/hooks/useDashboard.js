import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

// Fetch Links (Read)
export const useLinks = (filters) => {
  return useQuery({
    queryKey: ["links", filters],
    queryFn: () => client.post("/api/v1/links/filter", filters), // Make sure backend route matches
    refetchInterval: 5000, // POLL every 5s to check AI status updates
  });
};

// Create Link (Write)
export const useCreateLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => client.post("/api/v1/links", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["links"]); // Refresh list instantly
    },
  });
};

// Delete Link (Write + Optimistic Update)
export const useDeleteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId) => client.delete(`/api/v1/links/${linkId}`),

    onMutate: async (linkId) => {
      // Cancel syncs
      await queryClient.cancelQueries(["links"]);

      // Snapshot previous data
      const previousData = queryClient.getQueryData(["links"]);

      // Optimistically remove from UI
      queryClient.setQueryData(["links"], (old) => {
        if (!old) return old;
        return {
          ...old,
          links: old.links.filter((l) => l._id !== linkId),
        };
      });

      return { previousData };
    },

    onError: (err, linkId, context) => {
      // Rollback if server fails
      queryClient.setQueryData(["links"], context.previousData);
    },

    onSettled: () => {
      // Always refetch to be safe
      queryClient.invalidateQueries(["links"]);
    },
  });
};
