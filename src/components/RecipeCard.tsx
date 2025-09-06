'use client';

import { Clock, Users, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getRecipeImageOrBackground } from '@/utils/recipeImageUtils';

interface RecipeCardProps {
  recipe: {
    id?: string;
    _id?: string;
    title: string;
    description: string;
    image?: string;
    cuisine?: string;
    cookingTime?: number;
    prepTime?: number;
    cookTime?: number;
    likes?: number;
    likesCount?: number;
    servings?: number;
    totalTime?: number;
    author?: {
      name: string;
      avatar?: string;
    };
  };
  showImage?: boolean; // Controls whether to show actual image or cuisine background
}

export function RecipeCard({ recipe, showImage = false }: RecipeCardProps) {
  const recipeId = recipe._id || recipe.id;
  const totalTime = recipe.cookingTime || (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const likesCount = recipe.likes || recipe.likesCount || 0;
  const imageData = getRecipeImageOrBackground(recipe, showImage);

  return (
    <Link href={`/recipes/${recipeId}`} className="block">
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        {/* Recipe Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
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
          <div className="absolute top-3 right-3">
            <button 
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle like functionality here
              }}
            >
              <Heart className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

      {/* Recipe Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{totalTime}m</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{likesCount}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {recipe.author?.avatar ? (
              <Image
                src={recipe.author.avatar}
                alt={recipe.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <Users className="h-3 w-3 text-gray-600" />
              </div>
            )}
            <span className="text-xs">{recipe.author?.name}</span>
          </div>
        </div>
      </div>
      </div>
    </Link>
  );
}
