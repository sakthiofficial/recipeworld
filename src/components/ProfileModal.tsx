'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Bookmark, Heart, Users, User, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  image?: string;
  cookingTime: number;
  author: {
    name: string;
    avatar?: string;
  };
  likes: number;
}

interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'liked'>('posts');
  const [userPosts, setUserPosts] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ posts: 0, followers: 0, following: 0 });

  const loadUserData = useCallback(() => {
    if (!user) return;

    // Load saved recipes from localStorage
    const savedRecipeIds = JSON.parse(localStorage.getItem(`savedRecipes_${user.id}`) || '[]');
    const likedRecipeIds = JSON.parse(localStorage.getItem(`likedRecipes_${user.id}`) || '[]');
    const followingUserIds = JSON.parse(localStorage.getItem(`following_${user.id}`) || '[]');

    // Enhanced mock recipe data with more recipes for posts
    const allMockRecipes: Recipe[] = [
      {
        id: '1',
        title: 'Spicy Thai Green Curry',
        description: 'A vibrant and aromatic curry with coconut milk, fresh herbs, and vegetables',
        image: '/placeholder-recipe.svg',
        cookingTime: 30,
        author: { name: user.name, avatar: '/placeholder-avatar.svg' },
        likes: 124
      },
      {
        id: '2',
        title: 'Classic Margherita Pizza',
        description: 'Traditional Italian pizza with fresh basil and mozzarella',
        image: '/placeholder-recipe.svg',
        cookingTime: 45,
        author: { name: user.name, avatar: '/placeholder-avatar.svg' },
        likes: 89
      },
      {
        id: '3',
        title: 'Chocolate Lava Cake',
        description: 'Decadent dessert with molten chocolate center',
        image: '/placeholder-recipe.svg',
        cookingTime: 25,
        author: { name: user.name, avatar: '/placeholder-avatar.svg' },
        likes: 156
      },
      {
        id: '4',
        title: 'Mediterranean Quinoa Bowl',
        description: 'Healthy bowl with quinoa, vegetables, and tahini dressing',
        image: '/placeholder-recipe.svg',
        cookingTime: 20,
        author: { name: user.name, avatar: '/placeholder-avatar.svg' },
        likes: 78
      },
      {
        id: '5',
        title: 'Japanese Ramen',
        description: 'Rich and flavorful tonkotsu ramen with soft-boiled egg',
        image: '/placeholder-recipe.svg',
        cookingTime: 60,
        author: { name: user.name, avatar: '/placeholder-avatar.svg' },
        likes: 203
      },
      {
        id: '6',
        title: 'French Croissants',
        description: 'Buttery, flaky pastries perfect for breakfast',
        image: '/placeholder-recipe.svg',
        cookingTime: 180,
        author: { name: user.name, avatar: '/placeholder-avatar.svg' },
        likes: 95
      }
    ];

    // Filter recipes for different categories
    const userPostsList = allMockRecipes; // All recipes are user's posts
    const savedRecipeList = allMockRecipes.filter(recipe => savedRecipeIds.includes(recipe.id));
    const likedRecipeList = allMockRecipes.filter(recipe => likedRecipeIds.includes(recipe.id));
    
    setUserPosts(userPostsList);
    setSavedRecipes(savedRecipeList);
    setLikedRecipes(likedRecipeList);
    
    // Set user stats
    setUserStats({
      posts: userPostsList.length,
      followers: Math.floor(Math.random() * 1000) + 100, // Mock followers
      following: followingUserIds.length
    });
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user, loadUserData]);

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen || !user) return null;

  const renderPostGrid = (recipes: Recipe[]) => {
    if (recipes.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            {activeTab === 'posts' && <Users className="h-8 w-8 text-gray-400" />}
            {activeTab === 'saved' && <Bookmark className="h-8 w-8 text-gray-400" />}
            {activeTab === 'liked' && <Heart className="h-8 w-8 text-gray-400" />}
          </div>
          <p className="text-lg font-semibold mb-2">
            {activeTab === 'posts' && 'No Posts Yet'}
            {activeTab === 'saved' && 'No Saved Recipes'}
            {activeTab === 'liked' && 'No Liked Recipes'}
          </p>
          <p className="text-sm">
            {activeTab === 'posts' && 'Start sharing your amazing recipes!'}
            {activeTab === 'saved' && 'Save recipes you want to try later'}
            {activeTab === 'liked' && 'Like recipes you enjoy'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-1">
        {recipes.map((recipe) => (
          <Link 
            key={recipe.id} 
            href={`/recipes/${recipe.id}`}
            onClick={onClose}
            className="aspect-square relative group cursor-pointer"
          >
            <div className="w-full h-full bg-gray-200 overflow-hidden">
            <div 
              className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center bg-cover bg-center"
              style={{
                backgroundImage: recipe.image ? `url(${recipe.image})` : 'none'
              }}
            >
              {!recipe.image && <span className="text-green-600 text-2xl">🍽️</span>}
            </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-4 text-white">
                <div className="flex items-center space-x-1">
                  <Heart className="h-5 w-5 fill-current" />
                  <span className="font-semibold">{recipe.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">{recipe.cookingTime}m</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Instagram-style Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Profile Info */}
          <div className="flex items-center space-x-8">
            {/* Profile Picture */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-10 w-10 text-white" />
            </div>
            
            {/* Stats */}
            <div className="flex-1">
              <div className="flex items-center space-x-8 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{userStats.posts}</div>
                  <div className="text-sm text-gray-600">posts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{userStats.followers}</div>
                  <div className="text-sm text-gray-600">followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{userStats.following}</div>
                  <div className="text-sm text-gray-600">following</div>
                </div>
              </div>
              
              {/* User Info */}
              <div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-800 mt-1">🍳 Food lover & recipe creator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram-style Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'posts'
                ? 'text-gray-900 border-b border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="w-3 h-3 border border-current"></div>
            <span className="uppercase tracking-wider">Posts</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'saved'
                ? 'text-gray-900 border-b border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bookmark className="h-3 w-3" />
            <span className="uppercase tracking-wider">Saved</span>
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'liked'
                ? 'text-gray-900 border-b border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className="h-3 w-3" />
            <span className="uppercase tracking-wider">Liked</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'posts' && renderPostGrid(userPosts)}
          {activeTab === 'saved' && renderPostGrid(savedRecipes)}
          {activeTab === 'liked' && renderPostGrid(likedRecipes)}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
