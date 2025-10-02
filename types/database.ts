export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            courses: {
                Row: {
                    id: string
                    title: string
                    description: string
                    course_type: string
                    thumbnail_url: string
                    num_videos: number
                    zoom_link: string | null
                    tags: string[]
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    course_type: string
                    thumbnail_url: string
                    num_videos?: number
                    zoom_link?: string | null
                    tags?: string[]
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    course_type?: string
                    thumbnail_url?: string
                    num_videos?: number
                    zoom_link?: string | null
                    tags?: string[]
                    created_at?: string
                    updated_at?: string
                }
            }
            videos: {
                Row: {
                    id: string
                    title: string
                    description: string
                    video_url: string
                    thumbnail_url: string
                    resources: Json
                    uploaded_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    video_url: string
                    thumbnail_url: string
                    resources?: Json
                    uploaded_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    video_url?: string
                    thumbnail_url?: string
                    resources?: Json
                    uploaded_at?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            course_videos: {
                Row: {
                    id: string
                    course_id: string
                    video_id: string
                    display_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    course_id: string
                    video_id: string
                    display_order: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    course_id?: string
                    video_id?: string
                    display_order?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            enrollments: {
                Row: {
                    id: string
                    user_id: string
                    course_id: string
                    status: string
                    expiry_date: string | null
                    enrolled_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    course_id: string
                    status: string
                    expiry_date?: string | null
                    enrolled_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    course_id?: string
                    status?: string
                    expiry_date?: string | null
                    enrolled_at?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                }
            }
            user_sessions: {
                Row: {
                    id: string
                    user_id: string
                    session_id: string
                    device_info: Json | null
                    created_at: string | null
                    last_active: string | null
                    is_active: boolean | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    session_id: string
                    device_info?: Json | null
                    created_at?: string | null
                    last_active?: string | null
                    is_active?: boolean | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    session_id?: string
                    device_info?: Json | null
                    created_at?: string | null
                    last_active?: string | null
                    is_active?: boolean | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}