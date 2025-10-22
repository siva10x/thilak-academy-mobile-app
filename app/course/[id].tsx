import VideoCard from '@/components/VideoCard';
import { Colors, Gradients } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Clock, ExternalLink, Play, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CourseDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const { courses, isEnrolled, enrollInCourse, getCourseVideos, isVideoPreviewEnabled, getEnrollmentStatus } = useCourses();
    const [videos, setVideos] = useState<any[]>([]);
    const [videosLoading, setVideosLoading] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    const course = courses.find(c => c.id === id);
    const enrolled = isEnrolled(id!);
    const enrollmentStatus = getEnrollmentStatus(id!);

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
        // Check if this is the demo user
        const isDemoUser = user?.email && user.email === 'app.demo.2026@gmail.com';

        Alert.alert(
            'Enroll in Course',
            `Do you want to enroll in "${course.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Enroll',
                    onPress: async () => {
                        setEnrolling(true);
                        try {
                            await enrollInCourse(course.id);
                            if (isDemoUser) {
                                Alert.alert('Enrollment Successful! 🎉', 'You have been successfully enrolled in this course.');
                            } else {
                                Alert.alert('Enrollment Submitted', 'Your enrollment request has been submitted and is pending approval.');
                            }
                        } catch {
                            Alert.alert('Error', 'Failed to enroll. Please try again.');
                        } finally {
                            setEnrolling(false);
                        }
                    }
                },
            ]
        );
    };

    const handleVideoPress = (videoId: string) => {
        const hasPreviewAccess = isVideoPreviewEnabled(id!, videoId);
        if (enrollmentStatus !== 'active' && !hasPreviewAccess) {
            if (enrollmentStatus === 'pending') {
                Alert.alert('Enrollment Pending', 'Your enrollment is pending approval. You can only access preview videos.');
            } else {
                Alert.alert(
                    'Enrollment Required',
                    'Please enroll in this course to access videos',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Enroll Now', onPress: handleEnroll },
                    ]
                );
            }
            return;
        }
        router.push(`/video/${videoId}?courseId=${id}`);
    };

    const handleJoinLiveClass = () => {
        if (enrollmentStatus !== 'active') {
            Alert.alert('Active Enrollment Required', 'Please wait for your enrollment to be approved to join live classes');
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

                    {enrollmentStatus === 'active' && (
                        <View style={styles.enrolledBadge}>
                            <CheckCircle size={20} color={Colors.surface} />
                            <Text style={styles.enrolledText}>Enrolled</Text>
                        </View>
                    )}

                    {enrollmentStatus === 'pending' && (
                        <View style={styles.pendingBadge}>
                            <Clock size={20} color={Colors.surface} />
                            <Text style={styles.pendingText}>Enrollment Pending</Text>
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

                    {(enrollmentStatus === null || (enrollmentStatus !== 'active' && enrollmentStatus !== 'pending')) && (
                        <View style={styles.enrollSection}>
                            <TouchableOpacity
                                style={styles.enrollButton}
                                onPress={handleEnroll}
                                disabled={enrolling}
                            >
                                <LinearGradient colors={Gradients.primary} style={styles.enrollGradient}>
                                    {enrolling ? (
                                        <ActivityIndicator size="small" color={Colors.surface} />
                                    ) : (
                                        <Text style={styles.enrollButtonText}>
                                            {course.courseType === 'Live' ? 'Enroll & Join Live Classes' : 'Enroll Now'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {enrollmentStatus === 'pending' && (
                        <View style={styles.enrollSection}>
                            <TouchableOpacity
                                style={[styles.enrollButton, styles.disabledButton]}
                                disabled={true}
                            >
                                <LinearGradient colors={['#9ca3af', '#6b7280']} style={styles.enrollGradient}>
                                    <Clock size={20} color={Colors.surface} />
                                    <Text style={styles.enrollButtonText}>
                                        Enrollment Pending
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {course.courseType === 'Live' && enrollmentStatus === 'active' && (
                        <View style={styles.liveSection}>
                            <TouchableOpacity style={styles.joinButton} onPress={handleJoinLiveClass}>
                                <LinearGradient colors={Gradients.secondary} style={styles.joinGradient}>
                                    <ExternalLink size={20} color={Colors.surface} />
                                    <Text style={styles.joinButtonText}>Join Live Class</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Course Content</Text>
                        <Text style={styles.sectionSubtitle}>
                            {videosLoading ? 'Loading videos...' : `${videos.length} videos • ${enrollmentStatus === 'active' ? 'Full access' : enrollmentStatus === 'pending' ? 'Preview only (enrollment pending)' : 'Preview available'}`}
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
                                    isLocked={enrollmentStatus !== 'active'}
                                    isPreviewEnabled={isVideoPreviewEnabled(id!, video.id)}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No videos available for this course.</Text>
                            </View>
                        )}
                    </View>
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
    disabledButton: {
        opacity: 0.6,
    },
    pendingBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#f59e0b',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pendingText: {
        color: Colors.surface,
        fontSize: 14,
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