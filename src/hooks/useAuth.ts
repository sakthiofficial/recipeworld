import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AuthUtils, AuthUser } from "@/lib/authUtils";

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const [localUser, setLocalUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for local authentication
  useEffect(() => {
    const checkLocalAuth = () => {
      const user = AuthUtils.getUser();
      const token = AuthUtils.getToken();

      console.log("useAuth checkLocalAuth - user:", user);
      console.log("useAuth checkLocalAuth - token:", token);

      if (user && token) {
        setLocalUser(user);
      } else {
        setLocalUser(null);
      }

      // Set loading to false once we've checked both NextAuth and local auth
      if (status !== "loading") {
        setIsLoading(false);
      }
    };

    checkLocalAuth();

    // Listen for auth state changes
    const handleAuthChange = () => {
      checkLocalAuth();
    };

    window.addEventListener("authStateChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authStateChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [status]);

  // Update loading state based on NextAuth status
  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  const login = (user: AuthUser, token: string) => {
    AuthUtils.login(user, token);
    setLocalUser(user);
  };

  const logout = () => {
    AuthUtils.logout();
    setLocalUser(null);
  };

  // Determine final auth state - prioritize NextAuth session
  const user = session?.user
    ? {
        id: (session.user as { id?: string }).id || session.user.email || "",
        name: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || undefined,
      }
    : localUser;

  const isAuthenticated = !!(session?.user || localUser);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
