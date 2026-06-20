/**
 * Supabase database types — mirrors supabase/migrations/20250619000000_initial_schema.sql
 * Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
 */

export type UserRole =
  | 'super_admin'
  | 'senior_pastor'
  | 'administrative_manager'
  | 'admin'
  | 'pastor'
  | 'leader'
  | 'member'
  | 'visitor';
export type InviteRequestStatus = 'pending' | 'approved' | 'declined';
export type InviteStatus = 'pending' | 'accepted' | 'expired';
export type ApplicationStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type MemberStatus = 'active' | 'inactive' | 'suspended';
export type GroupCategory = 'ministry' | 'community';
export type GroupMemberRole = 'leader' | 'member';
export type BroadcastStatus = 'draft' | 'scheduled' | 'sent';
export type FollowUpStage = 'cold' | 'engaging' | 'committed';
export type RsvpStatus = 'going' | 'maybe' | 'declined';

export interface Database {
  public: {
    Tables: {
      campuses: {
        Row: {
          id: string;
          label: string;
          created_at: string;
        };
        Insert: {
          id: string;
          label: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          phone: string;
          role: UserRole;
          campus_id: string | null;
          official_name: string | null;
          username: string | null;
          display_name: string | null;
          photo_url: string | null;
          email: string | null;
          gender: 'Male' | 'Female' | null;
          password_hash: string | null;
          date_of_birth: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          role?: UserRole;
          campus_id?: string | null;
          official_name?: string | null;
          username?: string | null;
          display_name?: string | null;
          photo_url?: string | null;
          email?: string | null;
          gender?: 'Male' | 'Female' | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          role?: UserRole;
          campus_id?: string | null;
          official_name?: string | null;
          username?: string | null;
          display_name?: string | null;
          photo_url?: string | null;
          email?: string | null;
          gender?: 'Male' | 'Female' | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invite_requests: {
        Row: {
          id: string;
          surname: string;
          full_name: string;
          phone: string;
          email: string | null;
          campus_id: string;
          status: InviteRequestStatus;
          notes: string | null;
          requested_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          id?: string;
          surname: string;
          full_name: string;
          phone: string;
          email?: string | null;
          campus_id: string;
          status?: InviteRequestStatus;
          notes?: string | null;
          requested_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          id?: string;
          surname?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          campus_id?: string;
          status?: InviteRequestStatus;
          notes?: string | null;
          requested_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
      };
      invites: {
        Row: {
          id: string;
          token: string;
          phone: string;
          email: string | null;
          official_name: string;
          username: string | null;
          campus_id: string | null;
          invite_request_id: string | null;
          status: InviteStatus;
          sent_at: string;
          accepted_at: string | null;
          expires_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          token: string;
          phone: string;
          email?: string | null;
          official_name: string;
          username?: string | null;
          campus_id?: string | null;
          invite_request_id?: string | null;
          status?: InviteStatus;
          sent_at?: string;
          accepted_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          token?: string;
          phone?: string;
          email?: string | null;
          official_name?: string;
          username?: string | null;
          campus_id?: string | null;
          invite_request_id?: string | null;
          status?: InviteStatus;
          sent_at?: string;
          accepted_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
        };
      };
      membership_applications: {
        Row: {
          id: string;
          invite_id: string | null;
          phone: string;
          campus_id: string;
          status: ApplicationStatus;
          application_data: Record<string, unknown>;
          submitted_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          review_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invite_id?: string | null;
          phone: string;
          campus_id: string;
          status?: ApplicationStatus;
          application_data?: Record<string, unknown>;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          review_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invite_id?: string | null;
          phone?: string;
          campus_id?: string;
          status?: ApplicationStatus;
          application_data?: Record<string, unknown>;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          review_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          profile_id: string | null;
          application_id: string | null;
          campus_id: string;
          status: MemberStatus;
          surname: string;
          full_name: string;
          username: string | null;
          phone: string;
          email: string | null;
          gender: 'Male' | 'Female' | null;
          password_hash: string | null;
          date_of_birth: string | null;
          age: number | null;
          marital_status: string | null;
          member_since: string;
          covenant_signed_at: string | null;
          id_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          application_id?: string | null;
          campus_id: string;
          status?: MemberStatus;
          surname: string;
          full_name: string;
          username?: string | null;
          phone: string;
          email?: string | null;
          gender?: 'Male' | 'Female' | null;
          date_of_birth?: string | null;
          age?: number | null;
          marital_status?: string | null;
          member_since?: string;
          covenant_signed_at?: string | null;
          id_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          application_id?: string | null;
          campus_id?: string;
          status?: MemberStatus;
          surname?: string;
          full_name?: string;
          username?: string | null;
          phone?: string;
          email?: string | null;
          gender?: 'Male' | 'Female' | null;
          date_of_birth?: string | null;
          age?: number | null;
          marital_status?: string | null;
          member_since?: string;
          covenant_signed_at?: string | null;
          id_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          category: GroupCategory;
          campus_id: string;
          description: string | null;
          leader_profile_id: string | null;
          leader_phone: string;
          leader_name: string;
          enable_song_library: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: GroupCategory;
          campus_id: string;
          description?: string | null;
          leader_profile_id?: string | null;
          leader_phone: string;
          leader_name: string;
          enable_song_library?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: GroupCategory;
          campus_id?: string;
          description?: string | null;
          leader_profile_id?: string | null;
          leader_phone?: string;
          leader_name?: string;
          enable_song_library?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          profile_id: string | null;
          member_phone: string;
          role: GroupMemberRole;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          profile_id?: string | null;
          member_phone: string;
          role?: GroupMemberRole;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          profile_id?: string | null;
          member_phone?: string;
          role?: GroupMemberRole;
          joined_at?: string;
        };
      };
      group_broadcasts: {
        Row: {
          id: string;
          group_id: string;
          message: string;
          scheduled_at: string;
          status: BroadcastStatus;
          created_by: string | null;
          created_by_phone: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          message: string;
          scheduled_at: string;
          status?: BroadcastStatus;
          created_by?: string | null;
          created_by_phone?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          message?: string;
          scheduled_at?: string;
          status?: BroadcastStatus;
          created_by?: string | null;
          created_by_phone?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
      };
      group_songs: {
        Row: {
          id: string;
          group_id: string;
          title: string;
          musical_key: string;
          verse1: string;
          verse2: string;
          chorus: string;
          bridge: string | null;
          notes: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          title: string;
          musical_key: string;
          verse1?: string;
          verse2?: string;
          chorus?: string;
          bridge?: string | null;
          notes?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          title?: string;
          musical_key?: string;
          verse1?: string;
          verse2?: string;
          chorus?: string;
          bridge?: string | null;
          notes?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
      };
      follow_ups: {
        Row: {
          id: string;
          name: string;
          phone: string;
          campus_id: string;
          stage: FollowUpStage;
          source: string | null;
          last_contact_at: string | null;
          assigned_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          campus_id: string;
          stage?: FollowUpStage;
          source?: string | null;
          last_contact_at?: string | null;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          campus_id?: string;
          stage?: FollowUpStage;
          source?: string | null;
          last_contact_at?: string | null;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      visitors: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          campus_id: string | null;
          source: string | null;
          first_visit_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          campus_id?: string | null;
          source?: string | null;
          first_visit_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          campus_id?: string | null;
          source?: string | null;
          first_visit_at?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          campus_id: string | null;
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          campus_id?: string | null;
          location?: string | null;
          starts_at: string;
          ends_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          campus_id?: string | null;
          location?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_rsvps: {
        Row: {
          id: string;
          event_id: string;
          visitor_id: string | null;
          profile_id: string | null;
          name: string;
          phone: string | null;
          status: RsvpStatus;
          rsvp_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          visitor_id?: string | null;
          profile_id?: string | null;
          name: string;
          phone?: string | null;
          status?: RsvpStatus;
          rsvp_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          visitor_id?: string | null;
          profile_id?: string | null;
          name?: string;
          phone?: string | null;
          status?: RsvpStatus;
          rsvp_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      invite_request_status: InviteRequestStatus;
      invite_status: InviteStatus;
      application_status: ApplicationStatus;
      member_status: MemberStatus;
      group_category: GroupCategory;
      group_member_role: GroupMemberRole;
      broadcast_status: BroadcastStatus;
      follow_up_stage: FollowUpStage;
      rsvp_status: RsvpStatus;
    };
  };
}
