export interface User {
    id: string;
    displayName: string;
    email: string;
    photoUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    courseType: 'Recording' | 'Live';
    thumbnailUrl: string;
    numVideos: number;
    zoomLink?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Video {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    resources: Resource[];
    uploadedAt: Date;
}

export interface Resource {
    title: string;
    url: string;
    type: 'pdf' | 'assignment' | 'link';
}

export interface CourseVideo {
    id: string;
    courseId: string;
    videoId: string;
    order: number;
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: 'active' | 'expired' | 'pending';
    expiryDate: Date;
    enrolledAt: Date;
}