import VideoCard from '@/components/VideoCard';
import { Colors, Gradients } from '@/constants/colors';
import { useCourses } from '@/contexts/CourseContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Clock, ExternalLink, Play, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CourseDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { courses, isEnrolled, enrollInCourse, getCourseVideos } = useCourses();
    const [videos, setVideos] = useState<any[]>([]);
    const [videosLoading, setVideosLoading] = useState(false);

    const course = courses.find(c => c.id === id);
    const enrolled = isEnrolled(id!);

    const loadVideos = useCallback(async () => {
        if (!id) return;
        setVideosLoading(true);
        try {
            const courseVideos = await getCourseVideos(id);
            setVideos(courseVideos);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setVideosLoading(false);
        }
    }, [id, getCourseVideos]);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    if (!course) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Course Not Found' }} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Course Not Found</Text>
                    <Text style={styles.errorSubtitle}>The course you&apos;re looking for doesn&apos;t exist.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleEnroll = async () => {
        Alert.alert(
            'Enroll in Course',
            `Do you want to enroll in "${course.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Enroll',
                    onPress: async () => {
                        try {
                            await enrollInCourse(course.id);
                            Alert.alert('Success', 'You have successfully enrolled in this course!');
                        } catch {
                            Alert.alert('Error', 'Failed to enroll. Please try again.');
                        }
                    }
                },
            ]
        );
    };

    const handleVideoPress = (videoId: string) => {
        if (!enrolled) {
            Alert.alert(
                'Enrollment Required',
                'Please enroll in this course to access videos',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Enroll Now', onPress: handleEnroll },
                ]
            );
            return;
        }
        router.push(`/video/${videoId}`);
    };

    const handleJoinLiveClass = () => {
        if (!enrolled) {
            Alert.alert('Enrollment Required', 'Please enroll to join live classes');
            return;
        }

        if (course.zoomLink) {
            Linking.openURL(course.zoomLink);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: course.title,
                    headerTitleStyle: { fontSize: 16 },
                }}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.bannerContainer}>
                    <Image source={{ uri: course.thumbnailUrl }} style={styles.banner} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.bannerOverlay}
                    />

                    {enrolled && (
                        <View style={styles.enrolledBadge}>
                            <CheckCircle size={20} color={Colors.surface} />
                            <Text style={styles.enrolledText}>Enrolled</Text>
                        </View>
                    )}

                    <View style={styles.bannerContent}>
                        <Text style={styles.courseTitle}>{course.title}</Text>
                        <View style={styles.courseMetrics}>
                            {course.courseType === 'Live' ? (
                                <View style={styles.metric}>
                                    <Users size={16} color={Colors.surface} />
                                    <Text style={styles.metricText}>Live Sessions</Text>
                                </View>
                            ) : (
                                <View style={styles.metric}>
                                    <Play size={16} color={Colors.surface} />
                                    <Text style={styles.metricText}>{course.numVideos} Videos</Text>
                                </View>
                            )}

                            <View style={styles.metric}>
                                <Clock size={16} color={Colors.surface} />
                                <Text style={styles.metricText}>
                                    {course.createdAt.toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About This Course</Text>
                        <Text style={styles.description}>{course.description}</Text>

                        <View style={styles.tags}>
                            {course.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {!enrolled && (
                        <View style={styles.enrollSection}>
                            <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll}>
                                <LinearGradient colors={Gradients.primary} style={styles.enrollGradient}>
                                    <Text style={styles.enrollButtonText}>
                                        {course.courseType === 'Live' ? 'Enroll & Join Live Classes' : 'Enroll Now'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {course.courseType === 'Live' && enrolled && (
                        <View style={styles.liveSection}>
                            <TouchableOpacity style={styles.joinButton} onPress={handleJoinLiveClass}>
                                <LinearGradient colors={Gradients.secondary} style={styles.joinGradient}>
                                    <ExternalLink size={20} color={Colors.surface} />
                                    <Text style={styles.joinButtonText}>Join Live Class</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {course.courseType === 'Recording' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Course Content</Text>
                            <Text style={styles.sectionSubtitle}>
                                {videosLoading ? 'Loading videos...' : `${videos.length} videos • ${enrolled ? 'Full access' : 'Preview available'}`}
                            </Text>

                            {videosLoading ? (
                                <View style={styles.loadingContainer}>
                                    <Text style={styles.loadingText}>Loading course content...</Text>
                                </View>
                            ) : videos.length > 0 ? (
                                videos.map((video) => (
                                    <VideoCard
                                        key={video.id}
                                        video={video}
                                        onPress={() => handleVideoPress(video.id)}
                                        isLocked={!enrolled}
                                    />
                                ))
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No videos available for this course.</Text>
                                </View>
                            )}
                        </View>
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
    bannerContainer: {
        position: 'relative',
        height: 250,
    },
    banner: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    enrolledBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    enrolledText: {
        color: Colors.surface,
        fontSize: 14,
        fontWeight: '600',
    },
    bannerContent: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    courseTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.surface,
        marginBottom: 12,
        lineHeight: 30,
    },
    courseMetrics: {
        flexDirection: 'row',
        gap: 20,
    },
    metric: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metricText: {
        color: Colors.surface,
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 16,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: Colors.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tagText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    enrollSection: {
        marginBottom: 24,
    },
    enrollButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    enrollGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    enrollButtonText: {
        color: Colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    liveSection: {
        marginBottom: 24,
    },
    joinButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    joinGradient: {
        flexDirection: 'row',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    joinButtonText: {
        color: Colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    errorSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    loadingContainer: {
        padding: 24,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});