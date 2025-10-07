import { Colors, Gradients } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, BookOpen, Calendar, ChevronRight, LogOut, RefreshCw, Settings } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
    const { enrollments, courses, refreshData } = useCourses();
    const { user, signOut } = useAuth();
    const [isRefreshingCache, setIsRefreshingCache] = useState(false);

    const activeEnrollments = enrollments.filter(e => e.status === 'active');

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                    },
                },
            ]
        );
    };

    const handleRefreshCache = async () => {
        Alert.alert(
            'Refresh Cache',
            'This will reload all data from the server. Continue?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Refresh',
                    onPress: async () => {
                        setIsRefreshingCache(true);
                        try {
                            await refreshData();
                            Alert.alert('Success', 'Cache refreshed successfully!');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to refresh cache. Please try again.');
                        } finally {
                            setIsRefreshingCache(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <LinearGradient colors={Gradients.hero} style={styles.header}>
                    <View style={styles.profileSection}>
                        <Image
                            source={require('../../assets/images/avatar.png')}
                            style={styles.avatar}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                            </Text>
                            <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
                            <Text style={styles.joinDate}>
                                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
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
                            {user?.created_at
                                ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
                                : 0
                            }
                        </Text>
                        <Text style={styles.statLabel}>Days Learning</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Award size={24} color={Colors.accent} />
                        <Text style={styles.statNumber}>0</Text>
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
                        activeEnrollments.map((enrollment) => {
                            const course = courses.find(c => c.id === enrollment.courseId);
                            return (
                                <View key={enrollment.id} style={styles.enrollmentCard}>
                                    <View style={styles.enrollmentInfo}>
                                        <Text style={styles.enrollmentTitle}>
                                            {course?.title || `Course ${enrollment.courseId}`}
                                        </Text>
                                        <Text style={styles.enrollmentDate}>
                                            Enrolled: {enrollment.enrolledAt.toLocaleDateString()}
                                        </Text>
                                        <Text style={styles.enrollmentExpiry}>
                                            Expires: {enrollment.expiryDate?.toLocaleDateString() ?? 'No expiry date'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, styles.activeBadge]}>
                                        <Text style={styles.statusText}>Active</Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <Settings size={20} color={Colors.textSecondary} />
                        <Text style={styles.settingText}>App Settings</Text>
                        <ChevronRight size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleRefreshCache}
                        disabled={isRefreshingCache}
                    >
                        {isRefreshingCache ? (
                            <ActivityIndicator size="small" color={Colors.primary} />
                        ) : (
                            <RefreshCw size={20} color={Colors.primary} />
                        )}
                        <Text style={[styles.settingText, isRefreshingCache && styles.disabledText]}>
                            {isRefreshingCache ? 'Refreshing...' : 'Refresh Cache'}
                        </Text>
                        <ChevronRight size={20} color={isRefreshingCache ? Colors.textLight : Colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                        <LogOut size={20} color={Colors.error} />
                        <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
                        <ChevronRight size={20} color={Colors.error} />
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
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
        // borderBottomLeftRadius: 24,
        // borderBottomRightRadius: 24,
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
    disabledText: {
        color: Colors.textLight,
    },
});