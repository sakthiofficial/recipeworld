import { NextRequest, NextResponse } from "next/server";
import { CookbookService } from "@/services/CookbookService";

const cookbookService = new CookbookService();

export async function GET(req: NextRequest) {
  // Example: get cookbooks for user
  const userId = req.nextUrl.searchParams.get("userId") || "";
  const result = await cookbookService.getCookbooks(userId);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  // Example: add recipe to cookbook
  const result = await cookbookService.addRecipeToCookbook(
    data.cookbookId,
    data.recipeId
  );
  return NextResponse.json(result);
}

// Add more handlers (DELETE) as needed
