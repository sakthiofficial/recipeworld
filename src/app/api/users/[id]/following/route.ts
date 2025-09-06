import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";

interface JWTPayload {
  userId: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify the token
    try {
      jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret"
      ) as JWTPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get following list from localStorage-style approach for now
    const user = await User.findById(id)
      .select("name email avatar")
      .populate("following");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mock following data - in a real app, you'd have a following collection

    return NextResponse.json({
      following: user?.following,
      count: user?.following.length,
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
