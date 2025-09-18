'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ChefHat, LogOut, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { InstantSearchDropdown } from './InstantSearchDropdown';
import { ClientOnly } from './ClientOnly';

export function Navbar({}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const search = false
  const handleSearchRecipe = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleSearchSuggestion = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    
    try {
      // Use the logout function from useAuth hook
      await logout();
      
      // Navigate to home page
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect to home even if logout API fails
      router.push('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group transition-transform hover:scale-105"
          >
            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            <span className="text-lg sm:text-2xl font-bold text-gray-900 hidden xs:block">RecipeWorld</span>
            <span className="text-lg font-bold text-gray-900 xs:hidden">RecipeWorld</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-2 sm:mx-4 lg:mx-8">
            <ClientOnly fallback={
              <div className="w-full h-10 bg-gray-100 rounded-full animate-pulse"></div>
            }>
            {search?  <InstantSearchDropdown
                onRecipeClick={handleSearchRecipe}
                onSuggestionClick={handleSearchSuggestion}
                onSearch={handleSearch}
                placeholder="Search recipes..."
                className="w-full"
              />:null}
            </ClientOnly>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Upload Recipe Button */}
                <Link
                  href="/upload"
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 hover:scale-105"
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-sm">Upload Recipe</span>
                  <span className="sm:hidden text-xs">Upload</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 text-gray-600 hover:text-green-600 transition-colors rounded-full hover:bg-gray-100"
                  >
                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="hidden md:block text-sm font-medium truncate max-w-20">{user?.name}</span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 w-full px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile & Saved</span>
                      </Link>
                      <Link
                        href="/my-recipes"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Recipes
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className="px-2 sm:px-4 py-2 text-gray-700 hover:text-green-600 transition-colors text-sm sm:text-base"
                >
                  About
                </Link>
                <Link
                  href="/auth/login"
                  className="px-2 sm:px-4 py-2 text-gray-700 hover:text-green-600 transition-colors text-sm sm:text-base"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 sm:px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
