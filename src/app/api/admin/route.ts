import { NextRequest, NextResponse } from "next/server";
import { AdminService } from "@/services/AdminService";

const adminService = new AdminService();

export async function GET() {
  try {
    return NextResponse.json({ message: "Admin endpoint" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  // Example: feature recipe
  const result = await adminService.featureRecipe(data.recipeId);
  return NextResponse.json(result);
}

// Add more handlers (DELETE) as needed
