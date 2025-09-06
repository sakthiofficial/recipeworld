'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Heart, Bookmark, ChefHat, ArrowLeft } from 'lucide-react';
import { useGetRecipeByIdQuery } from '@/features/recipes/recipeApi';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/LoginModal';
import { getRecipeImageOrBackground } from '@/utils/recipeImageUtils';

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params.id as string;
  const { user } = useAuth();
  
  const { data: recipe, isLoading, error } = useGetRecipeByIdQuery(recipeId);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'like' | 'follow' | 'save' | null>(null);

  // Initialize likes count and check user's like/follow status when recipe loads
  useEffect(() => {
    if (recipe) {
      setLikesCount(recipe.likes || 0);
      
      // Check if user has liked this recipe (you'd typically get this from API)
      // For now, we'll track it locally
      if (user) {
        const likedRecipes = JSON.parse(localStorage.getItem(`likedRecipes_${user.id}`) || '[]');
        setIsLiked(likedRecipes.includes(recipeId));
        
        // Check if user has saved this recipe
        const savedRecipes = JSON.parse(localStorage.getItem(`savedRecipes_${user.id}`) || '[]');
        setIsSaved(savedRecipes.includes(recipeId));
        
        // Check if user is following the author (you'd typically get this from API)
        const followingUsers = JSON.parse(localStorage.getItem(`following_${user.id}`) || '[]');
        setIsFollowing(followingUsers.includes(recipe.author?._id || recipe.author?.id));
      }
    }
  }, [recipe, user, recipeId]);

  const handleLike = async () => {
    if (!user) {
      setPendingAction('like');
      setShowLoginModal(true);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token'); // Use the correct key from AuthUtils
      
      // Validate token exists and is not empty
      if (!token || token.trim() === '') {
        console.error('No valid token found, redirecting to login');
        setPendingAction('like');
        setShowLoginModal(true);
        return;
      }

      const method = isLiked ? 'DELETE' : 'POST';
      
      console.log('Making request with token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`/api/recipes/${recipeId}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
        
        // Update local storage to remember like state
        const likedRecipes = JSON.parse(localStorage.getItem(`likedRecipes_${user.id}`) || '[]');
        if (newLikedState) {
          if (!likedRecipes.includes(recipeId)) {
            likedRecipes.push(recipeId);
          }
        } else {
          const index = likedRecipes.indexOf(recipeId);
          if (index > -1) likedRecipes.splice(index, 1);
        }
        localStorage.setItem(`likedRecipes_${user.id}`, JSON.stringify(likedRecipes));
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to update like:', response.status, errorData);
        
        if (response.status === 401) {
          // Token is invalid, clear it and show login
          localStorage.removeItem('auth_token'); // Use correct key
          localStorage.removeItem('auth_user'); // Use correct key
          setPendingAction('like');
          setShowLoginModal(true);
        }
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      setPendingAction('follow');
      setShowLoginModal(true);
      return;
    }

    const authorId = recipe?.author?._id || recipe?.author?.id;
    if (!authorId) {
      alert('Author information not available');
      return;
    }

    // Don't allow users to follow themselves
    if (authorId === user.id) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token'); // Use the correct key from AuthUtils
      
      // Validate token exists and is not empty
      if (!token || token.trim() === '') {
        console.error('No valid token found, redirecting to login');
        setPendingAction('follow');
        setShowLoginModal(true);
        return;
      }

      const method = isFollowing ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/users/${authorId}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const newFollowState = !isFollowing;
        setIsFollowing(newFollowState);
        
        // Update local storage to remember follow state
        const followingUsers = JSON.parse(localStorage.getItem(`following_${user.id}`) || '[]');
        if (newFollowState) {
          if (!followingUsers.includes(authorId)) {
            followingUsers.push(authorId);
          }
        } else {
          const index = followingUsers.indexOf(authorId);
          if (index > -1) followingUsers.splice(index, 1);
        }
        localStorage.setItem(`following_${user.id}`, JSON.stringify(followingUsers));
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to update follow status:', response.status, errorData);
        
        if (response.status === 401) {
          // Token is invalid, clear it and show login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setPendingAction('follow');
          setShowLoginModal(true);
        }
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleSave = () => {
    if (!user) {
      setPendingAction('save');
      setShowLoginModal(true);
      return;
    }

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    
    console.log('Saving recipe:', recipeId, 'for user:', user.id, 'new state:', newSavedState);
    
    // Update local storage to remember save state
    const savedRecipes = JSON.parse(localStorage.getItem(`savedRecipes_${user.id}`) || '[]');
    if (newSavedState) {
      if (!savedRecipes.includes(recipeId)) {
        savedRecipes.push(recipeId);
      }
    } else {
      const index = savedRecipes.indexOf(recipeId);
      if (index > -1) savedRecipes.splice(index, 1);
    }
    localStorage.setItem(`savedRecipes_${user.id}`, JSON.stringify(savedRecipes));
    
    console.log('Updated savedRecipes in localStorage:', savedRecipes);
    
    // Show feedback to user
    if (newSavedState) {
      // You could show a toast notification here
      console.log('Recipe saved successfully!');
    } else {
      console.log('Recipe removed from saved!');
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    
    // Execute the pending action after successful login
    if (pendingAction === 'like') {
      setTimeout(handleLike, 100); // Small delay to ensure user state is updated
    } else if (pendingAction === 'follow') {
      setTimeout(handleFollow, 100);
    } else if (pendingAction === 'save') {
      setTimeout(handleSave, 100);
    }
    
    setPendingAction(null);
  };

  // Mock recipe data as fallback
  const mockRecipe = {
    id: recipeId,
    title: 'Spicy Thai Green Curry',
    description: 'A vibrant and aromatic curry with coconut milk, fresh herbs, and vegetables that brings the authentic taste of Thailand to your kitchen.',
    image: '/placeholder-recipe.jpg',
    cookingTime: 30,
    servings: 4,
    difficulty: 'Medium',
    likes: 124,
    author: {
      name: 'Chef Maria',
      avatar: '/placeholder-avatar.jpg',
      recipes: 23,
      followers: 1200
    },
    ingredients: [
      '2 tbsp green curry paste',
      '400ml coconut milk',
      '300g chicken breast, sliced',
      '1 Thai eggplant, cubed',
      '100g green beans, trimmed',
      '2 kaffir lime leaves',
      '1 tbsp fish sauce',
      '1 tbsp palm sugar',
      'Fresh Thai basil leaves',
      'Red chilies for garnish'
    ],
    steps: [
      'Heat 2 tbsp of thick coconut milk in a wok over medium heat until oil separates.',
      'Add green curry paste and fry for 2-3 minutes until fragrant.',
      'Add chicken pieces and cook until just done, about 5 minutes.',
      'Pour in remaining coconut milk and bring to a gentle simmer.',
      'Add eggplant, green beans, and kaffir lime leaves. Simmer for 10 minutes.',
      'Season with fish sauce and palm sugar to taste.',
      'Remove from heat and stir in fresh Thai basil leaves.',
      'Serve hot with jasmine rice and garnish with red chilies.'
    ],
    tags: ['Thai', 'Spicy', 'Coconut', 'Chicken'],
    cuisine: 'Thai'
  };

  // Use API data if available, otherwise use mock data
  const displayRecipe = recipe || mockRecipe;

  const toggleIngredient = (index: number) => {
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Recipe not found</h2>
          <p className="text-gray-600 mb-4">The recipe you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="text-green-600 hover:text-green-700 underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }
  const imageData = getRecipeImageOrBackground(recipe, false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/recipes" 
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Back to Recipes</span>
              <span className="sm:hidden">Back</span>
            </Link>
            
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <span className="text-lg sm:text-2xl font-bold text-gray-900 hidden xs:block">FlavorShare</span>
              <span className="text-lg font-bold text-gray-900 xs:hidden">Recipeworld</span>
            </Link>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleSave}
                className={`p-2 rounded-full transition-colors ${
                  isSaved ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:text-green-600'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save recipe'}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
             
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 animate-fade-in">
          {/* Recipe Image */}
          <div className="relative h-80 bg-gray-200">
           {imageData.hasImage ? (
                       <Image
                         src={recipe.image || '/api/placeholder/400/300'}
                         alt={recipe.title}
                         fill
                         className="object-cover group-hover:scale-105 transition-transform duration-300"
                       />
                     ) : (
                       <div 
                         className="w-full h-full flex flex-col items-center justify-center relative group-hover:scale-105 transition-transform duration-300"
                         style={{ background: imageData.background }}
                       >
                         <div className="text-center text-white">
                           <div className="text-4xl mb-2">{imageData.emoji}</div>
                           <div className="text-sm font-medium opacity-90">{imageData.cuisine}</div>
                           <div className="text-xs opacity-75 mt-1">Cuisine</div>
                         </div>
                         <div className="absolute inset-0 bg-black/10"></div>
                       </div>
                     )}
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Title and Description */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{displayRecipe.title}</h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">{displayRecipe.description}</p>

            {/* Recipe Meta */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <div className="flex items-center flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{displayRecipe.cookingTime} mins</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{displayRecipe.servings} servings</span>
                </div>
                <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                  {displayRecipe.difficulty}
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-full transition-all text-sm ${
                    isLiked 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                  }`}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likesCount}</span>
                </button>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
              {displayRecipe.author?.avatar ? (
                <Image
                  src={displayRecipe.author.avatar}
                  alt={displayRecipe.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{displayRecipe.author?.name || 'Unknown Author'}</h3>
                <p className="text-sm text-gray-600">
                  {displayRecipe.author?.recipes || 0} recipes • {displayRecipe.author?.followers || 0} followers
                </p>
              </div>
              {/* Only show follow button if it's not the current user's recipe */}
              {user && (displayRecipe.author?._id || displayRecipe.author?.id) !== user.id && (
                <button 
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isFollowing 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              {/* Show "Your Recipe" indicator if it's the current user's recipe */}
              {user && (displayRecipe.author?._id || displayRecipe.author?.id) === user.id && (
                <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium">
                  Your Recipe
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-delay">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ingredients</h2>
              <div className="space-y-3">
                {(displayRecipe.ingredients || []).map((ingredient: string, index: number) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={checkedIngredients[index] || false}
                      onChange={() => toggleIngredient(index)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className={`text-gray-700 group-hover:text-green-600 transition-colors ${
                      checkedIngredients[index] ? 'line-through text-gray-400' : ''
                    }`}>
                      {ingredient}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-delay-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructions</h2>
              <div className="space-y-6">
                {(displayRecipe.steps || []).map((step: string, index: number) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {(displayRecipe.tags || []).map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium hover:bg-green-200 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
