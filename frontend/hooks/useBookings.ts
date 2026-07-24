import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";

export function useBookings() {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ["myBookings"],
    queryFn: bookingService.getMyBookings,
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 15, // Auto polling every 15s to update lock status
  });

  const bookMutation = useMutation({
    mutationFn: bookingService.bookVault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });

  const openMutation = useMutation({
    mutationFn: bookingService.openVault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: bookingService.closeVault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
    },
  });

  return {
    bookings: bookingsQuery.data || [],
    activeBooking: (bookingsQuery.data || [])[0] || null,
    isLoading: bookingsQuery.isLoading,
    isError: bookingsQuery.isError,
    refetch: bookingsQuery.refetch,
    bookVault: bookMutation.mutateAsync,
    isBooking: bookMutation.isPending,
    openVault: openMutation.mutateAsync,
    isOpenPending: openMutation.isPending,
    closeVault: closeMutation.mutateAsync,
    isClosePending: closeMutation.isPending,
  };
}
