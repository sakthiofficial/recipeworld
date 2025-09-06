'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Grid, Bookmark, Heart, User, Clock, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { getRecipeImageOrBackground } from '@/utils/recipeImageUtils';

interface Recipe {
  _id: string;
  title: string;
  description: string;
  image?: string;
  cookingTime: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

interface FollowerUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'liked'>('posts');
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });
  const [followersData, setFollowersData] = useState<FollowerUser[]>([]);
  const [followingData, setFollowingData] = useState<FollowerUser[]>([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Load user profile
      const profileResponse = await fetch(`/api/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      }

      // Load user's recipes
      const recipesResponse = await fetch(`/api/recipes?author=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json();
        setUserRecipes(recipesData);
        setStats(prev => ({ ...prev, posts: recipesData.length }));
      }

      // Load saved recipes from localStorage and fetch their details
      const savedRecipeIds = JSON.parse(localStorage.getItem(`savedRecipes_${user.id}`) || '[]');
      if (savedRecipeIds.length > 0) {
        const savedRecipesData = await Promise.all(
          savedRecipeIds.map(async (id: string) => {
            const response = await fetch(`/api/recipes/${id}`);
            if (response.ok) {
              return await response.json();
            }
            return null;
          })
        );
        setSavedRecipes(savedRecipesData.filter(recipe => recipe !== null));
      }

      // Load liked recipes from localStorage and fetch their details
      const likedRecipeIds = JSON.parse(localStorage.getItem(`likedRecipes_${user.id}`) || '[]');
      if (likedRecipeIds.length > 0) {
        const likedRecipesData = await Promise.all(
          likedRecipeIds.map(async (id: string) => {
            const response = await fetch(`/api/recipes/${id}`);
            if (response.ok) {
              return await response.json();
            }
            return null;
          })
        );
        setLikedRecipes(likedRecipesData.filter(recipe => recipe !== null));
      }

      // Load followers/following data from API
      const followersResponse = await fetch(`/api/users/${user.id}/followers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (followersResponse.ok) {
        const followersData = await followersResponse.json();
        setFollowersData(followersData.followers);
        setStats(prev => ({ ...prev, followers: followersData.count }));
      }

      const followingResponse = await fetch(`/api/users/${user.id}/following`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (followingResponse.ok) {
        const followingDataRes = await followingResponse.json();
        setFollowingData(followingDataRes.following);
        setStats(prev => ({ ...prev, following: followingDataRes.count }));
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('Profile page useEffect - user:', user);
    console.log('Profile page useEffect - isAuthenticated:', isAuthenticated);
    console.log('Profile page useEffect - localStorage auth_token:', localStorage.getItem('auth_token'));
    console.log('Profile page useEffect - localStorage auth_user:', localStorage.getItem('auth_user'));
    
    // Check if we have auth data in localStorage even if user is null initially
    const hasAuthToken = localStorage.getItem('auth_token');
    const hasAuthUser = localStorage.getItem('auth_user');
    
    if (!hasAuthToken || !hasAuthUser) {
      console.log('No auth data in localStorage, redirecting to /');
      router.push('/');
      return;
    }
    
    // Wait a bit for the auth hook to finish loading if user is still null
    if (!user) {
      console.log('User is null, waiting for auth to load...');
      const timer = setTimeout(() => {
        setAuthLoading(false);
        if (!user) {
          console.log('User still null after timeout, redirecting to /');
          router.push('/');
        }
      }, 500); // Give more time for auth to load
      
      return () => clearTimeout(timer);
    }
    
    // User is available, load data
    setAuthLoading(false);
    loadUserData();
  }, [user, router, loadUserData, isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const renderRecipeGrid = (recipes: Recipe[]) => {
    if (recipes.length === 0) {
      return (
        <div className="col-span-2 sm:col-span-3 lg:col-span-4 text-center py-8 sm:py-12">
          <div className="text-gray-400 text-base sm:text-lg mb-2">No recipes yet</div>
          <p className="text-gray-500 text-sm sm:text-base px-4">
            {activeTab === 'posts' ? 'Start sharing your recipes!' : 
             activeTab === 'saved' ? 'Save recipes you love' : 
             'Like recipes to see them here'}
          </p>
        </div>
      );
    }

    return recipes.map((recipe) => (
      <div key={recipe._id} className="group">
        <Link href={`/recipes/${recipe._id}`}>
          <div className="aspect-square relative overflow-hidden bg-gray-100 hover:opacity-95 transition-opacity">
            {(() => {
              const imageData = getRecipeImageOrBackground(recipe, true);
              return imageData.hasImage && recipe.image ? (
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-recipe.svg';
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center text-white font-medium"
                  style={{ background: imageData.background }}
                >
                  <span className="text-4xl mb-2">{imageData.emoji}</span>
                  <span className="text-sm text-center px-2">
                    {imageData.cuisine}
                  </span>
                  <span className="text-xs text-center px-2 mt-1 opacity-80">
                    {recipe.title}
                  </span>
                </div>
              );
            })()}
            
            {/* Hover overlay with stats */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="text-white text-center">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5 fill-white" />
                    <span className="font-semibold">{recipe.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">{recipe.cookingTime}m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Post caption/info below image */}
        <div className="mt-1 sm:mt-2 px-1">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-xs sm:text-sm text-gray-900 truncate">{recipe.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 hidden sm:block">{recipe.description}</p>
              <div className="flex items-center gap-2 sm:gap-3 mt-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Heart className="w-3 h-3" />
                  <span className="hidden sm:inline">{recipe.likes?.length || 0} likes</span>
                  <span className="sm:hidden">{recipe.likes?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span className="hidden sm:inline">{recipe.cookingTime}m</span>
                  <span className="sm:hidden">{recipe.cookingTime}m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold truncate mx-4">{userProfile?.name || user.name}</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 mb-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200">
                {userProfile?.avatar || user.avatar ? (
                  <Image
                    src={userProfile?.avatar || user.avatar || '/placeholder-avatar.svg'}
                    alt={userProfile?.name || user.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-avatar.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <User className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mb-4">
                <h1 className="text-xl sm:text-2xl font-light truncate">{userProfile?.name || user.name}</h1>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 sm:px-4 sm:py-1.5 border border-gray-300 rounded text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </div>

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-4 sm:gap-6 lg:gap-8 mb-4">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-semibold">{stats.posts}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">posts</div>
                </div>
                <button 
                  onClick={() => setShowFollowersModal(true)}
                  className="text-center hover:text-gray-600 transition-colors"
                >
                  <div className="text-lg sm:text-xl font-semibold">{stats.followers}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">followers</div>
                </button>
                <button 
                  onClick={() => setShowFollowingModal(true)}
                  className="text-center hover:text-gray-600 transition-colors"
                >
                  <div className="text-lg sm:text-xl font-semibold">{stats.following}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">following</div>
                </button>
              </div>

              {/* Bio */}
              <div className="text-xs sm:text-sm">
                <div className="font-semibold">{userProfile?.name || user.name}</div>
                <div className="text-gray-600 mt-1 max-w-md">
                  {userProfile?.bio || 'Food enthusiast sharing delicious recipes 🍳✨'}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Joined {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium border-t-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">POSTS</span>
                <span className="sm:hidden">POSTS</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium border-t-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">SAVED</span>
                <span className="sm:hidden">SAVED</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`flex-1 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium border-t-2 transition-colors ${
                activeTab === 'liked'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">LIKED</span>
                <span className="sm:hidden">LIKED</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="py-2 sm:py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 lg:gap-3">
            {activeTab === 'posts' && renderRecipeGrid(userRecipes)}
            {activeTab === 'saved' && renderRecipeGrid(savedRecipes)}
            {activeTab === 'liked' && renderRecipeGrid(likedRecipes)}
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm sm:max-w-md max-h-96 overflow-hidden">
            <div className="p-3 sm:p-4 border-b flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold">Followers</h2>
              <button 
                onClick={() => setShowFollowersModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-3 sm:p-4 max-h-80 overflow-y-auto">
              {followersData.map((follower) => (
                <div key={follower._id} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={follower.avatar || '/placeholder-avatar.svg'}
                      alt={follower.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{follower.name}</div>
                  </div>
                </div>
              ))}
              {followersData.length === 0 && (
                <div className="text-center text-gray-500 py-8 text-sm">No followers yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm sm:max-w-md max-h-96 overflow-hidden">
            <div className="p-3 sm:p-4 border-b flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold">Following</h2>
              <button 
                onClick={() => setShowFollowingModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-3 sm:p-4 max-h-80 overflow-y-auto">
              {followingData.map((following) => (
                <div key={following._id} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={following.avatar || '/placeholder-avatar.svg'}
                      alt={following.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{following.name}</div>
                  </div>
                </div>
              ))}
              {followingData.length === 0 && (
                <div className="text-center text-gray-500 py-8 text-sm">Not following anyone yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
