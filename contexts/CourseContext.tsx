import { mockCourses, mockCourseVideos, mockEnrollments, mockVideos } from '@/data/mockData';
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
    getCourseVideos: (courseId: string) => Video[];
    getVideoById: (videoId: string) => Video | undefined;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [courses] = useState<Course[]>(mockCourses);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadEnrollments();
    }, []);

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
            } else {
                // Load mock enrollments for demo
                setEnrollments(mockEnrollments);
                await AsyncStorage.setItem('enrollments_guest', JSON.stringify(mockEnrollments));
            }
        } catch (error) {
            console.error('Error loading enrollments:', error);
        } finally {
            setIsLoading(false);
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