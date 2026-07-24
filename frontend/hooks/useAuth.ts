import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, setAuth, setUser, logout, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const profileQuery = useQuery({
    queryKey: ["me"],
    queryFn: userService.getMe,
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setUser(profileQuery.data);
    }
  }, [profileQuery.data, setUser]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Map return object to User format
      const userObj = {
        _id: "",
        name: data.name,
        email: data.email,
        role: data.role,
        walletBalance: 0,
        mpinSet: false,
      };
      setAuth(userObj, data.token);
      profileQuery.refetch();
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
  });

  const sendOtpMutation = useMutation({
    mutationFn: authService.sendOtp,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
  });

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    sendOtp: sendOtpMutation.mutateAsync,
    isSendingOtp: sendOtpMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    logout,
    refetchProfile: profileQuery.refetch,
  };
}
