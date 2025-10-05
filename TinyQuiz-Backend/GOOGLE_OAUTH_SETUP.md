# Google OAuth2 Setup Guide

## Required Environment Variables

Add these variables to your `.env` file:

```env
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:4200
```

## Google Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set Application Type to "Web Application"
6. Add Authorized Redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. Copy Client ID and Client Secret to your `.env` file

## Backend Routes Available

- `GET /api/auth/google` - Initiate Google login
- `GET /api/auth/google/callback` - Handle Google callback
- `GET /api/auth/profile` - Get user profile (protected)

## Frontend Integration

After successful OAuth, user will be redirected to:
`http://localhost:4200/auth-success?token=JWT_TOKEN_HERE`

Your frontend should:
1. Extract token from URL
2. Store in localStorage/sessionStorage
3. Use for subsequent API calls