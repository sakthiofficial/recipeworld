# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for RecipeWorld.

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

## Step 2: Configure Environment Variables

Copy your Google OAuth credentials and update the `.env.local` file:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=a-random-secret-at-least-32-characters-long
```

## Step 3: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

## Step 4: Test Google Authentication

1. Start your development server: `npm run dev`
2. Go to http://localhost:3000/auth/login
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your app

## Step 5: Production Setup

For production deployment:

1. Update the authorized redirect URIs in Google Cloud Console
2. Update the `NEXTAUTH_URL` environment variable to your production domain
3. Ensure all environment variables are properly set in your hosting platform

## Features Implemented

✅ Google OAuth sign-in and sign-up
✅ Session management with NextAuth.js
✅ MongoDB adapter for storing user sessions
✅ Automatic user creation on first Google sign-in
✅ Seamless integration with existing manual authentication

## Security Features

- JWT-based sessions
- Secure cookie handling
- CSRF protection
- MongoDB session storage
- Automatic token refresh
