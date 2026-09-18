export type ClassroomStatus = "active" | "completed" | "cancelled";

export interface ClassroomTeacher {
  id: string;
  full_name: string;
}

export interface ClassroomGig {
  id: string;
  title: string;
}

export interface Classroom {
  id: string;
  title: string;
  teacher?: ClassroomTeacher;
  gig?: ClassroomGig;
  status: ClassroomStatus;
  created_at: string;
  updated_at: string;
}

export type ClassroomTabId =
  | "overview"
  | "sessions"
  | "chat"
  | "tasks"
  | "notes"
  | "progress"
  | "activity";

export type SessionType = "online" | "in_person";

export type SessionStatus = "scheduled" | "completed" | "cancelled";

export interface ClassroomSession {
  id: string;
  classroom_id: string;
  title: string;
  description?: string | null;
  scheduled_start: string;
  scheduled_end: string;
  session_type: SessionType;
  status: SessionStatus;
  meeting_url?: string | null;
  google_event_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}