import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/UserService";

const userService = new UserService();

export async function GET(req: NextRequest) {
  // Example: get user info
  const userId = req.nextUrl.searchParams.get("userId") || "";
  const result = await userService.getUser(userId);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  // Example: follow user
  const result = await userService.followUser(data.userId, data.targetId);
  return NextResponse.json(result);
}

// Add more handlers (PUT, DELETE) as needed
