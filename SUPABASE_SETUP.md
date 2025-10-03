# Supabase Database Setup Guide

This guide will help you set up the Supabase database for the Thilak Academy Mobile App.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project

## Setup Steps

### 1. Create Database Tables

Go to your Supabase project dashboard and navigate to the SQL Editor. Run the SQL commands from `database/schema.sql` to create the necessary tables:

- `courses` - Stores course information
- `videos` - Stores video information
- `course_videos` - Junction table linking courses to videos
- `enrollments` - Stores user enrollments (optional, currently using local storage)

### 2. Insert Sample Data

After creating the tables, run the SQL commands from `database/seed.sql` to populate the database with sample data that matches the original mock data.

### 3. Configure Environment Variables

The environment variables are already set up in your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=https://fiesepmbrpqciywrxwig.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If you're using your own Supabase project, replace these with your project's URL and anon key from the Supabase dashboard (Settings > API).

### 4. Row Level Security (Optional)

The schema includes basic RLS policies. You can modify them in the Supabase dashboard under Authentication > Policies if you need different access controls.

## Database Schema

### Courses Table
- `id` (UUID, Primary Key)
- `title` (Text)
- `description` (Text)
- `course_type` (Text)
- `thumbnail_url` (Text)
- `num_videos` (Integer)
- `zoom_link` (Text, nullable)
- `tags` (Text array)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Videos Table
- `id` (UUID, Primary Key)
- `title` (Text)
- `description` (Text)
- `video_url` (Text)
- `thumbnail_url` (Text)
- `resources` (JSONB)
- `uploaded_at` (Timestamp)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Course Videos Table
- `id` (UUID, Primary Key)
- `course_id` (UUID, Foreign Key to courses)
- `video_id` (UUID, Foreign Key to videos)
- `display_order` (Integer)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Enrollments Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to profiles)
- `course_id` (UUID, Foreign Key to courses)
- `status` (Text) - No constraints, can be any string value
- `expiry_date` (Date, nullable)
- `enrolled_at` (Timestamp)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Profiles Table
- `id` (UUID, Primary Key, references auth.users)
- `updated_at` (Timestamp, nullable)
- `username` (Text, unique, nullable)
- `full_name` (Text, nullable)
- `avatar_url` (Text, nullable)
- `website` (Text, nullable)

## Testing

After setup, run the app and verify that:
1. Courses load from the database
2. Course details show videos from the database
3. Enrollment functionality still works (uses local storage)

## Notes

- Enrollments are currently stored in AsyncStorage for simplicity. You can modify the CourseContext to store them in Supabase if needed.
- The app uses the 'guest' user ID for enrollments. If you implement authentication, update the user handling accordingly.