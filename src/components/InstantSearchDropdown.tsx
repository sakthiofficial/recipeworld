'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Users, Star, X, ChefHat } from 'lucide-react';
import Image from 'next/image';
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
  author: {
    name: string;
    avatar?: string;
  };
  matchedIngredients?: Array<{ name: string; quantity: string; unit: string }>;
}

interface SearchSuggestion {
  suggestion: string;
  type: 'tag' | 'cuisine' | 'ingredient';
}

interface InstantSearchResponse {
  success: boolean;
  data: {
    recipes: Recipe[];
    suggestions: SearchSuggestion[];
    query: string;
  };
}

interface InstantSearchDropdownProps {
  onRecipeClick: (recipeId: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function InstantSearchDropdown({
  onRecipeClick,
  onSuggestionClick,
  onSearch,
  placeholder = "Search recipes, ingredients, cuisines...",
  className = ""
}: InstantSearchDropdownProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<InstantSearchResponse | null>(null);
  const [popularCuisines, setPopularCuisines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch instant search results
  const fetchInstantResults = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const [searchResponse, cuisinesResponse] = await Promise.all([
        fetch(`/api/search/instant?q=${encodeURIComponent(searchQuery)}&limit=6`),
        fetch('/api/cuisines')
      ]);
      
      const searchData: InstantSearchResponse = await searchResponse.json();
      const cuisinesData = await cuisinesResponse.json();
      
      if (searchData.success) {
        // Filter cuisines that match the search query
        const matchingCuisines = cuisinesData.success ? 
          cuisinesData.data.filter((cuisine: string) => 
            cuisine.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 5) : [];

        // Add matching cuisines to suggestions
        const cuisineSuggestions = matchingCuisines.map((cuisine: string) => ({
          suggestion: cuisine,
          type: 'cuisine' as const
        }));

        // Combine and prioritize suggestions
        const combinedSuggestions = [
          ...cuisineSuggestions,
          ...searchData.data.suggestions.filter(s => s.type !== 'cuisine')
        ].slice(0, 8);

        setResults({
          ...searchData,
          data: {
            ...searchData.data,
            suggestions: combinedSuggestions
          }
        });
      }
    } catch (error) {
      console.error('Error fetching instant results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch popular cuisines when dropdown opens without search
  const fetchPopularCuisines = async () => {
    try {
      const response = await fetch('/api/cuisines');
      const data = await response.json();
      if (data.success) {
        setPopularCuisines(data.data.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching cuisines:', error);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showDropdown && query) {
        fetchInstantResults(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, showDropdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setShowDropdown(false);
    onSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setShowDropdown(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || !results) return;

    const totalItems = results.data.recipes.length + results.data.suggestions.length + 1; // +1 for "Search for" option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === 0) {
          handleSubmit(e);
        } else if (selectedIndex > 0 && selectedIndex <= results.data.recipes.length) {
          const recipe = results.data.recipes[selectedIndex - 1];
          onRecipeClick(recipe._id);
          setShowDropdown(false);
        } else if (selectedIndex > results.data.recipes.length) {
          const suggestionIndex = selectedIndex - results.data.recipes.length - 1;
          const suggestion = results.data.suggestions[suggestionIndex];
          if (suggestion) {
            onSuggestionClick(suggestion.suggestion);
            setShowDropdown(false);
          }
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  };

  const getCuisineIcon = (cuisine: string) => {
    const icons: { [key: string]: string } = {
      'Italian': '🍝',
      'Chinese': '🥢',
      'Japanese': '🍣',
      'Thai': '🌶️',
      'Indian': '🍛',
      'French': '🥖',
      'Mediterranean': '🫒',
      'Greek': '🫒',
      'Spanish': '🥘',
      'Korean': '🍜',
      'Vietnamese': '🍜',
      'Turkish': '🥙',
      'Lebanese': '🥙',
      'Moroccan': '🍲',
      'Brazilian': '🥩',
      'Peruvian': '🌽',
      'British': '🫖',
      'German': '🍺',
      'Russian': '🥟',
      'Ethiopian': '🍲',
      'Caribbean': '🌴',
      'Mexican': '🌮',
      'American': '🍔',
      'Fusion': '🌍',
      'Other': '🍽️'
    };
    return icons[cuisine] || '🍽️';
  };


  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'cuisine':
        return '🍽️';
      case 'ingredient':
        return '🥬';
      case 'tag':
        return '🏷️';
      default:
        return '🔍';
    }
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="bg-yellow-200 font-semibold">{part}</span> : 
        part
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (isMounted) {
                setShowDropdown(true);
                if (!query) {
                  fetchPopularCuisines();
                }
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-12 pr-10 py-3 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-lg"
            suppressHydrationWarning
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setShowDropdown(false);
                setResults(null);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Instant Search Dropdown */}
      {isMounted && showDropdown && (query.length >= 2 || results) && (
        <div 
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-96 overflow-y-auto"
          suppressHydrationWarning
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full"></div>
              <span className="ml-2">Searching...</span>
            </div>
          ) : results && (results.data.recipes.length > 0 || results.data.suggestions.length > 0) ? (
            <div>
              {/* Search Query Option */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    onSearch(query);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 flex items-center space-x-3 font-medium ${
                    selectedIndex === 0 ? 'bg-green-50' : ''
                  }`}
                >
                  <Search className="h-4 w-4 text-green-500" />
                  <span>Search for &quot;{query}&quot;</span>
                </button>
              )}

              {/* Recipe Results */}
              {results.data.recipes.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Recipes
                  </div>
                  {results.data.recipes.map((recipe, index) => (
                    <button
                      key={recipe._id}
                      type="button"
                      onClick={() => {
                        onRecipeClick(recipe._id);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3 ${
                        selectedIndex === index + 1 ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {(() => {
                          const imageData = getRecipeImageOrBackground(recipe, true);
                          return imageData.hasImage ? (
                            <Image
                              src={recipe.image || '/api/placeholder/100/100'}
                              alt={recipe.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex flex-col items-center justify-center text-white text-xs font-medium"
                              style={{ background: imageData.background }}
                            >
                              <span className="text-base mb-1">{imageData.emoji}</span>
                              <span className="text-[8px] text-center leading-tight px-1">
                                {imageData.cuisine}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {highlightMatch(recipe.title, query)}
                        </h4>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {recipe.prepTime + recipe.cookTime}m
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {recipe.servings}
                          </span>
                          <span className="flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-400" />
                            {recipe.averageRating?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                        {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            Includes: {recipe.matchedIngredients.slice(0, 2).map(ing => ing.name).join(', ')}
                            {recipe.matchedIngredients.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {recipe.cuisine}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {results.data.suggestions.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-t border-gray-100">
                    Suggestions
                  </div>
                  {results.data.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        onSuggestionClick(suggestion.suggestion);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3 ${
                        selectedIndex === results.data.recipes.length + index + 1 ? 'bg-green-50' : ''
                      }`}
                    >
                      <span className="text-lg">
                        {suggestion.type === 'cuisine' ? getCuisineIcon(suggestion.suggestion) : getSuggestionIcon(suggestion.type)}
                      </span>
                      <span className="flex-1">
                        {highlightMatch(suggestion.suggestion, query)}
                      </span>
                      <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                        {suggestion.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : !query && popularCuisines.length > 0 ? (
            <div>
              {/* <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                Popular Cuisines
              </div>
              {popularCuisines.map((cuisine, index) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => {
                    onSuggestionClick(cuisine);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3 ${
                    selectedIndex === index ? 'bg-green-50' : ''
                  }`}
                >
                  <span className="text-lg">{getCuisineIcon(cuisine)}</span>
                  <span className="flex-1">{cuisine}</span>
                  <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                    cuisine
                  </span>
                </button>
              ))} */}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <ChefHat className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p>No recipes found matching &quot;{query}&quot;</p>
              <p className="text-sm">Try searching for ingredients, cuisines, or recipe names</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
