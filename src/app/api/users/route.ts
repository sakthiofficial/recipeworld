import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/UserService";
import { requireAuth } from "@/lib/auth";

const userService = new UserService();

export async function GET(req: NextRequest) {
  try {
    // Example: get user info
    const userId = req.nextUrl.searchParams.get("userId") || "";
    const result = await userService.getUser(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication for user actions
    const user = requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await req.json();
    // Example: follow user
    const result = await userService.followUser(user.userId, data.targetId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST users error:", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}
