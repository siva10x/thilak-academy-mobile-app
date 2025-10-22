import { Colors } from '@/constants/colors';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Play } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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

    // Create video player instance
    const player = useVideoPlayer(videoUrl, (player) => {
        player.loop = isLooping || false;
        if (shouldPlay) {
            player.play();
        }
    });

    // Listen to player status changes
    useEffect(() => {
        if (player) {
            const subscription = player.addListener('statusChange', (payload) => {
                const { status, error } = payload;

                if (error) {
                    onError?.(error.message || 'Video player error');
                    setIsLoading(false);
                    return;
                }

                // Handle different status values
                setIsLoading(false);
                onLoad?.();
            });

            return () => {
                subscription?.remove();
            };
        }
    }, [player, onError, onLoad, onLoadStart]);

    // Update player when props change
    useEffect(() => {
        if (player) {
            if (shouldPlay) {
                player.play();
            } else {
                player.pause();
            }
        }
    }, [shouldPlay, player]);



    const handlePlayVideo = async () => {
        try {
            if (player) {
                await player.play();
                setIsPlaying(true);
            }
        } catch (error) {
            const errorMessage = 'Failed to play video';
            onError?.(errorMessage);
        }
    };

    // Calculate video height maintaining 16:9 aspect ratio
    const videoHeight = (screenWidth * 9) / 16;

    return (
        <View style={[styles.container, style]}>
            <View style={[styles.videoContainer, { height: videoHeight }]}>
                <VideoView
                    style={styles.video}
                    player={player}
                    fullscreenOptions={{ enable: true }}
                    allowsPictureInPicture
                    contentFit="contain"
                />

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
});

export default DefaultVideoPlayer;