import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "relevance";

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    await client.connect();
    const db = client.db("ecipe-sharing-platform");
    const recipesCollection = db.collection("recipes");

    // Build search pipeline
    const pipeline: object[] = [];

    // Text search stage
    pipeline.push({
      $match: {
        $and: [
          {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
              { "ingredients.name": { $regex: query, $options: "i" } },
              { tags: { $in: [new RegExp(query, "i")] } },
              { cuisine: { $regex: query, $options: "i" } },
              { category: { $regex: query, $options: "i" } },
            ],
          },
          category ? { category: category } : {},
        ].filter((condition) => Object.keys(condition).length > 0),
      },
    });

    // Add user information
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "author",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Calculate relevance score
    pipeline.push({
      $addFields: {
        relevanceScore: {
          $add: [
            // Title match gets highest score
            {
              $cond: [
                {
                  $regexMatch: { input: "$title", regex: query, options: "i" },
                },
                10,
                0,
              ],
            },
            // Description match gets medium score
            {
              $cond: [
                {
                  $regexMatch: {
                    input: "$description",
                    regex: query,
                    options: "i",
                  },
                },
                5,
                0,
              ],
            },
            // Ingredient match gets medium score
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
            // Tag match gets lower score
            {
              $size: {
                $filter: {
                  input: "$tags",
                  cond: {
                    $regexMatch: {
                      input: "$$this",
                      regex: query,
                      options: "i",
                    },
                  },
                },
              },
            },
          ],
        },
      },
    });

    // Sort based on preference
    let sortStage: Record<string, number> = {};
    switch (sort) {
      case "newest":
        sortStage = { createdAt: -1 };
        break;
      case "oldest":
        sortStage = { createdAt: 1 };
        break;
      case "rating":
        sortStage = { averageRating: -1, createdAt: -1 };
        break;
      case "popular":
        sortStage = { likesCount: -1, createdAt: -1 };
        break;
      case "relevance":
      default:
        sortStage = { relevanceScore: -1, createdAt: -1 };
        break;
    }

    pipeline.push({ $sort: sortStage });

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await recipesCollection
      .aggregate(countPipeline)
      .toArray();
    const total = countResult[0]?.total || 0;

    // Add pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Project final fields
    pipeline.push({
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
      },
    });

    const recipes = await recipesCollection.aggregate(pipeline).toArray();

    // Get search suggestions
    const suggestions = await getSearchSuggestions(query, db);

    return NextResponse.json({
      success: true,
      data: {
        recipes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        query,
        suggestions,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search recipes" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

async function getSearchSuggestions(
  query: string,
  db: {
    collection: (name: string) => {
      aggregate: (pipeline: object[]) => { toArray: () => Promise<unknown[]> };
    };
  }
) {
  try {
    // Get popular tags that match the query
    const tagSuggestions = await db
      .collection("recipes")
      .aggregate([
        { $unwind: "$tags" },
        { $match: { tags: { $regex: query, $options: "i" } } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, suggestion: "$_id", type: "tag" } },
      ])
      .toArray();

    // Get popular cuisines that match the query
    const cuisineSuggestions = await db
      .collection("recipes")
      .aggregate([
        { $match: { cuisine: { $regex: query, $options: "i" } } },
        { $group: { _id: "$cuisine", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 },
        { $project: { _id: 0, suggestion: "$_id", type: "cuisine" } },
      ])
      .toArray();

    // Get popular ingredients that match the query
    const ingredientSuggestions = await db
      .collection("recipes")
      .aggregate([
        { $unwind: "$ingredients" },
        { $match: { "ingredients.name": { $regex: query, $options: "i" } } },
        { $group: { _id: "$ingredients.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, suggestion: "$_id", type: "ingredient" } },
      ])
      .toArray();

    return [...tagSuggestions, ...cuisineSuggestions, ...ingredientSuggestions];
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return [];
  }
}
