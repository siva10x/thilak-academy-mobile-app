-- Sample data insertion for Thilak Academy
-- Run this after creating the schema

-- Insert courses
INSERT INTO courses (id, title, description, course_type, thumbnail_url, num_videos, zoom_link, tags, created_at, updated_at) VALUES
('1', 'Grade 9 Mathematics Fundamentals', 'Complete course covering algebra, geometry, and basic trigonometry for Grade 9 students. Master the fundamentals with step-by-step explanations and practice problems.', 'Recording', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop', 24, NULL, ARRAY['Mathematics', 'Grade 9', 'Algebra', 'Geometry'], '2024-01-15T00:00:00Z', '2024-01-15T00:00:00Z'),
('2', 'Grade 10 Physics - Motion & Forces', 'Explore the fascinating world of physics with comprehensive coverage of motion, forces, energy, and waves. Perfect for Grade 10 students.', 'Recording', 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop', 18, NULL, ARRAY['Physics', 'Grade 10', 'Motion', 'Forces'], '2024-01-20T00:00:00Z', '2024-01-20T00:00:00Z'),
('3', 'Live Chemistry Sessions - Grade 9', 'Interactive live sessions covering atomic structure, chemical bonding, and basic reactions. Join our expert teachers for real-time learning.', 'Live', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop', 0, 'https://zoom.us/j/123456789', ARRAY['Chemistry', 'Grade 9', 'Live', 'Interactive'], '2024-02-01T00:00:00Z', '2024-02-01T00:00:00Z'),
('4', 'Grade 10 Advanced Mathematics', 'Advanced topics including quadratic equations, coordinate geometry, and introduction to calculus concepts.', 'Recording', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop', 32, NULL, ARRAY['Mathematics', 'Grade 10', 'Advanced', 'Calculus'], '2024-02-10T00:00:00Z', '2024-02-10T00:00:00Z'),
('5', 'Biology Essentials - Grade 9', 'Comprehensive coverage of cell biology, genetics, and human body systems with detailed animations and diagrams.', 'Recording', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', 20, NULL, ARRAY['Biology', 'Grade 9', 'Cells', 'Genetics'], '2024-02-15T00:00:00Z', '2024-02-15T00:00:00Z');

-- Insert videos
INSERT INTO videos (id, title, description, video_url, thumbnail_url, resources, uploaded_at) VALUES
('1', 'Introduction to Algebra', 'Learn the basics of algebraic expressions and equations', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop', '[{"title": "Algebra Worksheet", "url": "https://example.com/algebra-worksheet.pdf", "type": "pdf"}, {"title": "Practice Problems", "url": "https://example.com/practice.pdf", "type": "assignment"}]', '2024-01-16T00:00:00Z'),
('2', 'Linear Equations', 'Solving linear equations step by step', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop', '[{"title": "Linear Equations Guide", "url": "https://example.com/linear-guide.pdf", "type": "pdf"}]', '2024-01-17T00:00:00Z'),
('3', 'Quadratic Functions', 'Understanding parabolas and quadratic equations', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop', '[{"title": "Quadratic Formula Sheet", "url": "https://example.com/quadratic.pdf", "type": "pdf"}, {"title": "Graphing Assignment", "url": "https://example.com/graphing.pdf", "type": "assignment"}]', '2024-01-18T00:00:00Z'),
('4', 'Newton''s Laws of Motion', 'Comprehensive explanation of the three fundamental laws of motion', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop', '[{"title": "Newton''s Laws Summary", "url": "https://example.com/newtons-laws.pdf", "type": "pdf"}, {"title": "Force Calculations Worksheet", "url": "https://example.com/force-calc.pdf", "type": "assignment"}, {"title": "Interactive Simulation", "url": "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html", "type": "link"}]', '2024-01-21T00:00:00Z'),
('5', 'Chemical Bonding Basics', 'Introduction to ionic and covalent bonds with visual examples', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop', '[{"title": "Bonding Types Chart", "url": "https://example.com/bonding-chart.pdf", "type": "pdf"}, {"title": "Molecule Drawing Practice", "url": "https://example.com/molecule-practice.pdf", "type": "assignment"}]', '2024-02-02T00:00:00Z'),
('6', 'Cell Structure and Function', 'Detailed exploration of plant and animal cell components', 'https://drive.google.com/uc?export=download&id=10tqrdkpp-sLH2wuGgU9Xx2OEJmOh7i68', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', '[{"title": "Cell Diagram Worksheet", "url": "https://example.com/cell-diagram.pdf", "type": "pdf"}, {"title": "Organelle Functions Table", "url": "https://example.com/organelles.pdf", "type": "pdf"}, {"title": "Virtual Cell Tour", "url": "https://example.com/virtual-cell", "type": "link"}]', '2024-02-16T00:00:00Z');

-- Insert course_videos relationships
INSERT INTO course_videos (course_id, video_id, display_order) VALUES
('1', '1', 1),
('1', '2', 2),
('1', '3', 3),
('2', '4', 1),
('5', '6', 1),
('4', '1', 1),
('4', '2', 2),
('4', '3', 3);

-- Insert sample enrollments (optional - can be managed client-side)
INSERT INTO enrollments (user_id, course_id, status, expiry_date, enrolled_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', '1', 'active', '2024-12-31', '2024-01-20T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440000', '3', 'active', '2024-06-30', '2024-02-05T00:00:00Z');