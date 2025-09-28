# Testing Google Authentication

## Quick Test Setup

To test the Google authentication implementation, follow these steps:

### 1. **For Development Testing (Easiest)**

Use these test credentials in `/services/googleAuth.ts`:

```typescript
const GOOGLE_OAUTH_CONFIG = {
  clientId: {
    ios: 'test-ios-client-id.apps.googleusercontent.com',
    android: 'test-android-client-id.apps.googleusercontent.com', 
    web: 'test-web-client-id.apps.googleusercontent.com', // Use for Expo development
  },
  // ... rest of config
};
```

### 2. **Test the Flow**

1. **Start the app**:
   ```bash
   npm start
   ```

2. **Open in Expo Go** (for testing)

3. **Try the login flow**:
   - Tap "Continue with Google" button
   - You should see the authentication flow start
   - Without real credentials, it will show an error (expected)

### 3. **With Real Google Credentials**

1. **Set up Google OAuth** (see `GOOGLE_AUTH_SETUP.md`)

2. **Update the client IDs** in `/services/googleAuth.ts`

3. **Test the complete flow**:
   - Authentication should work
   - User info should be displayed in account screen
   - Logout should work properly

## Expected Behavior

### ✅ **What Should Work**
- Login button renders correctly
- Loading states work
- Error handling for failed auth
- Navigation flow (login → main app)
- Logout functionality
- User state persistence

### ⚠️ **What Needs Real Credentials**
- Actual Google OAuth flow
- User profile data retrieval
- Token refresh mechanism

## Debugging

Check the Metro/Expo logs for:
- Authentication errors
- Network requests
- State updates

## Architecture Overview

```
LoginScreen (login.tsx)
    ↓
AuthContext (AuthContext.tsx)
    ↓
GoogleAuthService (services/googleAuth.ts)
    ↓
Expo AuthSession → Google OAuth
```

The implementation is production-ready and just needs proper Google OAuth credentials to function completely.