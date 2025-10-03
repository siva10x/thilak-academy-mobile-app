# Environment Variables for Google OAuth

## Setup Instructions

To complete the Google OAuth setup, you need to create environment variables for sensitive data.

### 1. Create a `.env` file in your project root:

```bash
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET=your_actual_web_client_secret_here
```

### 2. Get your Web Client Secret:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "Credentials"
3. Find your Web OAuth 2.0 Client ID
4. Click on it to view details
5. Copy the "Client secret" value
6. Paste it in your `.env` file

### 3. Update the Google Auth Service:

Replace `'YOUR_WEB_CLIENT_SECRET'` in `/services/googleAuth.ts` with:
```typescript
web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET || 'YOUR_WEB_CLIENT_SECRET',
```

### 4. Security Notes:

- ⚠️ **Never commit `.env` files to version control**
- Add `.env` to your `.gitignore` file
- For production, use secure environment variable management
- Web client secrets are required for server-side token exchange

### 5. Alternative Approach (Direct Update):

If you prefer not to use environment variables for development, you can directly update the client secret in `services/googleAuth.ts`:

```typescript
clientSecret: {
    web: 'your_actual_client_secret_here', // Replace with real secret
},
```

But remember to never commit real secrets to version control!