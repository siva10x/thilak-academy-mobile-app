import { Colors, Gradients } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const { login, loginWithGoogle, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await login(email, password);
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert('Login Failed', 'Please check your credentials and try again');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert('Login Failed', 'Google login failed. Please try again');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={Gradients.hero} style={styles.background}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <Text style={styles.logo}>📚 EduStream</Text>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>Sign in to continue learning</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Mail size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Password"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} color={Colors.textSecondary} />
                                    ) : (
                                        <Eye size={20} color={Colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.loginButton, isLoading && styles.disabledButton]}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                <LinearGradient colors={Gradients.primary} style={styles.buttonGradient}>
                                    <Text style={styles.loginButtonText}>
                                        {isLoading ? 'Signing In...' : 'Sign In'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                <Text style={styles.googleIcon}>🔍</Text>
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                                    <Text style={styles.signupLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.surface,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        padding: 4,
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonGradient: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: Colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    dividerText: {
        color: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 16,
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        height: 56,
        gap: 12,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    googleIcon: {
        fontSize: 20,
    },
    googleButtonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    signupLink: {
        color: Colors.surface,
        fontSize: 14,
        fontWeight: '600',
    },
});