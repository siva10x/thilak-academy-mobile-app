import { Colors } from '@/constants/colors';
import { Video } from '@/types';
import { Clock, FileText, Play } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VideoCardProps {
    video: Video;
    onPress: () => void;
    isLocked?: boolean;
}

export default function VideoCard({ video, onPress, isLocked = false }: VideoCardProps) {
    return (
        <TouchableOpacity
            style={[styles.container, isLocked && styles.lockedContainer]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.thumbnailContainer}>
                <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} />
                <View style={styles.playOverlay}>
                    <View style={[styles.playButton, isLocked && styles.lockedPlayButton]}>
                        <Play size={20} color={Colors.surface} fill={Colors.surface} />
                    </View>
                </View>
                {isLocked && (
                    <View style={styles.lockOverlay}>
                        <Text style={styles.lockText}>🔒</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, isLocked && styles.lockedText]} numberOfLines={2}>
                    {video.title}
                </Text>
                <Text style={[styles.description, isLocked && styles.lockedText]} numberOfLines={2}>
                    {video.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.dateContainer}>
                        <Clock size={14} color={isLocked ? Colors.textLight : Colors.textSecondary} />
                        <Text style={[styles.dateText, isLocked && styles.lockedText]}>
                            {video.uploadedAt.toLocaleDateString()}
                        </Text>
                    </View>

                    {video.resources.length > 0 && (
                        <View style={styles.resourcesContainer}>
                            <FileText size={14} color={isLocked ? Colors.textLight : Colors.textSecondary} />
                            <Text style={[styles.resourcesText, isLocked && styles.lockedText]}>
                                {video.resources.length} Resources
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 12,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    lockedContainer: {
        opacity: 0.6,
    },
    thumbnailContainer: {
        position: 'relative',
        width: 120,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockedPlayButton: {
        backgroundColor: Colors.textLight,
    },
    lockOverlay: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockText: {
        fontSize: 12,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
        lineHeight: 20,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 18,
        marginBottom: 8,
    },
    lockedText: {
        color: Colors.textLight,
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
    resourcesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    resourcesText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
});