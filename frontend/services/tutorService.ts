import { apiFetch } from "@/lib/api";

export interface TutorSearchFilters {
  subject?: string;
  city?: string;
  budgetMin?: number;
  budgetMax?: number;
  mode?: "online" | "physical" | "both";
}

export function searchTutors(filters: TutorSearchFilters) {
  const params = new URLSearchParams(filters as Record<string, string>);
  return apiFetch(`/search/tutors?${params.toString()}`);
}
