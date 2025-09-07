import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { UserService } from "@/services/UserService";

// GET /api/auth/me - Get current user
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userService = new UserService();
    const userData = await userService.getUser(user.userId);

    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData._id.toString(),
        email: userData.email,
        name: userData.name,
        profilePicture: userData.profilePicture,
        avatar: userData.avatar,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
