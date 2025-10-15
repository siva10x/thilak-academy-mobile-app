import { Colors } from '@/constants/colors';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { Play } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DefaultVideoPlayerProps {
    videoUrl: string;
    title?: string;
    shouldPlay?: boolean;
    isLooping?: boolean;
    style?: any;
    onError?: (error: string) => void;
    onLoadStart?: () => void;
    onLoad?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const DefaultVideoPlayer: React.FC<DefaultVideoPlayerProps> = ({
    videoUrl,
    title,
    shouldPlay = false,
    isLooping = false,
    style,
    onError,
    onLoadStart,
    onLoad,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [showSpeedControl, setShowSpeedControl] = useState(false);
    const videoRef = useRef<Video>(null);

    const handlePlayVideo = async () => {
        try {
            await videoRef.current?.playAsync();
            setIsPlaying(true);
        } catch (error) {
            const errorMessage = 'Failed to play video';
            onError?.(errorMessage);
        }
    };

    const handleVideoLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleVideoError = (error: any) => {
        const errorMessage = 'Failed to load video';
        setIsLoading(false);
        onError?.(errorMessage);
    };

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded && status.isPlaying !== undefined) {
            setIsPlaying(status.isPlaying);
        }
    };

    // Calculate video height maintaining 16:9 aspect ratio
    const videoHeight = (screenWidth * 9) / 16;

    return (
        <View style={[styles.container, style]}>
            <View style={[styles.videoContainer, { height: videoHeight }]}>
                <Video
                    ref={videoRef}
                    style={styles.video}
                    source={{ uri: videoUrl }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={isLooping}
                    shouldPlay={shouldPlay}
                    rate={playbackRate}
                    onLoad={handleVideoLoad}
                    onError={handleVideoError}
                    onLoadStart={() => {
                        setIsLoading(true);
                        onLoadStart?.();
                    }}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />

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

                {!isPlaying && !isLoading && (
                    <TouchableOpacity style={styles.playOverlay} onPress={handlePlayVideo}>
                        <View style={styles.playButton}>
                            <Play size={32} color={Colors.surface} fill={Colors.surface} />
                        </View>
                    </TouchableOpacity>
                )}

                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                )}
            </View>

            {title && (
                <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                        {title}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        borderRadius: 8,
        overflow: 'hidden',
    },
    videoContainer: {
        position: 'relative',
        width: '100%',
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
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
        width: 80,
        height: 80,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
    },
    videoInfo: {
        padding: 12,
        backgroundColor: '#1a1a1a',
    },
    videoTitle: {
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

export default DefaultVideoPlayer;