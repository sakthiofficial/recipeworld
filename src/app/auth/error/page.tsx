'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChefHat, AlertCircle } from 'lucide-react';
import { Suspense } from 'react';

const errorMessages: { [key: string]: string } = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
  OAuthSignin: 'Error in constructing an authorization URL.',
  OAuthCallback: 'Error in handling the response from an OAuth provider.',
  OAuthCreateAccount: 'Could not create OAuth account in the database.',
  EmailCreateAccount: 'Could not create email account in the database.',
  Callback: 'Error in the OAuth callback handler route.',
  OAuthAccountNotLinked: 'The account is already linked to another user.',
  EmailSignin: 'Sending the e-mail with the verification token failed.',
  CredentialsSignin: 'The authorize callback returned null in the Credentials provider.',
  SessionRequired: 'The content of this page requires you to be signed in at all times.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <ChefHat className="h-10 w-10 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-3xl font-bold text-gray-900">FlavorShare</span>
          </Link>
        </div>

        {/* Error Icon */}
        <div className="mb-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600">{errorMessage}</p>
          {error === 'OAuthAccountNotLinked' && (
            <p className="text-sm text-gray-500 mt-2">
              This email is already associated with another account. Please sign in with your original method.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all block"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all block"
          >
            Back to Home
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-6">
          If you continue to experience issues, please contact support.
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
