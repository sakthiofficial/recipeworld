'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Grid, List, ChevronDown, X, Clock, Users, Star, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { getRecipeImageOrBackground } from '@/utils/recipeImageUtils';

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

interface SearchSuggestion {
  suggestion: string;
  type: 'tag' | 'cuisine' | 'ingredient';
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

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'All Categories',
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Salads',
    'Soups'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const performSearch = useCallback(async (query: string, pageNum: number = 1) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: pageNum.toString(),
        limit: '12',
        sort: sortBy,
        ...(category && category !== 'All Categories' && { category })
      });

      const response = await fetch(`/api/search?${params}`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setResults(data);
        setSuggestions(data.data.suggestions);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, category]);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query, 1);
    }
  }, [searchParams, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams({
      q: searchQuery,
      ...(sortBy !== 'relevance' && { sort: sortBy }),
      ...(category && category !== 'All Categories' && { category })
    });

    router.push(`/search?${params}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    const params = new URLSearchParams({
      q: suggestion,
      ...(sortBy !== 'relevance' && { sort: sortBy }),
      ...(category && category !== 'All Categories' && { category })
    });
    router.push(`/search?${params}`);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    if (searchQuery) {
      performSearch(searchQuery, 1);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    if (searchQuery) {
      performSearch(searchQuery, 1);
    }
  };

  const loadMore = () => {
    if (results?.data.pagination.hasNext) {
      performSearch(searchQuery, page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search recipes, ingredients, cuisines..."
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && searchQuery && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion.suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                  >
                    <Search className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">{suggestion.suggestion}</span>
                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                      {suggestion.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Filters and Controls */}
          {results && (
            <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
              <div className="flex items-center space-x-4">
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={category || 'All Categories'}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort Filter */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Results Count */}
                <span className="text-sm text-gray-600">
                  {results.data.pagination.total} results
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !results && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {results && results.data.recipes.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}

        {results && results.data.recipes.length > 0 && (
          <>
            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Search results for &ldquo;{results.data.query}&rdquo;
              </h2>
              <p className="text-gray-600 mt-1">
                Found {results.data.pagination.total} recipes
              </p>
            </div>

            {/* Recipe Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.data.recipes.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {results.data.recipes.map((recipe) => (
                  <RecipeListItem key={recipe._id} recipe={recipe} />
                ))}
              </div>
            )}

            {/* Load More */}
            {results.data.pagination.hasNext && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Recipe Card Component
function RecipeCard({ recipe }: { recipe: Recipe }) {
  const imageData = getRecipeImageOrBackground(recipe, true);
  
  return (
    <Link href={`/recipes/${recipe._id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="aspect-video bg-gray-200 overflow-hidden relative">
          {imageData.hasImage ? (
            <Image
              src={recipe.image || '/api/placeholder/400/300'}
              alt={recipe.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center text-white font-medium group-hover:scale-105 transition-transform duration-200"
              style={{ background: imageData.background }}
            >
              <span className="text-4xl mb-2">{imageData.emoji}</span>
              <span className="text-lg text-center">
                {imageData.cuisine}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {recipe.prepTime + recipe.cookTime}m
              </span>
              <span className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {recipe.servings}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-400" />
                {recipe.averageRating?.toFixed(1) || 'N/A'}
              </span>
              <span className="flex items-center">
                <Heart className="h-3 w-3 mr-1 text-red-400" />
                {recipe.likesCount || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{recipe.cuisine}</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Recipe List Item Component
function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const imageData = getRecipeImageOrBackground(recipe, true);
  
  return (
    <Link href={`/recipes/${recipe._id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex space-x-4">
        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
          {imageData.hasImage ? (
            <Image
              src={recipe.image || '/api/placeholder/150/150'}
              alt={recipe.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center text-white text-xs font-medium group-hover:scale-105 transition-transform duration-200"
              style={{ background: imageData.background }}
            >
              <span className="text-lg mb-1">{imageData.emoji}</span>
              <span className="text-[10px] text-center leading-tight px-1">
                {imageData.cuisine}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{recipe.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{recipe.description}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {recipe.prepTime + recipe.cookTime}m
              </span>
              <span className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {recipe.servings}
              </span>
              <span>{recipe.cuisine}</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {recipe.difficulty}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-400" />
                {recipe.averageRating?.toFixed(1) || 'N/A'}
              </span>
              <span className="flex items-center">
                <Heart className="h-3 w-3 mr-1 text-red-400" />
                {recipe.likesCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
