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
      areas: {
        Row: {
          id: string
          name_en: string
          name_jp: string | null
          description: string | null
          bounds: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_jp?: string | null
          description?: string | null
          bounds?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_jp?: string | null
          description?: string | null
          bounds?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          full_name: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          email: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          email?: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      spots: {
        Row: {
          id: string
          name_en: string
          name_jp: string | null
          description: string | null
          location: string // geography(Point)
          works_name: string
          address: string | null
          image_url: string | null
          area_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name_en: string
          name_jp?: string | null
          description?: string | null
          location: string
          works_name: string
          address?: string | null
          image_url?: string | null
          area_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name_en?: string
          name_jp?: string | null
          description?: string | null
          location?: string
          works_name?: string
          address?: string | null
          image_url?: string | null
          area_id?: string | null
          created_at?: string
        }
      }
      routes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          cover_photo_url: string | null
          view_count: number | null
          save_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          cover_photo_url?: string | null
          view_count?: number | null
          save_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          cover_photo_url?: string | null
          view_count?: number | null
          save_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      route_spots: {
        Row: {
          id: string
          route_id: string
          spot_id: string | null
          order_index: number
          visited_at: string | null
          comment: string | null
          photo_url: string
          latitude: number
          longitude: number
          is_manual_spot: boolean | null
        }
        Insert: {
          id?: string
          route_id: string
          spot_id?: string | null
          order_index: number
          visited_at?: string | null
          comment?: string | null
          photo_url: string
          latitude: number
          longitude: number
          is_manual_spot?: boolean | null
        }
        Update: {
          id?: string
          route_id?: string
          spot_id?: string | null
          order_index?: number
          visited_at?: string | null
          comment?: string | null
          photo_url?: string
          latitude?: number
          longitude?: number
          is_manual_spot?: boolean | null
        }
      }
      saved_routes: {
        Row: {
          user_id: string
          route_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          route_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          route_id?: string
          created_at?: string
        }
      }
    }
  }
}
