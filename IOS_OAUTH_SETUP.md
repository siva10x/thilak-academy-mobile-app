# iOS Google OAuth Setup Guide

## Current Issue: iOS Login Not Working

The iOS login flow requires specific configuration in Google Cloud Console that differs from the web setup.

## 🔧 Required Google Cloud Console Setup for iOS

### 1. Create iOS OAuth Client ID

1. **Go to Google Cloud Console** → Credentials
2. **Click "Create Credentials"** → OAuth 2.0 Client ID
3. **Select "iOS"** as application type
4. **Configure iOS settings**:
   - **Bundle ID**: `com.siva.thilak-academy-mobile-app`
   - **App Store ID**: (leave empty for development)
   - **Team ID**: (your Apple Developer Team ID - optional for development)

### 2. Important iOS Configuration Notes

- ❌ **No client secret needed** for iOS (unlike web)
- ✅ **Bundle ID must match exactly** with your `app.json` 
- ✅ **URL scheme auto-configured** based on iOS client ID
- ✅ **Redirect URI format**: `com.googleusercontent.apps.YOUR_IOS_CLIENT_ID:/oauth2redirect`
- ⚠️ **No manual redirect URI setup needed** in Google Console for iOS (it's automatic)

### 3. Current App Configuration

Your `app.json` is configured with:
```json
{
  "ios": {
    "bundleIdentifier": "com.siva.thilak-academy-mobile-app"
  },
  "scheme": "thilakacademymobileapp"
}
```

### 4. Google OAuth Client IDs Needed

You need **3 different** OAuth client IDs:

1. **Web Client ID**: For web development (✅ Working)
   - Type: Web application
   - Authorized origins: `http://localhost:8081`
   - Authorized redirect URIs: `http://localhost:8081/api/auth/callback`

2. **iOS Client ID**: For iOS app (⚠️ Needs setup)
   - Type: iOS
   - Bundle ID: `com.siva.thilak-academy-mobile-app`
   - URL scheme: `com.googleusercontent.apps.YOUR_IOS_CLIENT_ID` (automatically configured)

3. **Android Client ID**: For Android app (⚠️ Needs setup)
   - Type: Android
   - Package name: `com.siva.thilakacademymobileapp`
   - SHA-1 fingerprint: (your debug/release keystore fingerprint)

## 🧪 Testing Steps

1. **Update your iOS Client ID** in `/services/googleAuth.ts`
2. **Restart Expo development server**: `npx expo start -c`
3. **Test in iOS simulator**
4. **Check console logs** for detailed debugging info

## 🔍 Common iOS Issues

- **Bundle ID mismatch** between app.json and Google Console
- **Using web client ID** instead of iOS client ID
- **Missing iOS OAuth client** in Google Cloud Console
- **Expo development vs production** build differences

## 📱 Debug Information

The updated auth service now provides detailed logging:
- Platform detection
- Client ID being used
- Redirect URI configuration
- Auth flow results
- Token exchange details

Check the Metro logs when testing iOS authentication for specific error details.

## 🚀 Next Steps

1. Create iOS OAuth Client ID in Google Cloud Console
2. Update the iOS client ID in your code
3. Test the iOS authentication flow
4. Check console logs for any remaining issues

The web authentication working confirms the basic flow is correct - iOS just needs the proper OAuth client configuration!