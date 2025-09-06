// Client-side authentication utilities

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export class AuthUtils {
  private static readonly TOKEN_KEY = "token";
  private static readonly USER_KEY = "user";

  // Token management
  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  // User data management
  static setUser(user: AuthUser): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): AuthUser | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  static removeUser(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // Combined operations
  static login(user: AuthUser, token: string): void {
    this.setUser(user);
    this.setToken(token);

    // Dispatch custom event to notify components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("authStateChange"));
    }
  }

  static logout(): void {
    this.removeUser();
    this.removeToken();

    // Dispatch custom event to notify components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("authStateChange"));
    }
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Get authorization header for API requests
  static getAuthHeader(): { Authorization: string } | Record<string, never> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
