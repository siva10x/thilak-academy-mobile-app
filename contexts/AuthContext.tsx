import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import GoogleAuthService, { GoogleUser } from '../services/googleAuth';

interface AuthContextType {
    user: GoogleUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state on mount
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            setIsLoading(true);

            // Add a small delay to ensure AsyncStorage is ready
            await new Promise(resolve => setTimeout(resolve, 100));

            // Check if user is already signed in
            const currentUser = GoogleAuthService.getCurrentUser();
            const isSignedIn = GoogleAuthService.isSignedIn();

            console.log('Auth initialization - User:', currentUser?.email, 'Signed in:', isSignedIn);

            if (currentUser && isSignedIn) {
                setUser(currentUser);
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async () => {
        try {
            setIsLoading(true);
            const user = await GoogleAuthService.signIn();
            console.log('Sign in successful:', user.email);
            setUser(user);

            // Force a small delay to ensure state is updated
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setIsLoading(true);
            await GoogleAuthService.signOut();
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const refreshAuth = async () => {
        try {
            await GoogleAuthService.refreshToken();
            const currentUser = GoogleAuthService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error refreshing auth:', error);
            // If refresh fails, sign out user
            await signOut();
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;