'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { RecipeCard } from '@/components/RecipeCard';
import { Navbar } from '@/components/Navbar';
import { useGetRecipesQuery } from '@/features/recipes/recipeApi';

interface Recipe {
  id: string;
  _id?: string;
  title: string;
  description: string;
  image?: string;
  cookingTime: number;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  cuisine: string;
  category?: string;
  tags?: string[];
  averageRating?: number;
  likes: number;
  likesCount?: number;
  createdAt?: string;
  author: {
    name: string;
    avatar?: string;
  };
}

const ITEMS_PER_PAGE = 12;
const CUISINES = [
  'All', 'Italian', 'Chinese', 'Indian', 'Mexican', 'Thai', 'Japanese', 'French', 
  'Mediterranean', 'American', 'Korean', 'Greek', 'Spanish', 'Turkish', 'Vietnamese'
];
const CATEGORIES = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Snack', 'Beverage', 'Soup', 'Salad'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'quickest', label: 'Quickest to Make' },
  { value: 'title', label: 'A-Z' },
  { value: 'regional', label: 'Regional Preference' }
];

// Map regions to preferred cuisines
const REGION_CUISINE_MAP: { [key: string]: string[] } = {
  'IN': ['Indian', 'Asian'], // India
  'US': ['American', 'Mexican', 'Italian'], // United States
  'GB': ['British', 'European'], // United Kingdom
  'CA': ['American', 'French'], // Canada
  'AU': ['Australian', 'Asian'], // Australia
  'FR': ['French', 'European'], // France
  'DE': ['German', 'European'], // Germany
  'IT': ['Italian', 'Mediterranean'], // Italy
  'ES': ['Spanish', 'Mediterranean'], // Spain
  'MX': ['Mexican', 'American'], // Mexico
  'BR': ['Brazilian', 'American'], // Brazil
  'JP': ['Japanese', 'Asian'], // Japan
  'KR': ['Korean', 'Asian'], // South Korea
  'CN': ['Chinese', 'Asian'], // China
  'TH': ['Thai', 'Asian'], // Thailand
  'VN': ['Vietnamese', 'Asian'], // Vietnam
  'TR': ['Turkish', 'Mediterranean'], // Turkey
  'GR': ['Greek', 'Mediterranean'], // Greece
  'EG': ['Middle Eastern'], // Egypt
  'MA': ['Moroccan', 'Middle Eastern'], // Morocco
  'LB': ['Lebanese', 'Middle Eastern'], // Lebanon
};

// Function to get user's region
const getUserRegion = (): string => {
  if (typeof window !== 'undefined') {
    // Try to get region from browser locale
 
    
    // Fallback to timezone-based detection
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) return 'IN';
      if (timezone.includes('America/New_York') || timezone.includes('America/Los_Angeles')) return 'US';
      if (timezone.includes('Europe/London')) return 'GB';
      if (timezone.includes('Europe/Paris')) return 'FR';
      if (timezone.includes('Europe/Berlin')) return 'DE';
      if (timezone.includes('Europe/Rome')) return 'IT';
      if (timezone.includes('Europe/Madrid')) return 'ES';
      if (timezone.includes('Asia/Tokyo')) return 'JP';
      if (timezone.includes('Asia/Seoul')) return 'KR';
      if (timezone.includes('Asia/Shanghai')) return 'CN';
      if (timezone.includes('Asia/Bangkok')) return 'TH';
      if (timezone.includes('Australia/')) return 'AU';
    } catch {
      console.log('Could not detect timezone');
         const locale = navigator.language || navigator.languages?.[0];
    
    if (locale) {
      const region = locale.split('-')[1]; // e.g., 'en-US' -> 'US'
      return region?.toUpperCase() || 'US';
    }
    }
  }
  return 'US'; // Default fallback
};

function RecipesPageContent() {
  const searchParams = useSearchParams();
  
  // Detect user's region
  const [userRegion, setUserRegion] = useState<string>('US');
  
  // URL parameter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'regional');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const { data: recipes = [], isLoading, error } = useGetRecipesQuery();

  // Detect user's region on component mount
  useEffect(() => {
    const region = getUserRegion();
    console.log(region,"region");
    
    setUserRegion(region);
  }, []);

  // Filter and search logic
  const filteredRecipes = useMemo(() => {
    // Mock recipes for fallback
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        title: 'Spicy Thai Green Curry',
        description: 'A vibrant and aromatic curry with coconut milk, fresh herbs, and vegetables',
        image: '/placeholder-recipe.jpg',
        cookingTime: 30,
        likes: 124,
        cuisine: 'Thai',
        category: 'Main Course',
        difficulty: 'Medium',
        averageRating: 4.5,
        tags: ['spicy', 'curry', 'vegetarian'],
        author: { name: 'Chef Maria', avatar: '/placeholder-avatar.jpg' }
      },
      {
        id: '2',
        title: 'Classic Italian Carbonara',
        description: 'Creamy pasta dish with eggs, cheese, pancetta, and black pepper',
        image: '/placeholder-recipe.jpg',
        cookingTime: 20,
        likes: 89,
        cuisine: 'Italian',
        category: 'Main Course',
        difficulty: 'Easy',
        averageRating: 4.8,
        tags: ['pasta', 'quick', 'classic'],
        author: { name: 'Giovanni', avatar: '/placeholder-avatar.jpg' }
      },
      {
        id: '3',
        title: 'Chicken Tikka Masala',
        description: 'Tender chicken in a rich, creamy tomato-based sauce with aromatic spices',
        image: '/placeholder-recipe.jpg',
        cookingTime: 45,
        likes: 156,
        cuisine: 'Indian',
        category: 'Main Course',
        difficulty: 'Hard',
        averageRating: 4.7,
        tags: ['chicken', 'spicy', 'curry'],
        author: { name: 'Chef Kumar', avatar: '/placeholder-avatar.jpg' }
      }
    ];

    let result = recipes.length > 0 ? recipes : mockRecipes;
    
    // Search filter
    if (debouncedSearchQuery) {
      result = result.filter(recipe =>
        recipe.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        recipe.cuisine?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        recipe.tags?.some((tag: string) => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      );
    }
    
    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(recipe => recipe.category === selectedCategory);
    }
    
    // Cuisine filter
    if (selectedCuisine !== 'All') {
      result = result.filter(recipe => recipe.cuisine.toLowerCase() === selectedCuisine);
    }
    
    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      result = result.filter(recipe => recipe.difficulty === selectedDifficulty);
    }
    
    // Sort - create a copy of the array before sorting to avoid mutating read-only arrays
    const sortedResult = [...result];
    switch (sortBy) {
      case 'newest':
        return sortedResult.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      case 'popular':
        return sortedResult.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'rating':
        return sortedResult.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      case 'cooking-time':
        return sortedResult.sort((a, b) => (a.cookingTime || 0) - (b.cookingTime || 0));
      case 'regional':
        // Sort by regional preference - prioritize cuisines from user's region
        const preferredCuisines = REGION_CUISINE_MAP[userRegion] || [];
        return sortedResult.sort((a, b) => {
          const aIsPreferred = preferredCuisines.includes(a.cuisine || '');
          const bIsPreferred = preferredCuisines.includes(b.cuisine || '');
          
          // If both are preferred or both are not preferred, sort by newest
          if (aIsPreferred === bIsPreferred) {
            return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
          }
          
          // Preferred cuisines come first
          return bIsPreferred ? 1 : -1;
        });
      default:
        return result;
    }
  }, [recipes, debouncedSearchQuery, selectedCategory, selectedCuisine, selectedDifficulty, sortBy, userRegion]);

  // Pagination
  const recipesPerPage = ITEMS_PER_PAGE;
  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedCuisine !== 'All' || selectedDifficulty !== 'All';
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * recipesPerPage,
    currentPage * recipesPerPage
  );

  // Clear all filters function
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCuisine('All');
    setSelectedDifficulty('All');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedCuisine !== 'All') params.set('cuisine', selectedCuisine);
    if (selectedDifficulty !== 'All') params.set('difficulty', selectedDifficulty);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/recipes';
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedCategory, selectedCuisine, selectedDifficulty, sortBy, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recipe Collection</h1>
            <p className="text-gray-600">Discover amazing recipes from around the world</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search recipes, ingredients, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {(selectedCategory !== 'All' || selectedCuisine !== 'All' || selectedDifficulty !== 'All') && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {[selectedCategory, selectedCuisine, selectedDifficulty].filter(f => f !== 'All').length}
                  </span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category === 'All' ? 'All Categories' : category + 's'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cuisine Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {CUISINES.map(cuisine => (
                      <option key={cuisine} value={cuisine.toLowerCase()}>
                        {cuisine === 'All' ? 'All Cuisines' : cuisine}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {DIFFICULTIES.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty === 'All' ? 'All Levels' : difficulty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory !== 'All' || selectedCuisine !== 'All' || selectedDifficulty !== 'All') && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedCuisine('All');
                      setSelectedDifficulty('All');
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {paginatedRecipes.length} of {filteredRecipes.length} recipes
              {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* Recipes Grid/List */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className={`bg-gray-200 ${viewMode === 'grid' ? 'h-48' : 'h-32'}`}></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">⚠️ Failed to load recipes</div>
              <p className="text-gray-600">Showing sample recipes instead</p>
            </div>
          )}

          {!isLoading && (
            <>
              {paginatedRecipes.length > 0 ? (
                <>
                  {/* Results */}
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {paginatedRecipes.map((recipe, index) => (
                      <div
                        key={recipe.id || recipe._id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <RecipeCard recipe={recipe} showImage={false} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center space-x-4">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </button>

                      <div className="flex items-center space-x-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg font-medium ${
                                currentPage === pageNum
                                  ? 'bg-green-500 text-white'
                                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    </div>
                  )}

                  {/* Page Info */}
                  {totalPages > 1 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No recipes found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {hasActiveFilters
                      ? "Try adjusting your filters or search terms to find more recipes."
                      : "Be the first to share a recipe with our community!"
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="px-6 py-3 border border-green-600 text-green-600 rounded-full hover:bg-green-50 transition-all duration-200"
                      >
                        Clear Filters
                      </button>
                    )}
                    <a
                      href="/upload"
                      className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 hover:scale-105"
                    >
                      Share Your Recipe
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipesPageContent />
    </Suspense>
  );
}
      