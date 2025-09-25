import { Colors } from '@/constants/colors';
import { useCourses } from '@/contexts/CourseContext';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Calendar, Download, ExternalLink, FileText, Play, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VideoPlayerScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getVideoById } = useCourses();
    const [isPlaying, setIsPlaying] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalActions, setModalActions] = useState<{ text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[]>([]);
    const videoRef = useRef<Video>(null);

    const video = getVideoById(id!);

    if (!video) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Video Not Found' }} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Video Not Found</Text>
                    <Text style={styles.errorSubtitle}>The video you&apos;re looking for doesn&apos;t exist.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const showModal = (title: string, message: string, actions: { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[]) => {
        if (!title?.trim() || !message?.trim() || !actions?.length) {
            return;
        }
        setModalTitle(title);
        setModalMessage(message);
        setModalActions(actions);
        setModalVisible(true);
    };

    const handlePlayVideo = async () => {
        try {
            await videoRef.current?.playAsync();
            setIsPlaying(true);
        } catch {
            showModal('Error', 'Failed to play video', [
                { text: 'OK', onPress: () => setModalVisible(false) }
            ]);
        }
    };

    const handleResourcePress = (resource: { title: string; url: string; type: string }) => {
        if (!resource?.title?.trim() || !resource?.url?.trim()) {
            return;
        }

        showModal(
            'Open Resource',
            `Open "${resource.title}"?`,
            [
                { text: 'Cancel', onPress: () => setModalVisible(false), style: 'cancel' },
                { text: 'Open', onPress: () => { setModalVisible(false); Linking.openURL(resource.url); } },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: video.title,
                    headerTitleStyle: { fontSize: 16 },
                }}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.videoContainer}>
                    <Video
                        ref={videoRef}
                        style={styles.video}
                        source={{ uri: video.videoUrl }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping={false}
                        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                            if (status.isLoaded && status.isPlaying !== undefined) {
                                setIsPlaying(status.isPlaying);
                            }
                        }}
                    />

                    {!isPlaying && (
                        <TouchableOpacity style={styles.playOverlay} onPress={handlePlayVideo}>
                            <View style={styles.playButton}>
                                <Play size={32} color={Colors.surface} fill={Colors.surface} />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.videoInfo}>
                        <Text style={styles.videoTitle}>{video.title}</Text>
                        <Text style={styles.videoDescription}>{video.description}</Text>

                        <View style={styles.videoMeta}>
                            <View style={styles.metaItem}>
                                <Calendar size={16} color={Colors.textSecondary} />
                                <Text style={styles.metaText}>
                                    Uploaded {video.uploadedAt.toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {video.resources.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Resources</Text>
                            <Text style={styles.sectionSubtitle}>
                                {video.resources.length} resources available
                            </Text>

                            {video.resources.map((resource: any) => (
                                <TouchableOpacity
                                    key={`${resource.title}-${resource.type}`}
                                    style={styles.resourceCard}
                                    onPress={() => {
                                        if (resource?.title && resource?.url && resource?.type) {
                                            handleResourcePress(resource);
                                        }
                                    }}
                                >
                                    <View style={styles.resourceIcon}>
                                        {resource.type === 'pdf' && <FileText size={20} color={Colors.primary} />}
                                        {resource.type === 'assignment' && <Download size={20} color={Colors.secondary} />}
                                        {resource.type === 'link' && <ExternalLink size={20} color={Colors.accent} />}
                                    </View>

                                    <View style={styles.resourceInfo}>
                                        <Text style={styles.resourceTitle}>
                                            {resource.title}
                                        </Text>
                                        <Text style={styles.resourceType}>
                                            {resource.type.toUpperCase()}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{modalTitle}</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <X size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalMessage}>{modalMessage}</Text>
                        <View style={styles.modalActions}>
                            {modalActions.map((action) => (
                                <TouchableOpacity
                                    key={`${action.text}-${action.style || 'default'}`}
                                    style={[
                                        styles.modalButton,
                                        action.style === 'cancel' && styles.modalButtonCancel,
                                        action.style === 'destructive' && styles.modalButtonDestructive,
                                    ]}
                                    onPress={action.onPress}
                                >
                                    <Text style={[
                                        styles.modalButtonText,
                                        action.style === 'cancel' && styles.modalButtonTextCancel,
                                        action.style === 'destructive' && styles.modalButtonTextDestructive,
                                    ]}>
                                        {action.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
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
    videoContainer: {
        position: 'relative',
        aspectRatio: 16 / 9,
        backgroundColor: Colors.text,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    webVideoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        position: 'absolute',
    },
    webMessage: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 16,
        borderRadius: 8,
    },
    playOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },

    content: {
        padding: 20,
    },
    videoInfo: {
        marginBottom: 24,
    },
    videoTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 12,
        lineHeight: 30,
    },
    videoDescription: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 16,
    },
    videoMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    resourceCard: {
        flexDirection: 'row',
        alignItems: 'center',
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

    resourceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resourceInfo: {
        flex: 1,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    resourceType: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        flex: 1,
    },
    modalCloseButton: {
        padding: 4,
    },
    modalMessage: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.textLight,
    },
    modalButtonDestructive: {
        backgroundColor: '#FF3B30',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.surface,
    },
    modalButtonTextCancel: {
        color: Colors.text,
    },
    modalButtonTextDestructive: {
        color: Colors.surface,
    },
});