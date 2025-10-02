import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoadingOtp, setIsLoadingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendOtp = async () => {
        if (!email.trim()) {
            setEmailError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setEmailError('');
        setIsLoadingOtp(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email.trim().toLowerCase(),
                options: {
                    shouldCreateUser: true,
                }
            });

            if (error) {
                Alert.alert('Error', error.message);
                return;
            }

            setShowOtpInput(true);
            Alert.alert('Success', 'Please check your email for the verification code');
        } catch (error) {
            Alert.alert('Error', 'Failed to send verification code. Please try again.');
        } finally {
            setIsLoadingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            setOtpError('OTP is required');
            return;
        }

        if (otp.length < 6) {
            setOtpError('Please enter the complete 6-digit code');
            return;
        }

        setOtpError('');
        setIsVerifyingOtp(true);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: email.trim().toLowerCase(),
                token: otp.trim(),
                type: 'email'
            });

            if (error) {
                setOtpError('Invalid or expired code. Please try again.');
                return;
            }

            if (data.user) {
                // Show success message and navigate immediately
                Alert.alert('Success', 'Login successful! Redirecting...', [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate immediately after alert is dismissed
                            router.replace('/(tabs)');
                        }
                    }
                ]);

                // Also try automatic navigation after a short delay as backup
                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 1000);
            } else {
                setOtpError('Login failed. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to verify code. Please try again.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };



    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            enabled={true}
        >
            <View style={styles.gradient}>
                <View style={styles.backgroundPattern} />
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
                                    source={require('../assets/images/thilak_logo.jpg')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.logoGlow} />
                        </View>
                        <Text style={styles.appTitle}>Thilak Academy</Text>
                        <Text style={styles.subtitle}>Unlock Your Potential</Text>
                        {showOtpInput && (
                            <Text style={styles.welcomeMessage}>
                                We've sent a verification code to {email}
                            </Text>
                        )}
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        {!showOtpInput ? (
                            <>
                                {/* Email Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Email Address</Text>
                                    <View style={[
                                        styles.inputWrapper,
                                        emailError ? styles.inputWrapperError : null
                                    ]}>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChangeText={(text) => {
                                                setEmail(text);
                                                if (emailError) setEmailError('');
                                            }}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoComplete="email"
                                            editable={!isLoadingOtp}
                                        />
                                    </View>
                                    {emailError ? (
                                        <Text style={styles.errorText}>{emailError}</Text>
                                    ) : null}
                                </View>

                                {/* Send OTP Button */}
                                <TouchableOpacity
                                    style={[styles.primaryButton, isLoadingOtp && styles.buttonDisabled]}
                                    onPress={handleSendOtp}
                                    disabled={isLoadingOtp}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.buttonGradient}>
                                        {isLoadingOtp && (
                                            <ActivityIndicator
                                                size="small"
                                                color="#ffffff"
                                                style={styles.buttonLoader}
                                            />
                                        )}
                                        <Text style={[styles.primaryButtonText, isLoadingOtp && styles.disabledButtonText]}>
                                            {isLoadingOtp ? 'Sending Code...' : 'Send Verification Code'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {/* OTP Input */}
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Verification Code</Text>
                                    <Text style={styles.otpLabel}>
                                        Enter the 6-digit code sent to your email
                                    </Text>
                                    <View style={[
                                        styles.inputWrapper,
                                        styles.otpInputWrapper,
                                        otpError ? styles.inputWrapperError : null
                                    ]}>
                                        <TextInput
                                            style={[styles.textInput, styles.otpInput]}
                                            placeholder="000000"
                                            value={otp}
                                            onChangeText={(text) => {
                                                setOtp(text.replace(/[^0-9]/g, ''));
                                                if (otpError) setOtpError('');
                                            }}
                                            keyboardType="numeric"
                                            maxLength={6}
                                            editable={!isVerifyingOtp}
                                        />
                                    </View>
                                    {otpError ? (
                                        <Text style={styles.errorText}>{otpError}</Text>
                                    ) : null}
                                </View>

                                {/* Verify OTP Button */}
                                <TouchableOpacity
                                    style={[styles.primaryButton, isVerifyingOtp && styles.buttonDisabled]}
                                    onPress={handleVerifyOtp}
                                    disabled={isVerifyingOtp}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.buttonGradient}>
                                        {isVerifyingOtp && (
                                            <ActivityIndicator
                                                size="small"
                                                color="#ffffff"
                                                style={styles.buttonLoader}
                                            />
                                        )}
                                        <Text style={[styles.primaryButtonText, isVerifyingOtp && styles.disabledButtonText]}>
                                            {isVerifyingOtp ? 'Verifying...' : 'Verify & Sign In'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Resend Button */}
                                <TouchableOpacity
                                    style={styles.resendButton}
                                    onPress={() => {
                                        setShowOtpInput(false);
                                        setOtp('');
                                        setOtpError('');
                                    }}
                                    disabled={isVerifyingOtp}
                                >
                                    <Text style={styles.resendButtonText}>
                                        Didn't receive the code? Try again
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

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
        backgroundColor: '#f8fafc',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(102, 126, 234, 0.03)',
        opacity: 0.7,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
        minHeight: '100%',
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 48,
        width: '100%',
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 40,
        alignItems: 'center',
    },
    logoBackground: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    logoImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    logoGlow: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
        top: -5,
        left: -5,
        zIndex: -1,
    },

    appTitle: {
        fontSize: 42,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -1.5,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#667eea',
        textAlign: 'center',
        letterSpacing: 0.2,
        marginBottom: 24,
        fontStyle: 'normal',
    },
    welcomeMessage: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 32,
        fontWeight: '500',
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 32,
        padding: 40,
        marginBottom: 40,
        marginHorizontal: 20,
        width: '100%',
        maxWidth: 400,
        shadowColor: 'rgba(102, 126, 234, 0.3)',
        shadowOffset: {
            width: 0,
            height: 16,
        },
        shadowOpacity: 0.25,
        shadowRadius: 32,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
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
        marginBottom: 32,
        width: '100%',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        marginLeft: 6,
    },
    otpLabel: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(203, 213, 225, 0.5)',
        paddingHorizontal: 24,
        paddingVertical: 4,
        height: 72,
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 3,
    },
    inputWrapperFocused: {
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.08)',
        shadowColor: '#667eea',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    inputWrapperError: {
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        shadowColor: '#ef4444',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },
    errorText: {
        fontSize: 13,
        color: '#ef4444',
        marginTop: 8,
        marginLeft: 6,
        fontWeight: '600',
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
        fontSize: 18,
        color: '#1f2937',
        letterSpacing: 0.2,
        fontWeight: '500',
        paddingVertical: 4,
    },
    otpInput: {
        textAlign: 'center',
        fontSize: 28,
        letterSpacing: 10,
        fontWeight: '700',
        color: '#667eea',
    },
    eyeIcon: {
        padding: 4,
    },
    primaryButton: {
        borderRadius: 20,
        height: 72,
        marginBottom: 28,
        marginTop: 8,
        backgroundColor: '#667eea',
        shadowColor: '#667eea',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        height: 72,
    },
    buttonLoader: {
        marginRight: 8,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 19,
        fontWeight: '700',
        letterSpacing: 0.3,
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
        marginTop: 16,
        marginBottom: 24,
        paddingVertical: 12,
    },
    resendButtonText: {
        color: '#667eea',
        fontSize: 15,
        fontWeight: '600',
        textDecorationLine: 'underline',
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
        color: '#64748b',
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: 18,
        paddingHorizontal: 32,
        fontWeight: '500',
    },
});