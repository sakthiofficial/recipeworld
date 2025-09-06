import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export function extractUserFromRequest(request: NextRequest): string | null {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    // Extract the token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return null;
    }

    // Verify and decode the token
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    return decoded.userId;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function requireAuth(
  request: NextRequest
): { userId: string } | { error: string; status: number } {
  const userId = extractUserFromRequest(request);

  if (!userId) {
    return {
      error: "Authentication required. Please provide a valid token.",
      status: 401,
    };
  }

  return { userId };
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
