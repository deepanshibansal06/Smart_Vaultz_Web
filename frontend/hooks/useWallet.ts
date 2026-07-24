import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";

export function useWallet() {
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ["walletBalance"],
    queryFn: userService.getWalletBalance,
    staleTime: 1000 * 60,
  });

  const addMoneyMutation = useMutation({
    mutationFn: userService.addWalletMoney,
    onSuccess: (data) => {
      queryClient.setQueryData(["walletBalance"], data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return {
    balance: walletQuery.data?.balance ?? 0,
    isLoading: walletQuery.isLoading,
    refetch: walletQuery.refetch,
    addMoney: addMoneyMutation.mutateAsync,
    isAdding: addMoneyMutation.isPending,
  };
}
