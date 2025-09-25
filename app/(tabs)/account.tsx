import { Colors, Gradients } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Award, BookOpen, Calendar, ChevronRight, LogOut, Settings } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccountScreen() {
    const authContext = useAuth();
    const courseContext = useCourses();

    const user = authContext?.user || null;
    const logout = authContext?.logout || (() => Promise.resolve());
    const enrollments = courseContext?.enrollments || [];

    const handleLogout = async () => {
        await logout();
        router.replace('/auth/login');
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <View style={styles.authPrompt}>
                    <Text style={styles.authTitle}>Account</Text>
                    <Text style={styles.authSubtitle}>
                        Please sign in to view your account
                    </Text>
                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={() => router.push('/auth/login')}
                    >
                        <LinearGradient colors={Gradients.primary} style={styles.signInGradient}>
                            <Text style={styles.signInText}>Sign In</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const activeEnrollments = enrollments.filter(e => e.status === 'active');

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <LinearGradient colors={Gradients.hero} style={styles.header}>
                    <View style={styles.profileSection}>
                        <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user.displayName}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            <Text style={styles.joinDate}>
                                Member since {user.createdAt.toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <BookOpen size={24} color={Colors.primary} />
                        <Text style={styles.statNumber}>{activeEnrollments.length}</Text>
                        <Text style={styles.statLabel}>Active Courses</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Calendar size={24} color={Colors.secondary} />
                        <Text style={styles.statNumber}>
                            {Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                        </Text>
                        <Text style={styles.statLabel}>Days Learning</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Award size={24} color={Colors.accent} />
                        <Text style={styles.statNumber}>5</Text>
                        <Text style={styles.statLabel}>Certificates</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Enrollments</Text>

                    {activeEnrollments.length === 0 ? (
                        <View style={styles.emptyEnrollments}>
                            <Text style={styles.emptyIcon}>📚</Text>
                            <Text style={styles.emptyTitle}>No Active Enrollments</Text>
                            <Text style={styles.emptySubtitle}>
                                Explore courses to start your learning journey
                            </Text>
                        </View>
                    ) : (
                        activeEnrollments.map((enrollment) => (
                            <View key={enrollment.id} style={styles.enrollmentCard}>
                                <View style={styles.enrollmentInfo}>
                                    <Text style={styles.enrollmentTitle}>Course ID: {enrollment.courseId}</Text>
                                    <Text style={styles.enrollmentDate}>
                                        Enrolled: {enrollment.enrolledAt.toLocaleDateString()}
                                    </Text>
                                    <Text style={styles.enrollmentExpiry}>
                                        Expires: {enrollment.expiryDate.toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, styles.activeBadge]}>
                                    <Text style={styles.statusText}>Active</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <Settings size={20} color={Colors.textSecondary} />
                        <Text style={styles.settingText}>App Settings</Text>
                        <ChevronRight size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                        <LogOut size={20} color={Colors.error} />
                        <Text style={[styles.settingText, styles.logoutText]}>Sign Out</Text>
                        <ChevronRight size={20} color={Colors.error} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 32,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 16,
        borderWidth: 3,
        borderColor: Colors.surface,
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.surface,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    joinDate: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 16,
        marginLeft: 8,
    },
    emptyEnrollments: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    enrollmentCard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    enrollmentInfo: {
        flex: 1,
    },
    enrollmentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    enrollmentDate: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    enrollmentExpiry: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    activeBadge: {
        backgroundColor: Colors.success,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.surface,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        marginLeft: 12,
    },
    logoutText: {
        color: Colors.error,
    },
    authPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    authTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    authSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    signInButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    signInGradient: {
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    signInText: {
        color: Colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});