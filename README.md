# Thilak Sir Academy Mobile App

This is a React Native mobile application built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/) for Thilak Sir Academy, providing educational content and course management.

## Table of Contents

- [Get Started](#get-started)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Publishing to App Stores](#publishing-to-app-stores)
- [Environment Variables](#environment-variables)
- [Learn More](#learn-more)

## Get Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- EAS CLI (for building and publishing)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_VIMEO_ACCESS_TOKEN=your_vimeo_access_token
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

   You can open the app in:
   - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go) (limited functionality)

## Development

This project uses [file-based routing](https://docs.expo.dev/router/introduction/) with Expo Router. The main directories are:

- **app/** - Application screens and navigation
- **components/** - Reusable React components
- **contexts/** - React Context providers (Auth, Course)
- **lib/** - Utility functions and services (Supabase, Vimeo)
- **types/** - TypeScript type definitions
- **constants/** - App constants and configurations

## Building for Production

### Setup EAS CLI

1. **Install EAS CLI globally**

   ```bash
   npm install -g eas-cli
   ```

2. **Login to your Expo account**

   ```bash
   eas login
   ```

3. **Configure EAS for your project** (if not already done)

   ```bash
   eas build:configure
   ```

### Set Environment Variables for EAS

Add your environment variables as secrets to EAS:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your_supabase_url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_supabase_anon_key"
eas secret:create --scope project --name EXPO_PUBLIC_VIMEO_ACCESS_TOKEN --value "your_vimeo_access_token"
```

### Build Commands

**Build for Android (Production AAB)**
```bash
eas build --platform android --profile production
```

**Build for iOS (Production)**
```bash
eas build --platform ios --profile production
```

**Build for Both Platforms**
```bash
eas build --platform all --profile production
```

**Build Preview APK (for testing)**
```bash
eas build --platform android --profile preview
```

## Publishing to App Stores

### Publishing to Google Play Store

#### Prerequisites

1. **Google Play Console Account**
   - Sign up at [Google Play Console](https://play.google.com/console)
   - Pay the one-time $25 registration fee
   - Create a new app in the console

2. **Create a Service Account** (for automated submission)
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select your existing project
   - Enable the **Google Play Android Developer API**
   - Create a Service Account with appropriate permissions
   - Download the JSON key file
   - In Play Console, go to **Settings → API access** and grant access to the service account

3. **Add Service Account Key to Project**
   
   Place your service account JSON file in the project root (e.g., `thilak-academy-mobile-app-7ff96cae93a7.json`)

#### Update eas.json

Ensure your `eas.json` includes the submit configuration:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./thilak-academy-mobile-app-7ff96cae93a7.json",
        "track": "internal"
      }
    }
  }
}
```

#### Build and Submit

**Option 1: Build and submit separately**
```bash
# Build the app
eas build --platform android --profile production

# After build completes, submit to Play Store
eas submit --platform android --latest
```

**Option 2: Build and auto-submit in one command**
```bash
eas build --platform android --profile production --auto-submit
```

#### Submission Tracks

You can specify different release tracks:

- `internal` - Internal testing (closed testing with up to 100 users)
- `alpha` - Alpha testing (closed testing)
- `beta` - Beta testing (open or closed testing)
- `production` - Production release

```bash
eas submit --platform android --latest --track beta
```

#### Manual Submission

If you prefer manual submission:

1. Build the app: `eas build --platform android --profile production`
2. Download the AAB file from the EAS dashboard
3. Go to Google Play Console
4. Navigate to your app → Production → Create new release
5. Upload the AAB file
6. Fill in release notes and submit for review

#### Store Listing Requirements

Before publishing, prepare:

- **App icon**: 512x512px PNG
- **Feature graphic**: 1024x500px
- **Screenshots**: At least 2 screenshots (phone and tablet if supported)
- **Privacy policy URL**: Required
- **App description**: Short and full description
- **Content rating**: Complete the content rating questionnaire
- **App category**: Education or appropriate category

### Publishing to Apple App Store

#### Prerequisites

1. **Apple Developer Account**
   - Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
   - Complete enrollment and wait for approval

2. **App Store Connect**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create a new app with your bundle identifier: `com.siva.thilak-academy-mobile-app`

3. **Apple Credentials Setup**

   ```bash
   eas credentials
   ```

   Follow the prompts to:
   - Generate or upload distribution certificates
   - Generate or upload provisioning profiles
   - Set up push notification keys (if needed)

#### Update app.json

Ensure your iOS configuration is complete:

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.siva.thilak-academy-mobile-app",
      "buildNumber": "1",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    }
  }
}
```

#### Build and Submit

**Option 1: Build and submit separately**
```bash
# Build the app
eas build --platform ios --profile production

# After build completes, submit to App Store
eas submit --platform ios --latest
```

**Option 2: Build and auto-submit in one command**
```bash
eas build --platform ios --profile production --auto-submit
```

#### App Store Connect Configuration

After submission, configure in App Store Connect:

1. **App Information**
   - Name: Thilak Sir Academy
   - Subtitle (optional)
   - Category: Education
   - Content rights (if applicable)

2. **Pricing and Availability**
   - Set price (Free or Paid)
   - Select countries/regions

3. **App Privacy**
   - Fill out privacy questionnaire
   - Add privacy policy URL

4. **Screenshots and Previews**
   - 6.5" Display (iPhone 14 Pro Max): Required
   - 5.5" Display (iPhone 8 Plus): Required
   - iPad Pro (12.9"): If supporting tablets
   - App preview videos (optional but recommended)

5. **Version Information**
   - Release notes (What's new in this version)
   - Keywords for search
   - Support URL
   - Marketing URL (optional)

6. **App Review Information**
   - Contact information
   - Demo account credentials (if app requires login)
   - Notes for reviewer

7. **Version Release**
   - Automatic release
   - Manual release
   - Scheduled release

#### Submit for Review

```bash
# Submit latest iOS build
eas submit --platform ios --latest

# Or submit specific build ID
eas submit --platform ios --id [BUILD_ID]
```

#### Manual Submission

1. Build the app: `eas build --platform ios --profile production`
2. Download the IPA file from EAS dashboard
3. Use Transporter app to upload to App Store Connect
4. Complete app information in App Store Connect
5. Submit for review

### Build Status and Management

**Check build status**
```bash
eas build:list
```

**View specific build details**
```bash
eas build:view [BUILD_ID]
```

**Cancel a build**
```bash
eas build:cancel [BUILD_ID]
```

**View submission history**
```bash
eas submit:list
```

## Environment Variables

The app uses the following environment variables:

- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `EXPO_PUBLIC_VIMEO_ACCESS_TOKEN` - Vimeo API access token

For EAS builds, set these as secrets:

```bash
eas secret:list  # View all secrets
eas secret:delete --name SECRET_NAME  # Delete a secret
```

## Version Management

### Update Version

Edit `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",  // Increment version
    "android": {
      "versionCode": 2  // Auto-incremented if autoIncrement is enabled
    },
    "ios": {
      "buildNumber": "2"  // Auto-incremented if autoIncrement is enabled
    }
  }
}
```

The `eas.json` configuration includes `autoIncrement: true` for production builds, which automatically increments version codes.

## Troubleshooting

### Build Failures

1. Check build logs: `eas build:view [BUILD_ID]`
2. Verify all environment variables are set correctly
3. Ensure bundle identifiers match in `app.json` and developer accounts

### Submission Failures

**Android:**
- Verify service account has proper permissions in Play Console
- Check that AAB is properly signed
- Ensure version code is higher than previous releases

**iOS:**
- Verify Apple Developer account is in good standing
- Check that bundle identifier matches App Store Connect
- Ensure all required app information is filled in App Store Connect

### Common Issues

**"Version code already exists"**
- Increment version code in `app.json` or use `autoIncrement` in `eas.json`

**"Invalid signature"**
- Regenerate credentials: `eas credentials`

**"Missing privacy policy"**
- Add privacy policy URL in store listings

## Learn More

To learn more about developing and deploying with Expo:

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)

## Support

For issues and questions:
- Check [Expo Forums](https://forums.expo.dev/)
- Join [Expo Discord](https://chat.expo.dev)
- Review [Expo GitHub Issues](https://github.com/expo/expo/issues)

