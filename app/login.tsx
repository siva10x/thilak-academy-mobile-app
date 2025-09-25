import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
    const [isLoadingGoogleLogin, setIsLoadingGoogleLogin] = useState(false);



    const handleGoogleLogin = async () => {
        setIsLoadingGoogleLogin(true);

        // Simulate Google login
        setTimeout(() => {
            setIsLoadingGoogleLogin(false);
            // Navigate to home screen (tabs)
            router.replace('/(tabs)');
        }, 2000);
    };



    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            enabled={true}
        >
            <View style={styles.gradient}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    scrollEventThrottle={16}
                >
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBackground}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop&crop=center' }}
                                    style={styles.logoImage}
                                />
                            </View>
                        </View>
                        <Text style={styles.appTitle}>Thilak Academy</Text>
                        <Text style={styles.subtitle}>Unlock Your Potential</Text>
                        <Text style={styles.welcomeMessage}>
                            Sign in with Google to access world-class learning content
                        </Text>
                    </View>

                    {/* Google Login Button */}
                    <TouchableOpacity
                        style={[styles.googleButton, isLoadingGoogleLogin && styles.buttonDisabled]}
                        onPress={handleGoogleLogin}
                        disabled={isLoadingGoogleLogin}
                        activeOpacity={0.9}
                    >
                        <View style={styles.googleButtonContent}>
                            {isLoadingGoogleLogin ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#4285f4" />
                                    <Text style={styles.googleButtonText}>
                                        Signing in...
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.googleIconContainer}>
                                        <Image
                                            source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                                            style={styles.googleIcon}
                                        />
                                    </View>
                                    <Text style={styles.googleButtonText}>
                                        Continue with Google
                                    </Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        minHeight: '100%',
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
        width: '100%',
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 32,
        alignItems: 'center',
    },
    logoBackground: {
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
        overflow: 'hidden',
    },
    logoImage: {
        width: 120,
        height: 120,
        borderRadius: 30,
    },

    logo: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    appTitle: {
        fontSize: 38,
        fontWeight: '900',
        color: '#000000',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.7)',
        textAlign: 'center',
        letterSpacing: 0.5,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    welcomeMessage: {
        fontSize: 17,
        color: 'rgba(0, 0, 0, 0.6)',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 32,
        fontWeight: '500',
    },
    formContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 32,
        padding: 40,
        marginBottom: 32,
        marginHorizontal: 8,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    loginTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    loginSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    otpLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.border,
        paddingHorizontal: 20,
        height: 60,
    },
    inputWrapperFocused: {
        borderColor: Colors.primary,
        backgroundColor: '#F8FAFC',
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputWrapperError: {
        borderColor: Colors.error,
        backgroundColor: '#FEF2F2',
        shadowColor: Colors.error,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    errorText: {
        fontSize: 12,
        color: Colors.error,
        marginTop: 6,
        marginLeft: 4,
        fontWeight: '500',
    },
    otpInputWrapper: {
        justifyContent: 'center',
    },
    inputIcon: {
        marginRight: 12,
    },
    validationIcon: {
        marginLeft: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        letterSpacing: 0,
    },
    otpInput: {
        textAlign: 'center',
        fontSize: 24,
        letterSpacing: 8,
        fontWeight: '600',
    },
    eyeIcon: {
        padding: 4,
    },
    primaryButton: {
        borderRadius: 16,
        height: 60,
        marginBottom: 20,
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        height: 60,
    },
    buttonLoader: {
        marginRight: 8,
    },
    primaryButtonText: {
        color: Colors.surface,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    disabledButtonText: {
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0.1,
    },
    resendButton: {
        alignItems: 'center',
        marginBottom: 20,
    },
    resendButtonText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: Colors.textSecondary,
    },
    googleButton: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        height: 64,
        borderWidth: 2,
        borderColor: '#dadce0',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        marginHorizontal: 24,
        marginBottom: 40,
    },
    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingHorizontal: 24,
    },
    googleIconContainer: {
        width: 28,
        height: 28,
        marginRight: 16,
        borderRadius: 4,
        overflow: 'hidden',
    },
    googleIcon: {
        width: 28,
        height: 28,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleLoader: {
        marginRight: 12,
    },
    googleButtonText: {
        color: '#3c4043',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    securityNote: {
        alignItems: 'center',
        marginTop: 8,
    },
    securityText: {
        fontSize: 13,
        color: '#666666',
        textAlign: 'center',
        fontWeight: '500',
        opacity: 0.8,
    },
    footer: {
        alignItems: 'center',
        marginTop: 32,
    },
    footerText: {
        fontSize: 13,
        color: '#000000',
        textAlign: 'center',
        opacity: 0.5,
        lineHeight: 18,
        paddingHorizontal: 32,
        fontWeight: '400',
    },
});