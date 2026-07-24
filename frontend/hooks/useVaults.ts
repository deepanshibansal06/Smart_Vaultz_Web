import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vaultService } from "@/services/vault.service";

export function useVaults(availableOnly: boolean = false) {
  const queryClient = useQueryClient();

  const vaultsQuery = useQuery({
    queryKey: ["vaults", availableOnly],
    queryFn: () => vaultService.getVaults(availableOnly),
    staleTime: 1000 * 30,
  });

  const createVaultMutation = useMutation({
    mutationFn: vaultService.createVault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });

  const updateVaultMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof vaultService.updateVault>[1] }) =>
      vaultService.updateVault(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });

  const deleteVaultMutation = useMutation({
    mutationFn: vaultService.deleteVault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });

  return {
    vaults: vaultsQuery.data || [],
    isLoading: vaultsQuery.isLoading,
    isError: vaultsQuery.isError,
    refetch: vaultsQuery.refetch,
    createVault: createVaultMutation.mutateAsync,
    isCreating: createVaultMutation.isPending,
    updateVault: updateVaultMutation.mutateAsync,
    isUpdating: updateVaultMutation.isPending,
    deleteVault: deleteVaultMutation.mutateAsync,
    isDeleting: deleteVaultMutation.isPending,
  };
}
