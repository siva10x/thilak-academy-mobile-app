import { Course, CourseVideo, Enrollment, Video } from '@/types';

export const mockCourses: Course[] = [
    {
        id: '1',
        title: 'Grade 9 Mathematics Fundamentals',
        description: 'Complete course covering algebra, geometry, and basic trigonometry for Grade 9 students. Master the fundamentals with step-by-step explanations and practice problems.',
        courseType: 'Recording',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
        numVideos: 24,
        tags: ['Mathematics', 'Grade 9', 'Algebra', 'Geometry'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: '2',
        title: 'Grade 10 Physics - Motion & Forces',
        description: 'Explore the fascinating world of physics with comprehensive coverage of motion, forces, energy, and waves. Perfect for Grade 10 students.',
        courseType: 'Recording',
        thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop',
        numVideos: 18,
        tags: ['Physics', 'Grade 10', 'Motion', 'Forces'],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
    },
    {
        id: '3',
        title: 'Live Chemistry Sessions - Grade 9',
        description: 'Interactive live sessions covering atomic structure, chemical bonding, and basic reactions. Join our expert teachers for real-time learning.',
        courseType: 'Live',
        thumbnailUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop',
        numVideos: 0,
        zoomLink: 'https://zoom.us/j/123456789',
        tags: ['Chemistry', 'Grade 9', 'Live', 'Interactive'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
    },
    {
        id: '4',
        title: 'Grade 10 Advanced Mathematics',
        description: 'Advanced topics including quadratic equations, coordinate geometry, and introduction to calculus concepts.',
        courseType: 'Recording',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
        numVideos: 32,
        tags: ['Mathematics', 'Grade 10', 'Advanced', 'Calculus'],
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
    },
    {
        id: '5',
        title: 'Biology Essentials - Grade 9',
        description: 'Comprehensive coverage of cell biology, genetics, and human body systems with detailed animations and diagrams.',
        courseType: 'Recording',
        thumbnailUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
        numVideos: 20,
        tags: ['Biology', 'Grade 9', 'Cells', 'Genetics'],
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15'),
    },
];

export const mockVideos: Video[] = [
    {
        id: '1',
        title: 'Introduction to Algebra',
        description: 'Learn the basics of algebraic expressions and equations',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
        resources: [
            { title: 'Algebra Worksheet', url: 'https://example.com/algebra-worksheet.pdf', type: 'pdf' },
            { title: 'Practice Problems', url: 'https://example.com/practice.pdf', type: 'assignment' },
        ],
        uploadedAt: new Date('2024-01-16'),
    },
    {
        id: '2',
        title: 'Linear Equations',
        description: 'Solving linear equations step by step',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
        resources: [
            { title: 'Linear Equations Guide', url: 'https://example.com/linear-guide.pdf', type: 'pdf' },
        ],
        uploadedAt: new Date('2024-01-17'),
    },
    {
        id: '3',
        title: 'Quadratic Functions',
        description: 'Understanding parabolas and quadratic equations',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
        resources: [
            { title: 'Quadratic Formula Sheet', url: 'https://example.com/quadratic.pdf', type: 'pdf' },
            { title: 'Graphing Assignment', url: 'https://example.com/graphing.pdf', type: 'assignment' },
        ],
        uploadedAt: new Date('2024-01-18'),
    },
    {
        id: '4',
        title: 'Newton\'s Laws of Motion',
        description: 'Comprehensive explanation of the three fundamental laws of motion',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop',
        resources: [
            { title: 'Newton\'s Laws Summary', url: 'https://example.com/newtons-laws.pdf', type: 'pdf' },
            { title: 'Force Calculations Worksheet', url: 'https://example.com/force-calc.pdf', type: 'assignment' },
            { title: 'Interactive Simulation', url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html', type: 'link' },
        ],
        uploadedAt: new Date('2024-01-21'),
    },
    {
        id: '5',
        title: 'Chemical Bonding Basics',
        description: 'Introduction to ionic and covalent bonds with visual examples',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop',
        resources: [
            { title: 'Bonding Types Chart', url: 'https://example.com/bonding-chart.pdf', type: 'pdf' },
            { title: 'Molecule Drawing Practice', url: 'https://example.com/molecule-practice.pdf', type: 'assignment' },
        ],
        uploadedAt: new Date('2024-02-02'),
    },
    {
        id: '6',
        title: 'Cell Structure and Function',
        description: 'Detailed exploration of plant and animal cell components',
        videoUrl: 'https://drive.google.com/uc?export=download&id=10tqrdkpp-sLH2wuGgU9Xx2OEJmOh7i68',
        thumbnailUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
        resources: [
            { title: 'Cell Diagram Worksheet', url: 'https://example.com/cell-diagram.pdf', type: 'pdf' },
            { title: 'Organelle Functions Table', url: 'https://example.com/organelles.pdf', type: 'pdf' },
            { title: 'Virtual Cell Tour', url: 'https://example.com/virtual-cell', type: 'link' },
        ],
        uploadedAt: new Date('2024-02-16'),
    },
];

export const mockCourseVideos: CourseVideo[] = [
    // Grade 9 Mathematics Fundamentals
    { id: '1', courseId: '1', videoId: '1', order: 1 },
    { id: '2', courseId: '1', videoId: '2', order: 2 },
    { id: '3', courseId: '1', videoId: '3', order: 3 },

    // Grade 10 Physics - Motion & Forces
    { id: '4', courseId: '2', videoId: '4', order: 1 },

    // Biology Essentials - Grade 9
    { id: '5', courseId: '5', videoId: '6', order: 1 },

    // Grade 10 Advanced Mathematics
    { id: '6', courseId: '4', videoId: '1', order: 1 },
    { id: '7', courseId: '4', videoId: '2', order: 2 },
    { id: '8', courseId: '4', videoId: '3', order: 3 },
];

export const mockEnrollments: Enrollment[] = [
    {
        id: '1',
        userId: 'user1',
        courseId: '1',
        status: 'active',
        expiryDate: new Date('2024-12-31'),
        enrolledAt: new Date('2024-01-20'),
    },
    {
        id: '2',
        userId: 'user1',
        courseId: '3',
        status: 'active',
        expiryDate: new Date('2024-06-30'),
        enrolledAt: new Date('2024-02-05'),
    },
];