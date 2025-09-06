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

    // Get followers list from localStorage-style approach for now
    // In a real app, you'd store this in the database
    const user = await User.findById(id)
      .select("name email followers")
      .populate("followers");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mock followers data - in a real app, you'd have a followers collection

    return NextResponse.json({
      followers: user?.followers,
      count: user?.followers.length,
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
