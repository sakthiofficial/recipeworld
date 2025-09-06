// Utility function to get cuisine-based background images
export const getCuisineBackground = (cuisine: string): string => {
  const cuisineBackgrounds: { [key: string]: string } = {
    // Asian Cuisines
    Chinese: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
    Japanese: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)",
    Korean: "linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)",
    Thai: "linear-gradient(135deg, #85FFBD 0%, #FFFB7D 100%)",
    Vietnamese: "linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)",
    Indian: "linear-gradient(135deg, #FA709A 0%, #FEE140 100%)",

    // European Cuisines
    Italian: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FFE66D 100%)",
    French: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    Spanish: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    Greek: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    German: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    British: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",

    // American Cuisines
    American: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
    Mexican: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    Brazilian: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",

    // Middle Eastern & African
    "Middle Eastern": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    Moroccan: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    Lebanese: "linear-gradient(135deg, #85ffbd 0%, #fffb7d 100%)",
    Turkish: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",

    // Others
    Fusion: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    Mediterranean: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    Caribbean: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    African: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",

    // Default fallback
    default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  return cuisineBackgrounds[cuisine] || cuisineBackgrounds["default"];
};

// Utility function to get cuisine emoji
export const getCuisineEmoji = (cuisine: string): string => {
  const cuisineEmojis: { [key: string]: string } = {
    Chinese: "🥢",
    Japanese: "🍱",
    Korean: "🍜",
    Thai: "🌶️",
    Vietnamese: "🍲",
    Indian: "🍛",
    Italian: "🍝",
    French: "🥐",
    Spanish: "🥘",
    Greek: "🫒",
    German: "🥨",
    British: "☕",
    American: "🍔",
    Mexican: "🌮",
    Brazilian: "🥭",
    "Middle Eastern": "🧆",
    Moroccan: "🍖",
    Lebanese: "🥙",
    Turkish: "🥙",
    Fusion: "🌟",
    Mediterranean: "🫒",
    Caribbean: "🥥",
    African: "🍠",
    default: "🍽️",
  };

  return cuisineEmojis[cuisine] || cuisineEmojis["default"];
};

// Main function to get recipe image or cuisine background
export const getRecipeImageOrBackground = (
  recipe: { image?: string; cuisine?: string },
  showImage: boolean = true
): {
  hasImage: boolean;
  imageUrl?: string;
  background?: string;
  emoji?: string;
  cuisine?: string;
} => {
  if (showImage && recipe.image) {
    return {
      hasImage: true,
      imageUrl: recipe.image,
    };
  }

  const cuisine = recipe.cuisine || "default";
  return {
    hasImage: false,
    background: getCuisineBackground(cuisine),
    emoji: getCuisineEmoji(cuisine),
    cuisine: cuisine,
  };
};
