import { NextRequest, NextResponse } from "next/server";
import { RecipeService } from "@/services/RecipeService";
import { requireAuth } from "@/lib/authMiddleware";

const recipeService = new RecipeService();

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const author = req.nextUrl.searchParams.get("author");
    let result;

    if (id) {
      result = await recipeService.getRecipeById(id);
    } else if (author) {
      result = await recipeService.getRecipesByAuthor(author);
    } else {
      result = await recipeService.getRecipes();
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET recipes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication for creating recipes
    const authResult = requireAuth(req);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const data = await req.json();

    // Automatically set the author to the authenticated user
    const recipeData = {
      ...data,
      author: authResult.userId,
    };

    const result = await recipeService.createRecipe(recipeData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST recipes error:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Require authentication for updating recipes
    const authResult = requireAuth(req);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing recipe id" }, { status: 400 });
    }

    const data = await req.json();

    // Optional: Check if user owns the recipe before allowing update
    // const existingRecipe = await recipeService.getRecipeById(id);
    // if (existingRecipe.author.toString() !== authResult.userId) {
    //   return NextResponse.json(
    //     { error: "You can only update your own recipes" },
    //     { status: 403 }
    //   );
    // }

    const result = await recipeService.updateRecipe(id, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT recipes error:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Require authentication for deleting recipes
    const authResult = requireAuth(req);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing recipe id" }, { status: 400 });
    }

    // Optional: Check if user owns the recipe before allowing deletion
    // const existingRecipe = await recipeService.getRecipeById(id);
    // if (existingRecipe.author.toString() !== authResult.userId) {
    //   return NextResponse.json(
    //     { error: "You can only delete your own recipes" },
    //     { status: 403 }
    //   );
    // }

    const result = await recipeService.deleteRecipe(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE recipes error:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
