import { mockCourses, mockCourseVideos, mockEnrollments, mockVideos } from '@/data/mockData';
import { Course, Enrollment, Video } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';

interface CourseContextType {
    courses: Course[];
    enrollments: Enrollment[];
    isLoading: boolean;
    enrollInCourse: (courseId: string) => Promise<void>;
    isEnrolled: (courseId: string) => boolean;
    getEnrolledCourses: () => Course[];
    getCourseVideos: (courseId: string) => Video[];
    getVideoById: (videoId: string) => Video | undefined;
}

export const [CourseProvider, useCourses] = createContextHook((): CourseContextType => {
    const authContext = useAuth();
    const user = authContext?.user || null;
    const [courses] = useState<Course[]>(mockCourses);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadEnrollments();
        } else {
            setEnrollments([]);
            setIsLoading(false);
        }
    }, [user]);

    const loadEnrollments = async () => {
        try {
            let stored: string | null = null;
            stored = await AsyncStorage.getItem(`enrollments_${user?.id}`);
            if (stored) {
                const parsedEnrollments = JSON.parse(stored).map((e: any) => ({
                    ...e,
                    expiryDate: new Date(e.expiryDate),
                    enrolledAt: new Date(e.enrolledAt),
                }));
                setEnrollments(parsedEnrollments);
            } else {
                // Load mock enrollments for demo
                setEnrollments(mockEnrollments);
                await AsyncStorage.setItem(`enrollments_${user?.id}`, JSON.stringify(mockEnrollments));
            }
        } catch (error) {
            console.error('Error loading enrollments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveEnrollments = async (newEnrollments: Enrollment[]) => {
        try {
            await AsyncStorage.setItem(`enrollments_${user?.id}`, JSON.stringify(newEnrollments));
            setEnrollments(newEnrollments);
        } catch (error) {
            console.error('Error saving enrollments:', error);
        }
    };

    const enrollInCourse = async (courseId: string) => {
        if (!user) return;

        const newEnrollment: Enrollment = {
            id: `enrollment_${Date.now()}`,
            userId: user.id,
            courseId,
            status: 'active',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            enrolledAt: new Date(),
        };

        const updatedEnrollments = [...enrollments, newEnrollment];
        await saveEnrollments(updatedEnrollments);
    };

    const isEnrolled = (courseId: string): boolean => {
        if (!user) return false;
        return enrollments.some(
            e => e.courseId === courseId && e.userId === user.id && e.status === 'active'
        );
    };

    const getEnrolledCourses = (): Course[] => {
        if (!user) return [];
        const enrolledCourseIds = enrollments
            .filter(e => e.userId === user.id && e.status === 'active')
            .map(e => e.courseId);
        return courses.filter(c => enrolledCourseIds.includes(c.id));
    };

    const getCourseVideos = (courseId: string): Video[] => {
        const courseVideoIds = mockCourseVideos
            .filter(cv => cv.courseId === courseId)
            .sort((a, b) => a.order - b.order)
            .map(cv => cv.videoId);

        return courseVideoIds
            .map(videoId => mockVideos.find(v => v.id === videoId))
            .filter(Boolean) as Video[];
    };

    const getVideoById = (videoId: string): Video | undefined => {
        return mockVideos.find(v => v.id === videoId);
    };

    return {
        courses,
        enrollments,
        isLoading,
        enrollInCourse,
        isEnrolled,
        getEnrolledCourses,
        getCourseVideos,
        getVideoById,
    };
});