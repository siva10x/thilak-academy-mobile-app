import CourseCard from '@/components/CourseCard';
import { Colors, Gradients } from '@/constants/colors';
import { useCourses } from '@/contexts/CourseContext';
import { LinearGradient } from 'expo-linear-gradient';

import { Course } from '@/types';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const { getEnrolledCourses, isLoading, isEnrolled } = useCourses();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const enrolledCourses = getEnrolledCourses();

    // Navigate to explore if no enrolled courses
    useEffect(() => {
        if (!isLoading && enrolledCourses.length === 0) {
            router.replace('/(tabs)/explore');
        }
    }, [isLoading, enrolledCourses.length]);

    const filteredCourses = enrolledCourses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate refresh delay
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const handleCoursePress = (course: Course) => {
        router.push(`/course/${course.id}`);
    };

    const renderCourseCard = ({ item }: { item: Course }) => (
        <CourseCard
            course={item}
            isEnrolled={isEnrolled(item.id)}
            onPress={() => handleCoursePress(item)}
        />
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading courses...</Text>
            </SafeAreaView>
        );
    }

    const renderHeader = () => (
        <>
            <LinearGradient colors={Gradients.hero} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>My Courses</Text>
                    <Text style={styles.subtitle}>Continue your learning journey</Text>
                </View>
            </LinearGradient>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses..."
                        placeholderTextColor={Colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>
        </>
    );

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No courses found</Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search' : 'No enrolled courses found'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filteredCourses}
                renderItem={renderCourseCard}
                keyExtractor={item => item.id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: Colors.text,
        fontSize: 16,
        marginTop: 16,
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
    header: {
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    searchInputContainer: {
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
    flatListContent: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
