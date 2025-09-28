import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete the auth session
WebBrowser.maybeCompleteAuthSession();

// Environment detection
const isWeb = Platform.OS === 'web';
const isDevelopment = __DEV__;

// Google OAuth configuration
const GOOGLE_OAUTH_CONFIG = {
    clientId: {
        // You'll need to replace these with your actual Google OAuth client IDs
        // Get them from Google Cloud Console: https://console.cloud.google.com/
        ios: '711807234603-rsr495k4lmotqr73h9gfrbccaovtjhvn.apps.googleusercontent.com',
        android: '711807234603-pp2hhnsir0p5p6241obod30qob4e0ion.apps.googleusercontent.com',
        web: '711807234603-1f3ruk245od4m6q90qnv4arc6gds76id.apps.googleusercontent.com',
    },
    clientSecret: {
        // IMPORTANT: Only needed for web development. Get this from Google Cloud Console
        // DO NOT commit real secrets to version control in production!
        web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET || 'YOUR_WEB_CLIENT_SECRET',
    },
    scopes: ['openid', 'profile', 'email'],
    additionalParameters: {},
    customParameters: {
        prompt: 'select_account',
    },
    // Local development configuration
    development: {
        redirectUri: 'http://localhost:8081/api/auth/callback',
        origin: 'http://localhost:8081',
    },
};

export interface GoogleUser {
    id: string;
    email: string;
    name: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    expiresIn?: number;
}

class GoogleAuthService {
    private static instance: GoogleAuthService;
    private currentUser: GoogleUser | null = null;
    private authTokens: AuthTokens | null = null;

    public static getInstance(): GoogleAuthService {
        if (!GoogleAuthService.instance) {
            GoogleAuthService.instance = new GoogleAuthService();
        }
        return GoogleAuthService.instance;
    }

    private constructor() {
        this.loadStoredAuth();
    }

    /**
     * Load stored authentication data from AsyncStorage
     */
    private async loadStoredAuth(): Promise<void> {
        try {
            const [storedUser, storedTokens] = await Promise.all([
                AsyncStorage.getItem('google_user'),
                AsyncStorage.getItem('auth_tokens'),
            ]);

            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                console.log('Loaded stored user:', this.currentUser?.email);
            }

            if (storedTokens) {
                this.authTokens = JSON.parse(storedTokens);
                console.log('Loaded stored tokens');
            }
        } catch (error) {
            console.error('Error loading stored auth:', error);
        }
    }

    /**
     * Store authentication data in AsyncStorage
     */
    private async storeAuth(user: GoogleUser, tokens: AuthTokens): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.setItem('google_user', JSON.stringify(user)),
                AsyncStorage.setItem('auth_tokens', JSON.stringify(tokens)),
            ]);
        } catch (error) {
            console.error('Error storing auth:', error);
        }
    }

    /**
     * Clear stored authentication data
     */
    private async clearStoredAuth(): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.removeItem('google_user'),
                AsyncStorage.removeItem('auth_tokens'),
            ]);
        } catch (error) {
            console.error('Error clearing stored auth:', error);
        }
    }

    /**
     * Get the appropriate client ID for the current platform
     */
    private getClientId(): string {
        if (Platform.OS === 'ios') {
            return GOOGLE_OAUTH_CONFIG.clientId.ios;
        } else if (Platform.OS === 'android') {
            return GOOGLE_OAUTH_CONFIG.clientId.android;
        } else {
            return GOOGLE_OAUTH_CONFIG.clientId.web;
        }
    }

    /**
     * Create Google OAuth discovery document
     */
    private getDiscovery(): AuthSession.DiscoveryDocument {
        return {
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
            revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
            userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
        };
    }

    /**
     * Sign in with Google
     */
    async signIn(): Promise<GoogleUser> {
        try {
            const clientId = this.getClientId();
            const discovery = this.getDiscovery();

            // Create redirect URI based on environment and platform
            let redirectUri: string;

            if (isWeb && isDevelopment) {
                // Use localhost for local web development
                redirectUri = GOOGLE_OAUTH_CONFIG.development.redirectUri;
            } else if (Platform.OS === 'ios') {
                // For iOS, construct the redirect URI using the client ID (Google OAuth standard for iOS)
                const iosClientId = GOOGLE_OAUTH_CONFIG.clientId.ios;
                redirectUri = `${iosClientId.split('.').reverse().join('.')}:/oauth2redirect`;
            } else if (Platform.OS === 'android') {
                // For Android, use the package name in reverse domain format (Google OAuth standard)
                // This matches what Google expects for Android OAuth clients
                redirectUri = 'com.siva.thilakacademymobileapp:/oauth2redirect';
            } else {
                // Fallback: try to use Expo's redirect URI generator
                redirectUri = AuthSession.makeRedirectUri({
                    scheme: 'thilakacademymobileapp',
                });
            }

            console.log('Platform:', Platform.OS, 'Using redirect URI:', redirectUri);

            // Create auth request
            const authRequestConfig: AuthSession.AuthRequestConfig = {
                clientId,
                scopes: GOOGLE_OAUTH_CONFIG.scopes,
                redirectUri,
                responseType: AuthSession.ResponseType.Code,
                extraParams: GOOGLE_OAUTH_CONFIG.customParameters,
            };

            const authRequest = new AuthSession.AuthRequest(authRequestConfig);

            // Prompt for authentication with platform-specific options
            let promptOptions: any = {};

            if (isWeb && isDevelopment) {
                // For web development, we need to handle the callback differently
                promptOptions = {
                    windowFeatures: 'width=500,height=600',
                    showInRecents: false,
                };
            } else if (Platform.OS === 'ios') {
                // For iOS, use default options but ensure proper URL scheme handling
                promptOptions = {
                    showInRecents: false,
                };
            }

            console.log(`Starting OAuth flow for ${Platform.OS} platform...`);
            console.log('Auth request config:', {
                clientId: clientId.substring(0, 20) + '...',
                redirectUri,
                scopes: GOOGLE_OAUTH_CONFIG.scopes,
            });

            // Platform-specific validation
            if (Platform.OS === 'ios') {
                console.log('iOS Bundle ID should match:', 'com.siva.thilak-academy-mobile-app');
                console.log('iOS URL scheme should be:', 'thilakacademymobileapp');
            } else if (Platform.OS === 'android') {
                console.log('Android Package should match:', 'com.siva.thilakacademymobileapp');
                console.log('Android URL scheme should be:', 'thilakacademymobileapp');
            }

            console.log('About to start OAuth prompt...');
            const authResult = await authRequest.promptAsync(discovery, promptOptions);

            console.log('OAuth prompt completed with result type:', authResult.type);

            if (authResult.type === 'success') {
                console.log('✅ OAuth SUCCESS! Details:', {
                    hasCode: !!authResult.params.code,
                    hasState: !!authResult.params.state,
                    redirectUrl: authResult.url,
                });
            } else if (authResult.type === 'cancel') {
                console.log('❌ OAuth CANCELLED by user');
            } else if (authResult.type === 'dismiss') {
                console.log('❌ OAuth DISMISSED');
            } else {
                console.log('❓ OAuth result details:', authResult);
            }

            if (authResult.type !== 'success') {
                const errorMessage = authResult.type === 'cancel'
                    ? 'Authentication was cancelled by user'
                    : `Authentication failed: ${authResult.type}`;
                console.error('Authentication failed:', authResult);
                throw new Error(errorMessage);
            }            // Exchange code for tokens
            const tokenExchangeConfig: any = {
                clientId,
                code: authResult.params.code,
                redirectUri,
                extraParams: {
                    code_verifier: authRequest.codeVerifier || '',
                },
            };

            // For web applications, include client secret
            if (isWeb && GOOGLE_OAUTH_CONFIG.clientSecret.web && GOOGLE_OAUTH_CONFIG.clientSecret.web !== 'YOUR_WEB_CLIENT_SECRET') {
                tokenExchangeConfig.clientSecret = GOOGLE_OAUTH_CONFIG.clientSecret.web;
            }

            console.log('Token exchange config:', {
                ...tokenExchangeConfig,
                clientSecret: tokenExchangeConfig.clientSecret ? '[HIDDEN]' : 'not included',
                platform: Platform.OS
            });

            let tokenResult;
            try {
                tokenResult = await AuthSession.exchangeCodeAsync(tokenExchangeConfig, discovery);
                console.log('Token exchange successful, received access token:', !!tokenResult.accessToken);
            } catch (tokenError) {
                console.error('Token exchange failed:', tokenError);
                const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown error';
                throw new Error(`Token exchange failed: ${errorMessage}`);
            }

            // Get user info
            const userInfoResponse = await fetch(
                `${discovery.userInfoEndpoint}?access_token=${tokenResult.accessToken}`
            );

            if (!userInfoResponse.ok) {
                throw new Error('Failed to fetch user information');
            }

            const userInfo = await userInfoResponse.json();

            // Create user object
            const user: GoogleUser = {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                given_name: userInfo.given_name,
                family_name: userInfo.family_name,
            };

            // Create tokens object
            const tokens: AuthTokens = {
                accessToken: tokenResult.accessToken,
                refreshToken: tokenResult.refreshToken,
                idToken: tokenResult.idToken,
                expiresIn: tokenResult.expiresIn,
            };

            // Store authentication data
            this.currentUser = user;
            this.authTokens = tokens;
            await this.storeAuth(user, tokens);

            return user;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    }

    /**
     * Sign out
     */
    async signOut(): Promise<void> {
        try {
            // Revoke tokens if available
            if (this.authTokens?.accessToken) {
                const discovery = this.getDiscovery();
                await AuthSession.revokeAsync({
                    token: this.authTokens.accessToken,
                    clientId: this.getClientId(),
                }, discovery);
            }

            // Clear stored data
            this.currentUser = null;
            this.authTokens = null;
            await this.clearStoredAuth();
        } catch (error) {
            console.error('Google sign out error:', error);
            throw error;
        }
    }

    /**
     * Get current user
     */
    getCurrentUser(): GoogleUser | null {
        return this.currentUser;
    }

    /**
     * Get current auth tokens
     */
    getAuthTokens(): AuthTokens | null {
        return this.authTokens;
    }

    /**
     * Check if user is signed in
     */
    isSignedIn(): boolean {
        return this.currentUser !== null && this.authTokens !== null;
    }

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<AuthTokens> {
        if (!this.authTokens?.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const discovery = this.getDiscovery();
            const tokenResult = await AuthSession.refreshAsync({
                clientId: this.getClientId(),
                refreshToken: this.authTokens.refreshToken,
            }, discovery);

            const newTokens: AuthTokens = {
                accessToken: tokenResult.accessToken,
                refreshToken: tokenResult.refreshToken || this.authTokens.refreshToken,
                idToken: tokenResult.idToken,
                expiresIn: tokenResult.expiresIn,
            };

            this.authTokens = newTokens;

            if (this.currentUser) {
                await this.storeAuth(this.currentUser, newTokens);
            }

            return newTokens;
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }
}

export default GoogleAuthService.getInstance();