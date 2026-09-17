const TOKEN_KEY = "ustaad_token";
const USER_KEY = "ustaad_user";

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  phone?: string;
  phone_verified?: boolean;
  email_verified?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export function storeAuth(data: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function extractError(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed. Please try again.";
  const obj = data as Record<string, unknown>;
  if (typeof obj.detail === "string") return obj.detail;
  if (Array.isArray(obj.detail)) {
    return obj.detail
      .map((e: unknown) => {
        if (e && typeof e === "object" && "msg" in e) return (e as Record<string, string>).msg;
        return String(e);
      })
      .join(". ");
  }
  return "Request failed. Please try again.";
}
