import { useState } from "react";
import { useSession } from "@/components/SessionProvider";
import {
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
} from "@/features/auth/authApi";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  avatar?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const { user, loading, refetch } = useSession();
  const [loginMutation] = useLoginMutation();
  const [signupMutation] = useSignupMutation();
  const [logoutMutation] = useLogoutMutation();
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setError(null);
      const result = await loginMutation(credentials).unwrap();
      if (!result.success) {
        throw new Error(result.message);
      }
      // Immediately refetch to update the session state
      refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    }
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      setError(null);
      const result = await signupMutation(userData).unwrap();
      if (!result.success) {
        throw new Error(result.message);
      }
      // Immediately refetch to update the session state
      refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await logoutMutation().unwrap();
      // Immediately refetch to update the session state
      refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      // Even if logout fails, clear the session
      refetch();
      throw err;
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    signup,
    logout,
    error,
  };
}
