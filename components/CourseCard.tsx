import { Colors, Gradients } from '@/constants/colors';
import { Course } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Clock, Play, Users } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CourseCardProps {
    course: Course;
    isEnrolled?: boolean;
    onPress: () => void;
}

export default function CourseCard({ course, isEnrolled = false, onPress }: CourseCardProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: course.thumbnailUrl }} style={styles.image} />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.imageOverlay}
                />

                {isEnrolled && (
                    <View style={styles.enrolledBadge}>
                        <CheckCircle size={16} color={Colors.surface} />
                        <Text style={styles.enrolledText}>Enrolled</Text>
                    </View>
                )}

                <View style={styles.typeIndicator}>
                    {course.courseType === 'Live' ? (
                        <View style={[styles.typeBadge, styles.liveBadge]}>
                            <Users size={12} color={Colors.surface} />
                            <Text style={styles.typeText}>Live</Text>
                        </View>
                    ) : (
                        <View style={[styles.typeBadge, styles.recordingBadge]}>
                            <Play size={12} color={Colors.surface} />
                            <Text style={styles.typeText}>{course.numVideos} Videos</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {course.title}
                </Text>
                <Text style={styles.description} numberOfLines={3}>
                    {course.description}
                </Text>

                <View style={styles.tags}>
                    {course.tags.slice(0, 3).map((tag) => (
                        <View key={tag} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <View style={styles.dateContainer}>
                        <Clock size={14} color={Colors.textSecondary} />
                        <Text style={styles.dateText}>
                            {course.createdAt.toLocaleDateString()}
                        </Text>
                    </View>

                    {!isEnrolled && (
                        <LinearGradient
                            colors={Gradients.primary}
                            style={styles.previewButton}
                        >
                            <Text style={styles.previewText}>Preview</Text>
                        </LinearGradient>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 200,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    enrolledBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    enrolledText: {
        color: Colors.surface,
        fontSize: 12,
        fontWeight: '600',
    },
    typeIndicator: {
        position: 'absolute',
        bottom: 12,
        left: 12,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    liveBadge: {
        backgroundColor: Colors.error,
    },
    recordingBadge: {
        backgroundColor: Colors.primary,
    },
    typeText: {
        color: Colors.surface,
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
        lineHeight: 24,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    tag: {
        backgroundColor: Colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tagText: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    previewButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    previewText: {
        color: Colors.surface,
        fontSize: 12,
        fontWeight: '600',
    },
});