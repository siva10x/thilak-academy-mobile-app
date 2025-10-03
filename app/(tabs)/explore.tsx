import CourseCard from '@/components/CourseCard';
import { Colors, Gradients } from '@/constants/colors';
import { useCourses } from '@/contexts/CourseContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Filter, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
    const [searchQuery, setSearchQuery] = useState('');

    const courseContext = useCourses();
    const courses = courseContext?.courses || [];
    const isEnrolled = courseContext?.isEnrolled || (() => false);
    const getEnrollmentStatus = courseContext?.getEnrollmentStatus || (() => null);
    const isLoading = courseContext?.isLoading || false;

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCoursePress = (courseId: string) => {
        router.push(`/course/${courseId}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient colors={Gradients.hero} style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>Explore Courses</Text>
                        <Text style={styles.subtitle}>Discover Mathematics & Science courses</Text>
                    </View>
                </LinearGradient>

                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search courses, topics, or subjects..."
                            placeholderTextColor={Colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <View style={styles.filterButton}>
                        <Filter size={20} color={Colors.primary} />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {searchQuery ? `Search Results (${filteredCourses.length})` : 'All Courses'}
                        </Text>
                        <Text style={styles.courseCount}>{filteredCourses.length} courses</Text>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>
                                Loading courses...
                            </Text>
                        </View>
                    ) : filteredCourses.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🔍</Text>
                            <Text style={styles.emptyTitle}>
                                {searchQuery ? 'No Results Found' : 'No Courses Available'}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery
                                    ? 'Try adjusting your search terms'
                                    : 'Check back later for new courses'
                                }
                            </Text>
                        </View>
                    ) : (
                        filteredCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                isEnrolled={isEnrolled(course.id)}
                                enrollmentStatus={getEnrollmentStatus(course.id)}
                                onPress={() => handleCoursePress(course.id)}
                            />
                        ))
                    )}
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
    headerContent: {
        alignItems: 'flex-start',
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
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        letterSpacing: 0,
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    section: {
        paddingBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
    },
    courseCount: {
        fontSize: 14,
        color: Colors.textSecondary,
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
});