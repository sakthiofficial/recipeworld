import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/AuthService";

const authService = new AuthService();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await authService.login(data);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 401 });
    }
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    console.log("Signup request received");
    const data = await req.json();
    const result = await authService.signup(data);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      console.log("Signup failed:", result);
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Auth PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Add logout endpoint
export async function DELETE() {
  try {
    // For JWT-based auth, logout is typically handled client-side
    // by removing the token from localStorage/cookies
    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
