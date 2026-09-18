import { apiFetch } from "@/lib/api";

export type EnrollmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type EnrollmentClassroomStatus = "active" | "completed" | "cancelled";

export interface EnrollmentGig {
  id: string;
  title: string;
}

export interface EnrollmentClassroom {
  id: string;
  title: string;
  status: EnrollmentClassroomStatus;
}

export interface Enrollment {
  id: string;
  student_id: string;
  teacher_id: string;
  gig_id: string;
  package_id: string | null;
  price: number;
  status: EnrollmentStatus;
  classroom_id: string | null;
  gig?: EnrollmentGig | null;
  classroom?: EnrollmentClassroom | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateEnrollmentPayload {
  gig_id: string;
  package_id?: string | null;
}

/**
 * Book a published gig for the authenticated student.
 *
 * The backend derives the student from the JWT, the teacher from the gig, and
 * creates the classroom in the same transaction. The response carries the new
 * classroom_id the UI redirects to.
 */
export function createEnrollment(payload: CreateEnrollmentPayload): Promise<Enrollment> {
  return apiFetch<Enrollment>("/enrollments", {
    method: "POST",
    body: JSON.stringify({ ...payload, package_id: payload.package_id ?? null }),
  });
}

/** List the authenticated student's enrollments (backend-scoped). */
export function getMyEnrollments(): Promise<Enrollment[]> {
  return apiFetch<Enrollment[]>("/enrollments/me");
}

/** Fetch one enrollment the caller is a party to (student or teacher). */
export function getEnrollmentById(enrollmentId: string): Promise<Enrollment> {
  return apiFetch<Enrollment>(`/enrollments/${encodeURIComponent(enrollmentId)}`);
}