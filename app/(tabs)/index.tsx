import CourseCard from '@/components/CourseCard';
import { Colors, Gradients } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BookOpen, Clock, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
    const authContext = useAuth();
    const courseContext = useCourses();

    const user = authContext?.user || null;
    const getEnrolledCourses = courseContext?.getEnrolledCourses || (() => []);
    const isLoading = courseContext?.isLoading || false;

    const enrolledCourses = getEnrolledCourses();

    const handleCoursePress = (courseId: string) => {
        router.push(`/course/${courseId}`);
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <View style={styles.authPrompt}>
                    <Text style={styles.authTitle}>Welcome to Thilak Academy</Text>
                    <Text style={styles.authSubtitle}>
                        Please sign in to access your courses
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

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient colors={Gradients.hero} style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.userName}>{user.displayName}! 👋</Text>
                        <Text style={styles.subtitle}>Continue your learning journey</Text>
                    </View>
                </LinearGradient>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <BookOpen size={24} color={Colors.primary} />
                        <Text style={styles.statNumber}>{enrolledCourses.length}</Text>
                        <Text style={styles.statLabel}>Enrolled Courses</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Clock size={24} color={Colors.secondary} />
                        <Text style={styles.statNumber}>24</Text>
                        <Text style={styles.statLabel}>Hours Learned</Text>
                    </View>

                    <View style={styles.statCard}>
                        <TrendingUp size={24} color={Colors.accent} />
                        <Text style={styles.statNumber}>85%</Text>
                        <Text style={styles.statLabel}>Progress</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Courses</Text>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading your courses...</Text>
                        </View>
                    ) : enrolledCourses.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📚</Text>
                            <Text style={styles.emptyTitle}>No Courses Yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Explore our course catalog to start learning
                            </Text>
                        </View>
                    ) : (
                        enrolledCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                isEnrolled={true}
                                onPress={() => handleCoursePress(course.id)}
                            />
                        ))
                    )}
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
    headerContent: {
        alignItems: 'flex-start',
    },
    greeting: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    userName: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.surface,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
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
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginHorizontal: 24,
        marginBottom: 16,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
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