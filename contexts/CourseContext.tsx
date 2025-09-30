import { supabase } from '@/lib/supabase';
import { Course, CourseVideo, Enrollment, Video } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Cache configuration
const CACHE_KEYS = {
    COURSES: 'cached_courses',
    VIDEOS: 'cached_videos',
    COURSE_VIDEOS: 'cached_course_videos',
    CACHE_TIMESTAMP: 'cache_timestamp',
    CACHE_DURATION: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
    MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB max cache size
};

interface CacheData<T> {
    data: T[];
    timestamp: number;
}

interface CourseContextType {
    courses: Course[];
    enrollments: Enrollment[];
    isLoading: boolean;
    enrollInCourse: (courseId: string) => Promise<void>;
    isEnrolled: (courseId: string) => boolean;
    getEnrolledCourses: () => Course[];
    getCourseVideos: (courseId: string) => Promise<Video[]>;
    getVideoById: (videoId: string) => Video | undefined;
    isVideoPreviewEnabled: (courseId: string, videoId: string) => boolean;
    getCourseIdForVideo: (videoId: string) => string | undefined;
    refreshData: () => Promise<void>;
    clearCache: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [courseVideos, setCourseVideos] = useState<CourseVideo[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    // Cache utility functions
    const getCachedData = async function <T>(key: string): Promise<CacheData<T> | null> {
        try {
            const cached = await AsyncStorage.getItem(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error(`Error reading cache for ${key}:`, error);
            return null;
        }
    };

    const setCachedData = async function <T>(key: string, data: T[]): Promise<void> {
        try {
            const cacheData: CacheData<T> = {
                data,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(key, JSON.stringify(cacheData));
            // Run cleanup after setting cache
            await cleanupCache();
        } catch (error) {
            console.error(`Error writing cache for ${key}:`, error);
        }
    };

    const isCacheValid = (timestamp: number): boolean => {
        return Date.now() - timestamp < CACHE_KEYS.CACHE_DURATION;
    };

    // Helper function to revive dates from cached data
    const reviveDatesFromCache = (courses: Course[]): Course[] => {
        return courses.map(course => ({
            ...course,
            createdAt: new Date(course.createdAt),
            updatedAt: new Date(course.updatedAt),
        }));
    };

    const reviveVideoDatesFromCache = (videos: Video[]): Video[] => {
        return videos.map(video => ({
            ...video,
            uploadedAt: new Date(video.uploadedAt),
        }));
    };

    const clearCache = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith('cache'));
            await AsyncStorage.multiRemove(cacheKeys);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    };

    const getCacheInfo = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(key => key.startsWith('cache'));
            let totalSize = 0;
            const cacheEntries = [];

            for (const key of cacheKeys) {
                const value = await AsyncStorage.getItem(key);
                if (value) {
                    const size = new Blob([value]).size;
                    totalSize += size;
                    cacheEntries.push({ key, size });
                }
            }

            return {
                totalEntries: cacheKeys.length,
                totalSize,
                maxSize: CACHE_KEYS.MAX_CACHE_SIZE,
                entries: cacheEntries,
            };
        } catch (error) {
            console.error('Error getting cache info:', error);
            return null;
        }
    };

    const cleanupCache = async () => {
        try {
            const cacheInfo = await getCacheInfo();
            if (!cacheInfo) return;

            if (cacheInfo.totalSize > CACHE_KEYS.MAX_CACHE_SIZE) {
                // Remove oldest cache entries first
                const keys = await AsyncStorage.getAllKeys();
                const cacheKeys = keys.filter(key => key.startsWith('cache'));

                // Sort by timestamp (oldest first)
                const sortedKeys = await Promise.all(
                    cacheKeys.map(async (key) => {
                        const value = await AsyncStorage.getItem(key);
                        const timestamp = value ? JSON.parse(value).timestamp : 0;
                        return { key, timestamp };
                    })
                );

                sortedKeys.sort((a, b) => a.timestamp - b.timestamp);

                // Remove oldest entries until we're under the limit
                let currentSize = cacheInfo.totalSize;
                for (const entry of sortedKeys) {
                    if (currentSize <= CACHE_KEYS.MAX_CACHE_SIZE) break;
                    const value = await AsyncStorage.getItem(entry.key);
                    if (value) {
                        const size = new Blob([value]).size;
                        await AsyncStorage.removeItem(entry.key);
                        currentSize -= size;
                    }
                }
            }
        } catch (error) {
            console.error('Error cleaning up cache:', error);
        }
    };

    const loadData = async () => {
        try {
            setIsLoading(true);
            await Promise.all([loadCourses(), loadVideos(), loadCourseVideos(), loadEnrollments()]);
        } catch (error) {
            console.error('❌ Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCourses = async (forceRefresh = false) => {
        try {
            if (!forceRefresh) {
                const cachedCourses = await getCachedData<Course>(CACHE_KEYS.COURSES);
                if (cachedCourses && isCacheValid(cachedCourses.timestamp)) {
                    const coursesWithDates = reviveDatesFromCache(cachedCourses.data);
                    setCourses(coursesWithDates);
                    console.log(`📱 Loaded ${coursesWithDates.length} courses from local cache`);
                    return;
                }
            }

            console.log('🔄 Loading courses from Supabase...');
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedCourses: Course[] = (data as any[]).map(course => ({
                id: course.id,
                title: course.title,
                description: course.description,
                courseType: course.course_type,
                thumbnailUrl: course.thumbnail_url,
                numVideos: course.num_videos,
                zoomLink: course.zoom_link || undefined,
                tags: course.tags,
                createdAt: new Date(course.created_at),
                updatedAt: new Date(course.updated_at),
            }));

            setCourses(formattedCourses);
            await setCachedData(CACHE_KEYS.COURSES, formattedCourses);
            console.log(`✅ Successfully loaded ${formattedCourses.length} courses from Supabase`);
        } catch (error) {
            console.error('❌ Error loading courses from Supabase:', error);
        }
    };

    const loadVideos = async (forceRefresh = false) => {
        try {
            // Check cache first (unless force refresh)
            if (!forceRefresh) {
                const cachedVideos = await getCachedData<Video>(CACHE_KEYS.VIDEOS);
                if (cachedVideos && isCacheValid(cachedVideos.timestamp)) {
                    const videosWithDates = reviveVideoDatesFromCache(cachedVideos.data);
                    setVideos(videosWithDates);
                    console.log(`📱 Loaded ${videosWithDates.length} videos from local cache`);
                    return;
                }
            }

            console.log('🔄 Loading videos from Supabase...');
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            const formattedVideos: Video[] = (data as any[]).map(video => ({
                id: video.id,
                title: video.title,
                description: video.description,
                videoUrl: video.video_url,
                thumbnailUrl: video.thumbnail_url,
                resources: video.resources as any, // Type assertion for resources
                uploadedAt: new Date(video.uploaded_at),
            }));

            setVideos(formattedVideos);
            await setCachedData(CACHE_KEYS.VIDEOS, formattedVideos);
            console.log(`✅ Successfully loaded ${formattedVideos.length} videos from Supabase`);
        } catch (error) {
            console.error('❌ Error loading videos from Supabase:', error);
        }
    };

    const loadEnrollments = async () => {
        try {
            let stored: string | null = null;
            stored = await AsyncStorage.getItem('enrollments_guest');
            if (stored) {
                const parsedEnrollments = JSON.parse(stored).map((e: any) => ({
                    ...e,
                    expiryDate: new Date(e.expiryDate),
                    enrolledAt: new Date(e.enrolledAt),
                }));
                setEnrollments(parsedEnrollments);
            }
        } catch (error) {
            console.error('Error loading enrollments:', error);
        }
    };

    const saveEnrollments = async (newEnrollments: Enrollment[]) => {
        try {
            await AsyncStorage.setItem('enrollments_guest', JSON.stringify(newEnrollments));
            setEnrollments(newEnrollments);
        } catch (error) {
            console.error('Error saving enrollments:', error);
        }
    };

    const loadCourseVideos = async (forceRefresh = false) => {
        try {
            if (!forceRefresh) {
                const cached = await AsyncStorage.getItem(CACHE_KEYS.COURSE_VIDEOS);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setCourseVideos(parsed);
                    console.log(`📱 Loaded course-video relationships from local cache`);
                    return;
                }
            }

            console.log('🔄 Loading course-video relationships from Supabase...');
            const { data, error } = await supabase
                .from('course_videos')
                .select('course_id, video_id, display_order, preview_enabled')
                .order('course_id', { ascending: true });

            if (error) throw error;

            // Store as array of CourseVideo objects
            const courseVideoData: CourseVideo[] = data.map((item: any) => ({
                courseId: item.course_id,
                videoId: item.video_id,
                displayOrder: item.display_order,
                previewEnabled: item.preview_enabled || false,
            }));

            setCourseVideos(courseVideoData);
            await AsyncStorage.setItem(CACHE_KEYS.COURSE_VIDEOS, JSON.stringify(courseVideoData));
            console.log(`✅ Successfully loaded course-video relationships from Supabase`);
        } catch (error) {
            console.error('❌ Error loading course-video relationships from Supabase:', error);
        }
    };

    const enrollInCourse = async (courseId: string) => {
        const newEnrollment: Enrollment = {
            id: `enrollment_${Date.now()}`,
            userId: 'guest',
            courseId,
            status: 'active',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            enrolledAt: new Date(),
        };

        const updatedEnrollments = [...enrollments, newEnrollment];
        await saveEnrollments(updatedEnrollments);
    };

    const isEnrolled = (courseId: string): boolean => {
        return enrollments.some(
            e => e.courseId === courseId && e.userId === 'guest' && e.status === 'active'
        );
    };

    const getEnrolledCourses = (): Course[] => {
        const enrolledCourseIds = enrollments
            .filter(e => e.userId === 'guest' && e.status === 'active')
            .map(e => e.courseId);
        return courses.filter(c => enrolledCourseIds.includes(c.id));
    };

    const getCourseVideos = async (courseId: string): Promise<Video[]> => {
        try {
            // Find course-video relationships for this course
            const courseVideoRelations = courseVideos.filter(cv => cv.courseId === courseId);
            if (courseVideoRelations.length > 0) {
                // Get video IDs for this course, sorted by display order
                const videoIds = courseVideoRelations
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map(cv => cv.videoId);

                // Filter already loaded videos by the video IDs for this course
                const courseVideosFiltered = videos.filter(video => videoIds.includes(video.id));
                console.log(`📱 Loaded ${courseVideosFiltered.length} videos for course ${courseId} from local cache`);
                return courseVideosFiltered;
            }

            // Fallback to Supabase if no cached relationships
            console.log(`�🔄 Loading videos for course ${courseId} from Supabase...`);
            const { data, error } = await supabase
                .from('course_videos')
                .select(`
                    display_order,
                    preview_enabled,
                    videos (
                        id,
                        title,
                        description,
                        video_url,
                        thumbnail_url,
                        resources,
                        uploaded_at
                    )
                `)
                .eq('course_id', courseId)
                .order('display_order', { ascending: true });

            if (error) throw error;

            const courseVideosData = data.map((item: any) => ({
                id: item.videos.id,
                title: item.videos.title,
                description: item.videos.description,
                videoUrl: item.videos.video_url,
                thumbnailUrl: item.videos.thumbnail_url,
                resources: item.videos.resources,
                uploadedAt: new Date(item.videos.uploaded_at),
            }));

            console.log(`✅ Successfully loaded ${courseVideosData.length} videos for course ${courseId} from Supabase`);
            return courseVideosData;
        } catch (error) {
            console.error(`❌ Error loading videos for course ${courseId}:`, error);
            return [];
        }
    };

    const getVideoById = (videoId: string): Video | undefined => {
        return videos.find(v => v.id === videoId);
    };

    const isVideoPreviewEnabled = (courseId: string, videoId: string): boolean => {
        const courseVideo = courseVideos.find(cv => cv.courseId === courseId && cv.videoId === videoId);
        return courseVideo?.previewEnabled || false;
    };

    const getCourseIdForVideo = (videoId: string): string | undefined => {
        const courseVideo = courseVideos.find(cv => cv.videoId === videoId);
        return courseVideo?.courseId;
    };

    const refreshData = async () => {
        setIsLoading(true);
        try {
            // Clear cache and reload fresh data
            await clearCache();
            await loadCourses(true);
            await loadVideos(true);
            await loadCourseVideos(true);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const contextValue: CourseContextType = {
        courses,
        enrollments,
        isLoading,
        enrollInCourse,
        isEnrolled,
        getEnrolledCourses,
        getCourseVideos,
        getVideoById,
        isVideoPreviewEnabled,
        getCourseIdForVideo,
        refreshData,
        clearCache,
    };

    return (
        <CourseContext.Provider value={contextValue}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourses = (): CourseContextType => {
    const context = useContext(CourseContext);
    if (context === undefined) {
        throw new Error('useCourses must be used within a CourseProvider');
    }
    return context;
};