export interface Course {
    id: string;
    title: string;
    description: string;
    courseType: string;
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
    courseId: string;
    videoId: string;
    displayOrder: number;
    previewEnabled: boolean;
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: 'active' | 'pending' | 'expired';
    expiryDate: Date | null;
    enrolledAt: Date;
}