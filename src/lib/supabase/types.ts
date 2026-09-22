/**
 * @file database.ts
 * @description Tipos de TypeScript generados para el esquema de base de datos de Supabase.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'superadmin' | 'owner';
          display_name: string;
          is_active: boolean;
          invited_by: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: 'superadmin' | 'owner';
          display_name: string;
          is_active?: boolean;
          invited_by?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'superadmin' | 'owner';
          display_name?: string;
          is_active?: boolean;
          invited_by?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          name: string;
          profession: string | null;
          bio: string | null;
          photo_url: string | null;
          location: string | null;
          email: string | null;
          phone: string | null;
          website: string | null;
          social_links: Json;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
          theme: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          name: string;
          profession?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          location?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          social_links?: Json;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          theme?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          name?: string;
          profession?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          location?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          social_links?: Json;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          theme?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          profile_id: string;
          type: string;
          variant: string;
          title: string | null;
          position: number;
          visible: boolean;
          config: Json;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          type: string;
          variant?: string;
          title?: string | null;
          position?: number;
          visible?: boolean;
          config?: Json;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          type?: string;
          variant?: string;
          title?: string | null;
          position?: number;
          visible?: boolean;
          config?: Json;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      experiences: {
        Row: {
          id: string;
          profile_id: string;
          company: string;
          position: string;
          description: string;
          start_date: string;
          end_date: string | null;
          is_current: boolean;
          location: string | null;
          technologies: string[] | null;
          company_url: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          company: string;
          position: string;
          description: string;
          start_date: string;
          end_date?: string | null;
          is_current?: boolean;
          location?: string | null;
          technologies?: string[] | null;
          company_url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          company?: string;
          position?: string;
          description?: string;
          start_date?: string;
          end_date?: string | null;
          is_current?: boolean;
          location?: string | null;
          technologies?: string[] | null;
          company_url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          description: string;
          image_url: string | null;
          project_url: string | null;
          github_url: string | null;
          technologies: string[] | null;
          featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          description: string;
          image_url?: string | null;
          project_url?: string | null;
          github_url?: string | null;
          technologies?: string[] | null;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          project_url?: string | null;
          github_url?: string | null;
          technologies?: string[] | null;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      education: {
        Row: {
          id: string;
          profile_id: string;
          institution: string;
          degree: string;
          field_of_study: string | null;
          start_date: string;
          end_date: string | null;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          institution: string;
          degree: string;
          field_of_study?: string | null;
          start_date: string;
          end_date?: string | null;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          institution?: string;
          degree?: string;
          field_of_study?: string | null;
          start_date?: string;
          end_date?: string | null;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          profile_id: string;
          filename: string;
          original_filename: string;
          storage_path: string;
          url: string;
          mime_type: string;
          size_bytes: number;
          width: number | null;
          height: number | null;
          alt_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          filename: string;
          original_filename: string;
          storage_path: string;
          url: string;
          mime_type: string;
          size_bytes: number;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          filename?: string;
          original_filename?: string;
          storage_path?: string;
          url?: string;
          mime_type?: string;
          size_bytes?: number;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          profile_id: string;
          analytics_id: string | null;
          custom_domain: string | null;
          maintenance_mode: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          analytics_id?: string | null;
          custom_domain?: string | null;
          maintenance_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          analytics_id?: string | null;
          custom_domain?: string | null;
          maintenance_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
