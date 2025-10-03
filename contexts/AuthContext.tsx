import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    signOut: async () => { },
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (isMounted) {
                    if (session?.user) {
                        setSession(session);
                        setUser(session.user);
                    }
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error getting initial session:', error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                // Skip initial session events to prevent loops
                if (event === 'INITIAL_SESSION') {
                    return;
                }

                if (session?.user) {
                    setSession(session);
                    setUser(session.user);
                } else {
                    setSession(null);
                    setUser(null);
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            setIsLoading(true);

            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error signing out:', error);
            }
        } catch (error) {
            console.error('Error during sign out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
