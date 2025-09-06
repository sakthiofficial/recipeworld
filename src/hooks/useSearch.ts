import { useState, useCallback } from "react";

interface SearchSuggestion {
  suggestion: string;
  type: "tag" | "cuisine" | "ingredient";
}

interface Recipe {
  _id: string;
  title: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  category: string;
  tags: string[];
  averageRating: number;
  likesCount: number;
  createdAt: string;
  author: {
    name: string;
    avatar?: string;
  };
  relevanceScore: number;
}

interface SearchResponse {
  success: boolean;
  data: {
    recipes: Recipe[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    query: string;
    suggestions: SearchSuggestion[];
  };
}

interface UseSearchOptions {
  limit?: number;
  sort?: string;
  category?: string;
}

export function useSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string, page: number = 1, options: UseSearchOptions = {}) => {
      if (!query.trim()) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          page: page.toString(),
          limit: (options.limit || 12).toString(),
          ...(options.sort && { sort: options.sort }),
          ...(options.category && { category: options.category }),
        });

        const response = await fetch(`/api/search?${params}`);
        const data: SearchResponse = await response.json();

        if (data.success) {
          setResults(data);
          setSuggestions(data.data.suggestions);
        } else {
          setError("Search failed");
        }
      } catch (err) {
        setError("Network error occurred");
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=5`
      );
      const data: SearchResponse = await response.json();

      if (data.success) {
        setSuggestions(data.data.suggestions.slice(0, 8));
        return data.data.suggestions.slice(0, 8);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    }
    return [];
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    search,
    getSuggestions,
    clearResults,
    isLoading,
    results,
    suggestions,
    error,
  };
}

export type { SearchSuggestion, Recipe, SearchResponse };
