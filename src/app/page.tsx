'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { RecipeCard } from '@/components/RecipeCard';
import { InstantSearchDropdown } from '@/components/InstantSearchDropdown';
import { ClientOnly } from '@/components/ClientOnly';
import { useGetRecipesQuery } from '@/features/recipes/recipeApi';
import { Recipe } from '@/features/recipes/recipeSlice';


export default function HomePage() {
  const router = useRouter();
  const { data: recipes = [], isLoading, error } = useGetRecipesQuery();

  const handleHeroSearchRecipe = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleHeroSearchSuggestion = (suggestion: string) => {
    router.push(`/recipes?search=${encodeURIComponent(suggestion)}`);
  };

  const handleHeroSearch = (query: string) => {
    router.push(`/recipes?search=${encodeURIComponent(query)}`);
  };

  const trendingSearches = [
    'Thai curry',
    'Italian pasta',
    'Healthy salads',
    'Quick breakfast',
    'Vegan recipes',
    'Desserts'
  ];

  const mockRecipes: Recipe[] = [];

  // Use API data if available, otherwise use mock data
  const displayRecipes = recipes.length > 0 ? recipes : mockRecipes;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
            {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 animate-fade-in">
            Find & Share Your
            <span className="text-green-600 block mt-2">Favorite Recipes</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
            Discover thousands of delicious recipes from around the world. Share your culinary creations and connect with fellow food enthusiasts.
          </p>

          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <ClientOnly fallback={
              <div className="w-full h-12 bg-gray-100 rounded-full animate-pulse"></div>
            }>
              <InstantSearchDropdown
                onRecipeClick={handleHeroSearchRecipe}
                onSuggestionClick={handleHeroSearchSuggestion}
                onSearch={handleHeroSearch}
                placeholder="Search for recipes, ingredients, or cuisines..."
                className="w-full"
              />
            </ClientOnly>

            {/* Trending Searches */}
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500 font-medium">Trending:</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {trendingSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(`/recipes?search=${encodeURIComponent(term)}`)}
                    className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm hover:bg-green-50 hover:text-green-700 transition-colors border border-gray-200"
                    suppressHydrationWarning
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/upload"
              className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-green-700 transition-all duration-200 hover:scale-105 shadow-lg w-full sm:w-auto"
            >
              Share Your Recipe
            </Link>
            <Link
              href="/recipes"
              className="bg-white text-green-600 border-2 border-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-green-50 transition-all duration-200 hover:scale-105 shadow-lg w-full sm:w-auto"
            >
              Browse Recipes
            </Link>
            <Link
              href="/about"
              className="bg-gray-100 text-gray-700 border-2 border-gray-300 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-200 transition-all duration-200 hover:scale-105 shadow-lg w-full sm:w-auto"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Recipes */}
      <section id="trending-recipes" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Trending Recipes</h2>
            <Link 
              href="/recipes" 
              className="text-green-600 hover:text-green-700 font-medium text-sm sm:text-base transition-colors"
            >
              View All →
            </Link>
          </div>
          
          {isLoading && (
            <div className="flex gap-4 sm:gap-6 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 sm:h-56 bg-gray-200"></div>
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
            <div className="text-center py-8 sm:py-12 px-4">
              <p className="text-red-500 mb-4 text-sm sm:text-base">Failed to load recipes</p>
              <p className="text-gray-600 text-sm sm:text-base">Showing sample recipes instead</p>
            </div>
          )}

          {!isLoading && (
            <div className="relative group">
              <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory scroll-smooth">
                {displayRecipes.slice(0, 5).map((recipe, index) => (
                  <div
                    key={recipe.id || recipe._id || index}
                    className="flex-shrink-0 w-72 sm:w-80 animate-fade-in-up snap-start"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <RecipeCard recipe={recipe} />
                  </div>
                ))}
              </div>
              
              {/* Scroll fade indicators for mobile */}
              <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none sm:hidden"></div>
              <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none sm:hidden"></div>
            </div>
          )}
        </div>
      </section>

      {/* Browse by Cuisine */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Cuisine</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Italian', 'Thai', 'Mexican', 'Indian', 'Japanese', 'French'].map((cuisine, index) => (
              <Link
                key={cuisine}
                href={`/recipes?cuisine=${cuisine.toLowerCase()}`}
                className="bg-gray-100 rounded-xl p-6 text-center hover:bg-green-50 hover:border-green-200 border-2 border-transparent transition-all duration-200 cursor-pointer group animate-fade-in-up block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {cuisine === 'Italian' && '🍝'}
                  {cuisine === 'Thai' && '🌶️'}
                  {cuisine === 'Mexican' && '🌮'}
                  {cuisine === 'Indian' && '🍛'}
                  {cuisine === 'Japanese' && '🍱'}
                  {cuisine === 'French' && '🥐'}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                  {cuisine}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
