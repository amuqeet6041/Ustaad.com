/**
 * Gig marketplace API service.
 *
 * Centralized data access for the public marketplace. All UI pages consume
 * these functions — raw fetch calls never live inside components. The three
 * endpoints handled here mirror the real backend:
 *
 *   GET /gigs             → all published gigs (with teacher + packages)
 *   GET /gigs/{id}        → one published gig (UUID identifier)
 *   GET /search/tutors    → filtered search over published gigs
 */

import { apiFetch } from "@/lib/api";

export type TeachingMode = "online" | "in_person" | "both";

export type GigCategory =
  | "stem"
  | "programming"
  | "languages"
  | "test_prep"
  | "commerce_business"
  | "arts_humanities";

export type GigPackageTier = "basic" | "standard" | "premium";

/** Safe public teacher summary embedded in gig responses. */
export interface GigTeacher {
  id: string;
  name: string;
  city: string | null;
  bio: string | null;
  education: string | null;
  languages: string[] | null;
  teaching_mode: TeachingMode | null;
  hourly_rate: number | null;
}

export interface GigSyllabusItem {
  title: string;
  detail: string;
}

export interface GigFaq {
  question: string;
  answer: string;
}

/** One purchasable plan tier of a gig (basic / standard / premium). */
export interface GigPackage {
  id: string;
  gig_id: string;
  tier: GigPackageTier;
  name: string;
  title: string;
  description: string | null;
  price: number | null;
  duration_minutes: number | null;
  sessions_count: number | null;
  delivery_days: number | null;
  features: string[] | null;
  created_at: string;
  updated_at: string | null;
}

/** A published marketplace gig as returned by the backend. */
export interface Gig {
  id: string;
  teacher_id: string;
  title: string;
  slug: string | null;
  category: GigCategory | null;
  subject: string | null;
  city: string | null;
  price: number | null;
  status: string;
  overview: string | null;
  learning_outcomes: string[] | null;
  syllabus: GigSyllabusItem[] | null;
  prerequisites: string[] | null;
  faqs: GigFaq[] | null;
  teacher: GigTeacher | null;
  packages: GigPackage[];
  created_at: string;
  updated_at: string | null;
}

/** Search filters matching the backend /search/tutors query parameters. */
export interface SearchGigFilters {
  q?: string;
  city?: string;
  subject?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
}

/** Load every published gig for the marketplace listing. */
export function getGigs(): Promise<Gig[]> {
  return apiFetch<Gig[]>("/gigs");
}

/** Load a single published gig by its real UUID. Throws ApiError(404) when
 * the gig is missing or not publicly visible. */
export function getGigById(id: string): Promise<Gig> {
  return apiFetch<Gig>(`/gigs/${encodeURIComponent(id)}`);
}

/** Search and filter published gigs via the backend. */
export function searchGigs(filters: SearchGigFilters = {}): Promise<Gig[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return apiFetch<Gig[]>(`/search/tutors${qs ? `?${qs}` : ""}`);
}