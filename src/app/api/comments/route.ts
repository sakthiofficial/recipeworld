import { NextRequest, NextResponse } from "next/server";
import { CommentService } from "@/services/CommentService";

const commentService = new CommentService();

export async function GET(req: NextRequest) {
  // Example: get comments for recipe
  const recipeId = req.nextUrl.searchParams.get("recipeId") || "";
  const result = await commentService.getComments(recipeId);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  // Example: add comment
  const result = await commentService.addComment(data.recipeId, data);
  return NextResponse.json(result);
}

// Add more handlers (DELETE) as needed
