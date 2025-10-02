-- Supabase Database Schema for Thilak Academy Mobile App
-- Run these SQL commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    course_type TEXT NOT NULL CHECK (course_type IN ('Recording', 'Live')),
    thumbnail_url TEXT NOT NULL,
    num_videos INTEGER NOT NULL DEFAULT 0,
    zoom_link TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    resources JSONB NOT NULL DEFAULT '[]',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_videos junction table
CREATE TABLE IF NOT EXISTS course_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    UNIQUE(course_id, video_id)
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL, -- For now using text, can be UUID if using Supabase auth
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_videos_course_id ON course_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_course_videos_video_id ON course_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_course_type ON courses(course_type);

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your auth setup)
CREATE POLICY "Courses are viewable by everyone" ON courses FOR SELECT USING (true);
CREATE POLICY "Videos are viewable by everyone" ON videos FOR SELECT USING (true);
CREATE POLICY "Course videos are viewable by everyone" ON course_videos FOR SELECT USING (true);
CREATE POLICY "Enrollments are viewable by owner" ON enrollments FOR SELECT USING (user_id = auth.uid()::text OR user_id = 'guest');

-- Insert sample data (you can modify or remove this)
-- Note: Replace with your actual data or run separately

create table public.user_sessions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  session_id text not null,
  device_info jsonb null,
  created_at timestamp with time zone null default now(),
  last_active timestamp with time zone null default now(),
  is_active boolean null default true,
  constraint user_sessions_pkey primary key (id),
  constraint user_sessions_session_id_key unique (session_id),
  constraint user_sessions_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger on_user_session_insert
after INSERT on user_sessions for EACH row
execute FUNCTION handle_user_login ();