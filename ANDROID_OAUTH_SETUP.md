# Android Google OAuth Setup Guide

## 🤖 Android OAuth Configuration

Your Android authentication should work with the current setup, but here's what you need to verify in Google Cloud Console:

## 🔧 Required Google Cloud Console Setup for Android

### 1. Create Android OAuth Client ID

1. **Go to Google Cloud Console** → Credentials
2. **Click "Create Credentials"** → OAuth 2.0 Client ID  
3. **Select "Android"** as application type
4. **Configure Android settings**:
   - **Package name**: `com.siva.thilakacademymobileapp`
   - **SHA-1 certificate fingerprint**: (see below)

### 1.1. IMPORTANT: No Manual Redirect URI Setup Needed

❗ **Key Point**: Unlike web OAuth clients, Android OAuth clients in Google Cloud Console **do not have a field to manually add redirect URIs**. 

Google automatically accepts redirect URIs in the format:
- `com.yourpackage:/oauth2redirect`
- Based on your **package name** and **SHA-1 fingerprint**

The redirect URI is automatically validated against:
- ✅ **Package name**: `com.siva.thilakacademymobileapp`
- ✅ **SHA-1 fingerprint**: From your debug/release keystore

### 2. Get SHA-1 Fingerprint

For **development/testing** with Expo:
```bash
# Expo development keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

For **production** builds:
```bash
# Your release keystore (when you create one)
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

### 3. Current Android Configuration

Your `app.json` is configured with:
```json
{
  "android": {
    "package": "com.siva.thilakacademymobileapp",
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [{"scheme": "thilakacademymobileapp"}],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  }
}
```

### 4. Android OAuth Flow

- **Redirect URI**: `com.siva.thilakacademymobileapp:/oauth2redirect` (automatically validated)
- **Package Name**: `com.siva.thilakacademymobileapp`  
- **Custom Scheme**: `com.siva.thilakacademymobileapp://`
- **No client secret needed** (just like iOS)
- **No manual redirect URI setup** in Google Console (unlike web clients)

## 🧪 Testing Android Authentication

1. **Start Expo development server**: `npx expo start -c`
2. **Open on Android device/emulator**: Press `a` or scan QR code
3. **Try Google login**: Should open Google OAuth in browser
4. **Check console logs**: Look for Android-specific debugging info

## 📱 Expected Android OAuth Flow

1. User taps "Continue with Google"
2. Opens Google OAuth in Android browser/Chrome Custom Tabs
3. User signs in and grants permissions  
4. Google redirects to: `com.siva.thilakacademymobileapp:/oauth2redirect?code=...`
5. Android app handles the redirect via intent filter
6. Code exchanged for tokens, user authenticated

## 🔍 Common Android Issues

- **Missing SHA-1 fingerprint** in Google Console
- **Package name mismatch** between app.json and Google Console
- **Intent filter not working** (need to rebuild/restart)
- **Using wrong client ID** (iOS instead of Android)

## ⚡ Debug Information

The auth service provides detailed logging:
- Platform detection (should show "android")
- Android package name verification  
- Redirect URI being used
- OAuth flow step-by-step results

## 📋 Checklist for Android

- ✅ **iOS working** (confirms basic OAuth flow)
- ✅ **Android intent filters** configured in app.json
- ⚠️ **Android OAuth client ID** created in Google Console
- ⚠️ **SHA-1 fingerprint** added to Google Console
- ⚠️ **Package name** matches exactly

If you encounter any issues, check the Metro logs for Android-specific error details!