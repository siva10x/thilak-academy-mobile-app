# Google OAuth Configuration

To use Google authentication in this app, you need to set up Google OAuth credentials:

## Setup Instructions

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Create credentials for:
   - **iOS**: Bundle ID should match your app.json `ios.bundleIdentifier`
   - **Android**: Package name should match your app.json `android.package`
   - **Web**: For Expo development

## Required Client IDs

You need to replace the placeholder values in `/services/googleAuth.ts`:

```typescript
const GOOGLE_OAUTH_CONFIG = {
  clientId: {
    ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com', 
    web: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  },
  // ... rest of config
};
```

## App Configuration

Also update the `/app.json` file:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
        }
      ]
    ]
  }
}
```

## Bundle/Package Identifiers

Current app identifiers:
- iOS Bundle ID: `com.siva.thilak-academy-mobile-app`
- Android Package: `com.siva.thilakacademymobileapp`

Make sure these match your Google OAuth configuration.

## Testing

- For Expo development builds, use the web client ID
- For production builds, use platform-specific client IDs
- Test the authentication flow thoroughly on both platforms

## Security Notes

- Keep your client IDs secure
- Never commit secret keys to version control
- Use environment variables for production deployments