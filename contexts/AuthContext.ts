import { User } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    signup: (email: string, password: string, displayName: string) => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook((): AuthContextType => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const loadStoredUser = useCallback(async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser && isMounted) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading stored user:', error);
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    }, [isMounted]);

    useEffect(() => {
        setIsMounted(true);
        loadStoredUser();
        return () => setIsMounted(false);
    }, [loadStoredUser]);

    const saveUser = async (userData: User) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // Mock login - in real app, this would call your backend
            const mockUser: User = {
                id: 'user1',
                displayName: 'John Doe',
                email,
                photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await saveUser(mockUser);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loginWithGoogle = useCallback(async () => {
        setIsLoading(true);
        try {
            // Mock Google login
            const mockUser: User = {
                id: 'user1',
                displayName: 'John Doe',
                email: 'john.doe@gmail.com',
                photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await saveUser(mockUser);
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signup = useCallback(async (email: string, password: string, displayName: string) => {
        setIsLoading(true);
        try {
            // Mock signup
            const mockUser: User = {
                id: 'user1',
                displayName,
                email,
                photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await saveUser(mockUser);
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await AsyncStorage.removeItem('user');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    return {
        user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        signup,
    };
});