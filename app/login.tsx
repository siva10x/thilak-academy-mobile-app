import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
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
                Alert.alert('Success', 'Login successful!', [
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

    const handleTermsPress = () => {
        // Replace with your actual Terms of Service URL
        Linking.openURL('https://www.termsfeed.com/live/d5e4a1c3-35fd-45d6-beaf-176f3a61f1e1');
    };

    const handlePrivacyPress = () => {
        // Replace with your actual Privacy Policy URL
        Linking.openURL('https://www.termsfeed.com/live/6366f819-6df3-41ef-82e2-58f5b3b1e7bc');
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
                        <Text style={styles.appTitle}>Thilak Sir Academy</Text>
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
                                            placeholderTextColor={Colors.textSecondary}
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
                                            placeholderTextColor={Colors.textSecondary}
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
                        <Text style={styles.footerText}>By continuing, you agree to our </Text>
                        <View style={styles.footerLinksContainer}>
                            <TouchableOpacity onPress={handleTermsPress} activeOpacity={0.7}>
                                <Text style={styles.footerLink}>Terms of Service</Text>
                            </TouchableOpacity>
                            <Text style={styles.footerText}> and </Text>
                            <TouchableOpacity onPress={handlePrivacyPress} activeOpacity={0.7}>
                                <Text style={styles.footerLink}>Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>
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
        paddingVertical: 50,
        minHeight: '100%',
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 16,
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
        fontSize: 38,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -1.5,
    },
    subtitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#667eea',
        textAlign: 'center',
        letterSpacing: 0.2,
        marginBottom: 12,
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
        padding: 20,
        marginBottom: 20,
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
    inputContainer: {
        marginBottom: 24,
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
    textInput: {
        flex: 1,
        fontSize: 18,
        color: '#1f2937',
        letterSpacing: 0.2,
        fontWeight: '500',
        paddingVertical: 1,
    },
    otpInput: {
        textAlign: 'center',
        fontSize: 28,
        letterSpacing: 10,
        fontWeight: '700',
        color: '#667eea',
    },
    primaryButton: {
        borderRadius: 20,
        height: 60,
        marginBottom: 20,
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
    footer: {
        alignItems: 'center',
        marginTop: 32,
        paddingHorizontal: 32,
    },
    footerText: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: 18,
        fontWeight: '500',
    },
    footerLinksContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    footerLink: {
        fontSize: 13,
        color: '#667eea',
        fontWeight: '600',
        textDecorationLine: 'underline',
        lineHeight: 18,
    },
});