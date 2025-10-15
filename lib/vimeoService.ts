import axios from 'axios';

interface VimeoVideoFile {
    quality: string;
    type: string;
    width: number;
    height: number;
    link: string;
    fps: number;
}

interface VimeoVideoResponse {
    name: string;
    description: string;
    duration: number;
    files: VimeoVideoFile[];
    pictures: {
        sizes: Array<{
            width: number;
            height: number;
            link: string;
        }>;
    };
}

export type VideoQuality = 'auto' | 'hd' | '720p' | '540p' | '360p' | '240p';

interface VideoUrlResponse {
    url: string;
    quality: string;
    width: number;
    height: number;
    name: string;
    description: string;
    duration: number;
    thumbnail: string;
}

class VimeoService {
    private baseURL = 'https://api.vimeo.com';
    private accessToken: string;

    constructor() {
        // You should set this in your environment variables
        this.accessToken = process.env.EXPO_PUBLIC_VIMEO_ACCESS_TOKEN || '';
    }

    /**
     * Get direct video URL from Vimeo API
     * @param videoId - Vimeo video ID (can be with or without the leading slash)
     * @param preferredQuality - Preferred video quality ('hd', '720p', '540p', '360p', '240p', 'auto'). Defaults to 'auto' (highest available)
     * @returns Promise with video data including direct URL
     */
    async getVideoUrl(videoId: string, preferredQuality: VideoQuality = 'auto'): Promise<VideoUrlResponse> {
        try {
            // Clean the video ID (remove leading slash if present)
            const cleanVideoId = videoId.replace(/^\//, '');

            const response = await axios.get<VimeoVideoResponse>(
                `${this.baseURL}/videos/${cleanVideoId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                    },
                    params: {
                        fields: 'name,description,duration,files,pictures'
                    }
                }
            );

            const { data } = response;

            if (!data.files || data.files.length === 0) {
                throw new Error('No video files found for this video');
            }

            // Filter for progressive (direct download) files only
            const progressiveFiles = data.files.filter(file =>
                file.type === 'video/mp4' && file.link
            );

            if (progressiveFiles.length === 0) {
                throw new Error('No direct download links available for this video');
            }

            // Get the video file based on preferred quality
            const selectedVideo = this.getVideoByQuality(progressiveFiles, preferredQuality);

            // Get thumbnail
            const thumbnail = this.getThumbnail(data.pictures);

            return {
                url: selectedVideo.link,
                quality: selectedVideo.quality,
                width: selectedVideo.width,
                height: selectedVideo.height,
                name: data.name,
                description: data.description,
                duration: data.duration,
                thumbnail
            };
        } catch (error) {
            console.error('Error fetching Vimeo video:', error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    throw new Error('Invalid Vimeo access token');
                } else if (error.response?.status === 404) {
                    throw new Error('Video not found');
                } else if (error.response?.status === 403) {
                    throw new Error('Access denied. Video may be private or restricted');
                }
            }
            throw error;
        }
    }

    /**
     * Get multiple video qualities available
     * @param videoId - Vimeo video ID
     * @returns Promise with array of available qualities
     */
    async getVideoQualities(videoId: string): Promise<Array<{
        url: string;
        quality: string;
        width: number;
        height: number;
    }>> {
        try {
            const cleanVideoId = videoId.replace(/^\//, '');

            const response = await axios.get<VimeoVideoResponse>(
                `${this.baseURL}/videos/${cleanVideoId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                    },
                    params: {
                        fields: 'files'
                    }
                }
            );

            const { data } = response;

            if (!data.files || data.files.length === 0) {
                throw new Error('No video files found for this video');
            }

            // Filter for progressive (direct download) files only
            const progressiveFiles = data.files.filter(file =>
                file.type === 'video/mp4' && file.link
            );

            return progressiveFiles.map(file => ({
                url: file.link,
                quality: file.quality,
                width: file.width,
                height: file.height
            }));
        } catch (error) {
            console.error('Error fetching video qualities:', error);
            throw error;
        }
    }

    /**
     * Get video metadata without files
     * @param videoId - Vimeo video ID
     * @returns Promise with video metadata
     */
    async getVideoMetadata(videoId: string): Promise<{
        name: string;
        description: string;
        duration: number;
        thumbnail: string;
    }> {
        try {
            const cleanVideoId = videoId.replace(/^\//, '');

            const response = await axios.get<VimeoVideoResponse>(
                `${this.baseURL}/videos/${cleanVideoId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                    },
                    params: {
                        fields: 'name,description,duration,pictures'
                    }
                }
            );

            const { data } = response;
            const thumbnail = this.getThumbnail(data.pictures);

            return {
                name: data.name,
                description: data.description,
                duration: data.duration,
                thumbnail
            };
        } catch (error) {
            console.error('Error fetching video metadata:', error);
            throw error;
        }
    }

    /**
     * Select the best quality video file based on resolution
     */
    private getBestQuality(files: VimeoVideoFile[]): VimeoVideoFile {
        return files.reduce((prev, current) => {
            // Prefer higher resolution, then higher quality label
            if (current.height > prev.height) {
                return current;
            } else if (current.height === prev.height) {
                // If same height, prefer based on quality string
                const qualityOrder = ['hd', '720p', '540p', '360p', '240p'];
                const prevIndex = qualityOrder.indexOf(prev.quality);
                const currentIndex = qualityOrder.indexOf(current.quality);
                return currentIndex < prevIndex ? current : prev;
            }
            return prev;
        });
    }

    /**
     * Select video file based on preferred quality
     * @param files - Available video files
     * @param preferredQuality - Preferred quality or 'auto' for highest
     * @returns Selected video file
     */
    private getVideoByQuality(files: VimeoVideoFile[], preferredQuality: VideoQuality): VimeoVideoFile {
        if (preferredQuality === 'auto' || !preferredQuality) {
            return this.getBestQuality(files);
        }

        // Try to find exact quality match
        const exactMatch = files.find(file => file.quality === preferredQuality);
        if (exactMatch) {
            return exactMatch;
        }

        // If no exact match, find closest quality
        const qualityOrder = ['hd', '720p', '540p', '360p', '240p'];
        const preferredIndex = qualityOrder.indexOf(preferredQuality);

        if (preferredIndex === -1) {
            // Invalid quality specified, return best available
            return this.getBestQuality(files);
        }

        // Look for closest available quality (prefer higher quality if preferred not available)
        for (let i = preferredIndex; i >= 0; i--) {
            const match = files.find(file => file.quality === qualityOrder[i]);
            if (match) return match;
        }

        // If no higher quality available, look for lower quality
        for (let i = preferredIndex + 1; i < qualityOrder.length; i++) {
            const match = files.find(file => file.quality === qualityOrder[i]);
            if (match) return match;
        }

        // Fallback to best quality if nothing else works
        return this.getBestQuality(files);
    }

    /**
     * Get the best thumbnail from pictures array
     */
    private getThumbnail(pictures: VimeoVideoResponse['pictures']): string {
        if (!pictures || !pictures.sizes || pictures.sizes.length === 0) {
            return '';
        }

        // Get the largest thumbnail
        const largest = pictures.sizes.reduce((prev, current) => {
            return current.width > prev.width ? current : prev;
        });

        return largest.link;
    }
}

export default new VimeoService();