import { supabase } from '@/lib/supabase';
import { Course, CourseVideo, Enrollment, Video } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface CourseContextType {
    courses: Course[];
    enrollments: Enrollment[];
    isLoading: boolean;
    enrollInCourse: (courseId: string) => Promise<void>;
    isEnrolled: (courseId: string) => boolean;
    getEnrollmentStatus: (courseId: string) => 'active' | 'pending' | 'expired' | null;
    getEnrolledCourses: () => Course[];
    getCourseVideos: (courseId: string) => Promise<Video[]>;
    getVideoById: (videoId: string) => Video | undefined;
    isVideoPreviewEnabled: (courseId: string, videoId: string) => boolean;
    getCourseIdForVideo: (videoId: string) => string | undefined;
    refreshData: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

interface CourseProviderProps {
    children: React.ReactNode;
    user?: { id: string; email?: string } | null;
}

export const CourseProvider: React.FC<CourseProviderProps> = ({ children, user }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [courseVideos, setCourseVideos] = useState<CourseVideo[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (!hasLoaded) {
            loadData();
        }
    }, [hasLoaded]);

    useEffect(() => {
        if (user?.id) {
            loadEnrollments();
        } else {
            setEnrollments([]);
        }
    }, [user?.id]);



    const loadData = async () => {
        if (hasLoaded) {
            return;
        }

        try {
            setIsLoading(true);
            await Promise.all([loadCourses(), loadVideos(), loadCourseVideos()]);
            setHasLoaded(true);
        } catch (error) {
            Alert.alert('Loading Error', 'Error loading data');
        } finally {
            setIsLoading(false);
        }
    };

    const loadCourses = async () => {
        try {
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
        } catch (error) {
            Alert.alert('Loading Error', 'Error loading courses from Database');
        }
    };

    const loadVideos = async () => {
        try {
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
                vimeoId: video.vimeo_id || undefined,
                resources: video.resources as any, // Type assertion for resources
                uploadedAt: new Date(video.uploaded_at),
            }));

            setVideos(formattedVideos);
        } catch (error) {
            Alert.alert('Loading Error', 'Error loading videos from Database');
        }
    };

    const loadEnrollments = async () => {
        try {
            if (user?.id) {
                // Fetch enrollments from Supabase for authenticated user
                const { data, error } = await supabase
                    .from('enrollments')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('enrolled_at', { ascending: false });

                if (error) {
                    Alert.alert('Loading Error', 'Error fetching enrollments');
                    return;
                }

                const formattedEnrollments: Enrollment[] = (data as any[]).map((enrollment: any) => ({
                    id: enrollment.id,
                    userId: enrollment.user_id,
                    courseId: enrollment.course_id,
                    status: enrollment.status as 'active' | 'expired' | 'pending',
                    expiryDate: enrollment.expiry_date ? new Date(enrollment.expiry_date) : null,
                    enrolledAt: new Date(enrollment.enrolled_at),
                }));

                setEnrollments(formattedEnrollments);
            } else {
                // Clear enrollments if no authenticated user
                setEnrollments([]);
            }
        } catch (error) {
            Alert.alert('Loading Error', 'Error loading enrollments');
        }
    };

    const loadCourseVideos = async () => {
        try {
            const { data, error } = await supabase
                .from('course_videos')
                .select('course_id, video_id, display_order, preview_enabled')
                .order('display_order', { ascending: true });

            if (error) throw error;

            // Store as array of CourseVideo objects
            const courseVideoData: CourseVideo[] = data.map((item: any) => ({
                courseId: item.course_id,
                videoId: item.video_id,
                displayOrder: item.display_order,
                previewEnabled: item.preview_enabled || false,
            }));

            setCourseVideos(courseVideoData);
        } catch (error) {
            Alert.alert('Loading Error', 'Error loading course-video relationships from Database');
        }
    };

    const enrollInCourse = async (courseId: string) => {
        if (!user?.id) {
            throw new Error('User must be authenticated to enroll in courses');
        }

        try {
            // Check if this is the demo user - check both ID and email
            const isDemoUser = user.email && user.email === 'app.demo.2026@gmail.com';

            // First, check if user already has an enrollment for this course
            const { data: existingEnrollments, error: checkError } = await supabase
                .from('enrollments')
                .select('*')
                .eq('user_id', user.id)
                .eq('course_id', courseId);

            if (checkError) {
                Alert.alert('Enrollment Error', 'Error checking existing enrollment');
                throw checkError;
            }

            if (existingEnrollments && existingEnrollments.length > 0) {
                const existingEnrollment = existingEnrollments[0] as any;

                // User already has an enrollment
                if (existingEnrollment.status === 'active') {
                    Alert.alert('Already Enrolled', 'You are already enrolled in this course');
                    return;
                } else if (existingEnrollment.status === 'pending' && !isDemoUser) {
                    Alert.alert('Enrollment Pending', 'Your enrollment request is already pending approval');
                    return;
                } else if (existingEnrollment.status === 'expired' || (existingEnrollment.status === 'pending' && isDemoUser)) {
                    // Delete the expired/pending enrollment and create a new one
                    const { error: deleteError } = await supabase
                        .from('enrollments')
                        .delete()
                        .eq('id', existingEnrollment.id);

                    if (deleteError) {
                        Alert.alert('Enrollment Error', 'Error updating enrollment status');
                        throw deleteError;
                    }

                    // Create new enrollment (active for demo user, pending for others)
                    const enrollmentData = {
                        user_id: user.id,
                        course_id: courseId,
                        status: isDemoUser ? 'active' : 'pending',
                        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
                    };

                    const { error: insertError } = await supabase
                        .from('enrollments')
                        .insert([enrollmentData] as any);

                    if (insertError) {
                        Alert.alert('Enrollment Error', 'Error creating new enrollment');
                        throw insertError;
                    }
                }
            } else {
                // No existing enrollment, create a new one
                const enrollmentData = {
                    user_id: user.id,
                    course_id: courseId,
                    status: isDemoUser ? 'active' : 'pending',
                    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
                };

                const { error: insertError } = await supabase
                    .from('enrollments')
                    .insert([enrollmentData] as any);

                if (insertError) {
                    Alert.alert('Enrollment Error', 'Error creating enrollment');
                    throw insertError;
                }
            }

            // Refresh enrollments to include the updated/new enrollment
            await loadEnrollments();
        } catch (error) {
            Alert.alert('Enrollment Error', 'Failed to enroll in course');
            throw error;
        }
    };

    const isEnrolled = (courseId: string): boolean => {
        if (!user?.id) return false;
        return enrollments.some(
            e => e.courseId === courseId && e.userId === user.id && e.status === 'active'
        );
    };

    const getEnrollmentStatus = (courseId: string): 'active' | 'pending' | 'expired' | null => {
        if (!user?.id) return null;
        const enrollment = enrollments.find(
            e => e.courseId === courseId && e.userId === user.id
        );
        return enrollment ? enrollment.status : null;
    };

    const getEnrolledCourses = (): Course[] => {
        if (!user?.id) return [];
        const enrolledCourseIds = enrollments
            .filter(e => e.userId === user.id && (e.status === 'active' || e.status === 'pending'))
            .map(e => e.courseId);
        return courses.filter(c => enrolledCourseIds.includes(c.id));
    };

    const getCourseVideos = async (courseId: string): Promise<Video[]> => {
        try {
            // Find course-video relationships for this course
            const courseVideoRelations = courseVideos.filter(cv => cv.courseId === courseId);
            if (courseVideoRelations.length > 0) {
                // Sort course-video relationships by display order
                const sortedRelations = courseVideoRelations
                    .sort((a, b) => a.displayOrder - b.displayOrder);

                // Map to videos in the correct order
                const courseVideosFiltered = sortedRelations
                    .map(relation => videos.find(video => video.id === relation.videoId))
                    .filter(video => video !== undefined) as Video[];

                return courseVideosFiltered;
            }

            // Fallback to Supabase if no cached relationships
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
                        vimeo_id,
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
                vimeoId: item.videos.vimeo_id || undefined,
                resources: item.videos.resources,
                uploadedAt: new Date(item.videos.uploaded_at),
            }));

            return courseVideosData;
        } catch (error) {
            Alert.alert('Loading Error', `Error loading videos for course ${courseId}`);
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
        setHasLoaded(false);
        try {
            // Reload fresh data
            await loadCourses();
            await loadVideos();
            await loadCourseVideos();
            await loadEnrollments(); // Add this to refresh enrollment data
            setHasLoaded(true);
        } catch (error) {
            Alert.alert('Refresh Error', 'Error refreshing data');
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
        getEnrollmentStatus,
        getEnrolledCourses,
        getCourseVideos,
        getVideoById,
        isVideoPreviewEnabled,
        getCourseIdForVideo,
        refreshData,
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