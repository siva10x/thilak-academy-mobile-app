import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import VimeoService, { VideoQuality } from '../lib/vimeoService';

/**
 * VimeoPlayer component that automatically plays videos after they're loaded
 * 
 * Features:
 * - Auto-play: Videos automatically start playing once loaded
 * - Quality selection: Choose specific video quality or auto-select best
 * - Thumbnail preview: Shows thumbnail with play button before auto-play
 * - Error handling: Graceful error handling with retry options
 */
interface VimeoPlayerProps {
    videoId: string;
    autoPlay?: boolean; // Whether to show video player immediately (bypasses thumbnail)
    shouldPlay?: boolean; // Initial play state (videos auto-play after load regardless)
    isLooping?: boolean;
    quality?: VideoQuality;
    style?: any;
    onError?: (error: string) => void;
    onLoadStart?: () => void;
    onLoad?: () => void;
}

interface VideoData {
    url: string;
    quality: string;
    width: number;
    height: number;
    name: string;
    description: string;
    duration: number;
    thumbnail: string;
}

const { width: screenWidth } = Dimensions.get('window');

const VimeoPlayer: React.FC<VimeoPlayerProps> = ({
    videoId,
    autoPlay = false,
    shouldPlay = false,
    isLooping = false,
    quality = 'auto',
    style,
    onError,
    onLoadStart,
    onLoad,
}) => {
    const [videoData, setVideoData] = useState<VideoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [showVideo, setShowVideo] = useState(autoPlay);
    const [videoShouldPlay, setVideoShouldPlay] = useState(shouldPlay);

    // Create video player instance
    const player = useVideoPlayer(videoData?.url || '', (player) => {
        player.loop = isLooping;
        if (videoShouldPlay) {
            player.play();
        }
    });

    useEffect(() => {
        const fetchVideoData = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await VimeoService.getVideoUrl(videoId, quality);
                setVideoData(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load video';
                setError(errorMessage);
                onError?.(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (videoId) {
            fetchVideoData();
        }
    }, [videoId, quality]);

    // Update player when video data changes
    useEffect(() => {
        const updateVideo = async () => {
            if (videoData?.url && player) {
                try {
                    await player.replaceAsync(videoData.url);
                    setVideoLoading(false);
                    if (videoShouldPlay) {
                        player.play();
                    }
                    onLoad?.();
                } catch (error) {
                    console.error('Error loading video:', error);
                    setVideoLoading(false);
                }
            }
        };

        updateVideo();
    }, [videoData?.url, player, videoShouldPlay, onLoad]);

    // Sync external shouldPlay prop with player
    useEffect(() => {
        if (player) {
            if (shouldPlay) {
                player.play();
            } else {
                player.pause();
            }
        }
        setVideoShouldPlay(shouldPlay);
    }, [shouldPlay, player]);

    const handlePlayPress = () => {
        setShowVideo(true);
        setVideoShouldPlay(true);
        if (player) {
            player.play();
        }
        onLoadStart?.();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, style]}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Loading video...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered, style]}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                        setError(null);
                        setLoading(true);
                        // Trigger re-fetch by updating the key
                    }}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!videoData) {
        return (
            <View style={[styles.container, styles.centered, style]}>
                <Text style={styles.errorText}>No video data available</Text>
            </View>
        );
    }

    const aspectRatio = videoData.width / videoData.height;
    const videoHeight = screenWidth / aspectRatio;

    if (!showVideo) {
        return (
            <View style={[styles.container, { height: videoHeight }, style]}>
                <TouchableOpacity style={styles.thumbnailContainer} onPress={handlePlayPress}>
                    {videoData.thumbnail ? (
                        <Image source={{ uri: videoData.thumbnail }} style={styles.thumbnail} />
                    ) : (
                        <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                            <Text style={styles.placeholderText}>Play Video</Text>
                        </View>
                    )}
                    <View style={styles.playButton}>
                        <Text style={styles.playButtonText}>▶</Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                        {videoData.name}
                    </Text>
                    <Text style={styles.videoQuality}>Quality: {videoData.quality}</Text>
                    <Text style={styles.videoDuration}>
                        Duration: {Math.floor(videoData.duration / 60)}:{(videoData.duration % 60).toString().padStart(2, '0')}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            {videoLoading && (
                <View style={styles.videoLoadingOverlay}>
                    <ActivityIndicator size="large" color="#0066cc" />
                </View>
            )}

            <VideoView
                style={[styles.video, { height: videoHeight }]}
                player={player}
                fullscreenOptions={{ enable: true }}
                allowsPictureInPicture
                contentFit="contain"
            />
            <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                    {videoData.name}
                </Text>
                {videoData.description ? (
                    <Text style={styles.videoDescription} numberOfLines={3}>
                        {videoData.description}
                    </Text>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        borderRadius: 8,
        overflow: 'hidden',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    video: {
        width: '100%',
        backgroundColor: '#000',
    },
    thumbnailContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderThumbnail: {
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#fff',
        fontSize: 16,
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 60,
        height: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateX: -30 }, { translateY: -30 }],
    },
    playButtonText: {
        color: '#fff',
        fontSize: 24,
        marginLeft: 4,
    },
    videoLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    videoInfo: {
        padding: 12,
        backgroundColor: '#1a1a1a',
    },
    videoTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    videoDescription: {
        color: '#ccc',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 4,
    },
    videoQuality: {
        color: '#999',
        fontSize: 12,
        marginTop: 4,
    },
    videoDuration: {
        color: '#999',
        fontSize: 12,
        marginTop: 2,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
    errorText: {
        color: '#ff6b6b',
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: '#0066cc',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default VimeoPlayer;