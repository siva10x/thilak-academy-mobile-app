import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
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
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [showSpeedControl, setShowSpeedControl] = useState(false);
    const videoRef = useRef<Video>(null);

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

    // Sync external shouldPlay prop with internal state
    useEffect(() => {
        setVideoShouldPlay(shouldPlay);
    }, [shouldPlay]);

    const handlePlayPress = () => {
        setShowVideo(true);
        setVideoShouldPlay(true);
        onLoadStart?.();
    };

    const handleVideoLoad = () => {
        setVideoLoading(false);
        setVideoShouldPlay(true); // Auto-play after video loads
        onLoad?.();
    };

    const handleVideoError = (error: any) => {
        const errorMessage = 'Failed to play video';
        setError(errorMessage);
        onError?.(errorMessage);
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

            {/* Custom Speed Control Button */}
            <TouchableOpacity
                style={styles.speedButton}
                onPress={() => setShowSpeedControl(!showSpeedControl)}
            >
                <Text style={styles.speedButtonText}>{playbackRate}x</Text>
            </TouchableOpacity>

            {/* Speed Selection Overlay */}
            {showSpeedControl && (
                <View style={styles.speedControlOverlay}>
                    <View style={styles.speedControlContainer}>
                        <Text style={styles.speedControlTitle}>Playback Speed</Text>
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((rate) => (
                            <TouchableOpacity
                                key={rate}
                                style={[
                                    styles.speedOption,
                                    playbackRate === rate && styles.speedOptionActive
                                ]}
                                onPress={() => {
                                    setPlaybackRate(rate);
                                    setShowSpeedControl(false);
                                }}
                            >
                                <Text style={[
                                    styles.speedOptionText,
                                    playbackRate === rate && styles.speedOptionTextActive
                                ]}>
                                    {rate}x {rate === 1.0 ? '(Normal)' : ''}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.speedCloseButton}
                            onPress={() => setShowSpeedControl(false)}
                        >
                            <Text style={styles.speedCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <Video
                ref={videoRef}
                style={[styles.video, { height: videoHeight }]}
                source={{ uri: videoData.url }}
                shouldPlay={videoShouldPlay}
                isLooping={isLooping}
                rate={playbackRate}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                onLoad={handleVideoLoad}
                onError={handleVideoError}
                onLoadStart={() => setVideoLoading(true)}
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
    speedButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        zIndex: 2,
    },
    speedButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    speedControlOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
    },
    speedControlContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 20,
        minWidth: 200,
        maxWidth: 300,
    },
    speedControlTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    speedOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    speedOptionActive: {
        backgroundColor: '#0066cc',
    },
    speedOptionText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    speedOptionTextActive: {
        fontWeight: '600',
    },
    speedCloseButton: {
        marginTop: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#333',
        borderRadius: 8,
    },
    speedCloseButtonText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default VimeoPlayer;