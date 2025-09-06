import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

interface Suggestion {
  suggestion: string;
  type: string;
}

interface Database {
  collection(name: string): {
    distinct(field: string, filter: object): Promise<string[]>;
    aggregate(pipeline: object[]): {
      toArray(): Promise<unknown[]>;
    };
  };
}

const client = new MongoClient(process.env.MONGODB_URI!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "6");

  if (!query || query.length < 2) {
    return NextResponse.json({
      success: true,
      data: { recipes: [], suggestions: [] },
    });
  }

  try {
    await client.connect();
    const db = client.db("ecipe-sharing-platform");
    const recipesCollection = db.collection("recipes");

    // Search pipeline for instant results
    const searchPipeline = [
      {
        $match: {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { "ingredients.name": { $regex: query, $options: "i" } },
            { tags: { $in: [new RegExp(query, "i")] } },
            { cuisine: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: {
          path: "$author",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              // Title match gets highest score
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$title",
                      regex: query,
                      options: "i",
                    },
                  },
                  10,
                  0,
                ],
              },
              // Cuisine match gets high score
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$cuisine",
                      regex: query,
                      options: "i",
                    },
                  },
                  8,
                  0,
                ],
              },
              // Ingredient match gets medium score
              {
                $multiply: [
                  {
                    $size: {
                      $filter: {
                        input: "$ingredients",
                        cond: {
                          $regexMatch: {
                            input: "$$this.name",
                            regex: query,
                            options: "i",
                          },
                        },
                      },
                    },
                  },
                  3,
                ],
              },
              // Description match gets lower score
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$description",
                      regex: query,
                      options: "i",
                    },
                  },
                  2,
                  0,
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { relevanceScore: -1, averageRating: -1, createdAt: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          image: 1,
          prepTime: 1,
          cookTime: 1,
          servings: 1,
          difficulty: 1,
          cuisine: 1,
          category: 1,
          tags: 1,
          averageRating: 1,
          likesCount: 1,
          createdAt: 1,
          "author.name": 1,
          "author.avatar": 1,
          relevanceScore: 1,
          matchedIngredients: {
            $filter: {
              input: "$ingredients",
              cond: {
                $regexMatch: {
                  input: "$$this.name",
                  regex: query,
                  options: "i",
                },
              },
            },
          },
        },
      },
    ];

    const recipes = await recipesCollection.aggregate(searchPipeline).toArray();

    // Get quick suggestions
    const suggestions = await getQuickSuggestions(query, db);

    return NextResponse.json({
      success: true,
      data: {
        recipes,
        suggestions,
        query,
      },
    });
  } catch (error) {
    console.error("Instant search error:", error);
    return NextResponse.json(
      { error: "Failed to perform instant search" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

async function getQuickSuggestions(query: string, db: Database) {
  try {
    const suggestions: Suggestion[] = [];

    // Get matching cuisines
    const cuisines = await db.collection("recipes").distinct("cuisine", {
      cuisine: { $regex: query, $options: "i" },
    });
    cuisines.slice(0, 3).forEach((cuisine: string) => {
      suggestions.push({ suggestion: cuisine, type: "cuisine" });
    });

    // Get matching tags
    const tags = await db
      .collection("recipes")
      .aggregate([
        { $unwind: "$tags" },
        { $match: { tags: { $regex: query, $options: "i" } } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ])
      .toArray();

    (tags as { _id: string; count: number }[]).forEach((tag) => {
      suggestions.push({ suggestion: tag._id, type: "tag" });
    });

    // Get matching ingredients
    const ingredients = await db
      .collection("recipes")
      .aggregate([
        { $unwind: "$ingredients" },
        { $match: { "ingredients.name": { $regex: query, $options: "i" } } },
        { $group: { _id: "$ingredients.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ])
      .toArray();

    (ingredients as { _id: string; count: number }[]).forEach((ingredient) => {
      suggestions.push({ suggestion: ingredient._id, type: "ingredient" });
    });

    return suggestions.slice(0, 6);
  } catch (error) {
    console.error("Error getting quick suggestions:", error);
    return [];
  }
}
