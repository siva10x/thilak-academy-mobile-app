import { supabase } from '@/lib/supabase';
import { Course, Enrollment, Video } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CourseContextType {
    courses: Course[];
    enrollments: Enrollment[];
    isLoading: boolean;
    enrollInCourse: (courseId: string) => Promise<void>;
    isEnrolled: (courseId: string) => boolean;
    getEnrolledCourses: () => Course[];
    getCourseVideos: (courseId: string) => Promise<Video[]>;
    getVideoById: (videoId: string) => Video | undefined;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            console.log('🚀 Starting to load all data from Supabase...');
            setIsLoading(true);
            await Promise.all([loadCourses(), loadVideos(), loadEnrollments()]);
            console.log('🎉 All data loaded successfully from Supabase');
        } catch (error) {
            console.error('❌ Error loading data from Supabase:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCourses = async () => {
        try {
            console.log('🔄 Loading courses from Supabase...');
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedCourses: Course[] = data.map(course => ({
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
            console.log(`✅ Successfully loaded ${formattedCourses.length} courses from Supabase`);
        } catch (error) {
            console.error('❌ Error loading courses from Supabase:', error);
        }
    };

    const loadVideos = async () => {
        try {
            console.log('🔄 Loading videos from Supabase...');
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            const formattedVideos: Video[] = data.map(video => ({
                id: video.id,
                title: video.title,
                description: video.description,
                videoUrl: video.video_url,
                thumbnailUrl: video.thumbnail_url,
                resources: video.resources as any, // Type assertion for resources
                uploadedAt: new Date(video.uploaded_at),
            }));

            setVideos(formattedVideos);
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
            console.log(`🔄 Loading videos for course ${courseId} from Supabase...`);
            const { data, error } = await supabase
                .from('course_videos')
                .select(`
                    display_order,
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

            const courseVideos = data.map((item: any) => ({
                id: item.videos.id,
                title: item.videos.title,
                description: item.videos.description,
                videoUrl: item.videos.video_url,
                thumbnailUrl: item.videos.thumbnail_url,
                resources: item.videos.resources,
                uploadedAt: new Date(item.videos.uploaded_at),
            }));

            console.log(`✅ Successfully loaded ${courseVideos.length} videos for course ${courseId}`);
            return courseVideos;
        } catch (error) {
            console.error(`❌ Error loading videos for course ${courseId} from Supabase:`, error);
            return [];
        }
    };

    const getVideoById = (videoId: string): Video | undefined => {
        return videos.find(v => v.id === videoId);
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