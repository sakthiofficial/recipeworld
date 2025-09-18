'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { ChefHat, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useSignupMutation } from '@/features/auth/authApi';
import { AuthUtils } from '@/lib/authUtils';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signup, { isLoading, error }] = useSignupMutation();
  const [passwordError, setPasswordError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear errors when user starts typing
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      setPasswordError('');
    }
    if (e.target.name === 'email') {
      setSignupError('');
    }
  };

  // Helper function to safely extract error message
  const getErrorMessage = (error: unknown): string | undefined => {
    if (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) {
      return String(error.data.message);
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors and messages
    setPasswordError('');
    setSignupError('');
    setSuccessMessage('');
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      const result = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      }).unwrap();
      
      if (result.success && result.user && result.token) {
        // Store authentication data using AuthUtils
        AuthUtils.login(result.user, result.token);
        
        setSuccessMessage('Account created successfully! Redirecting...');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setSignupError(result.message);
      }
    } catch (err: unknown) {
      console.log('Signup failed:', err);
      
      // Handle different types of errors
      const errorMessage = getErrorMessage(err);
      if (errorMessage) {
        setSignupError(errorMessage);
      } else if (err && typeof err === 'object' && 'message' in err) {
        setSignupError(String(err.message));
      } else {
        setSignupError('Signup failed. Please try again.');
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      console.log('Initiating Google sign-up...');
      const result = await signIn('google', { 
        // callbackUrl: '/',
        redirect: false // Don't redirect automatically to handle errors
      });
      
      console.log('Google sign-up result:', result);
      
      if (result?.error) {
        console.error('Google sign-up error:', result.error);
        // Handle specific errors
        if (result.error === 'OAuthAccountNotLinked') {
          setSignupError('This Google account is already linked to another user. Please try a different account or sign in with email.');
        } else {
          setSignupError('Google sign-up failed. Please try again.');
        }
      } else if (result?.ok) {
        // Successful sign-up, redirect manually
        console.log(result);
        
        // window.location.href = result.url || '/';
      }
    } catch (error) {
      console.error('Google sign-up failed:', error);
      setSignupError('Google sign-up failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">RecipeWorld</span>
          </Link>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Join our culinary community today</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {/* Error Messages */}
          {(error || signupError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="font-medium mb-1">
                {signupError || getErrorMessage(error) || 'Signup failed. Please try again.'}
              </div>
              {(signupError?.includes('already exists') || getErrorMessage(error)?.includes('already exists')) && (
                <div className="mt-2 text-xs">
                  <p>💡 Try one of these options:</p>
                  <ul className="mt-1 ml-4 list-disc">
                    <li>
                      <Link href="/auth/login" className="text-green-600 hover:text-green-700 underline">
                        Sign in with your existing account
                      </Link>
                    </li>
                    <li>Use a different email address</li>
                    <li>
                      <Link href="/auth/forgot-password" className="text-green-600 hover:text-green-700 underline">
                        Reset your password if you forgot it
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
              {(signupError?.includes('Google') || getErrorMessage(error)?.includes('Google')) && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    Continue with Google instead →
                  </button>
                </div>
              )}
            </div>
          )}
          
          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {passwordError}
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start">
            <input type="checkbox" className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500" required />
            <span className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-green-600 hover:text-green-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-green-600 hover:text-green-700">
                Privacy Policy
              </Link>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Divider */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div> */}

          {/* Google Signup */}
          {/* <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span> */}
          {/* </button> */}
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
