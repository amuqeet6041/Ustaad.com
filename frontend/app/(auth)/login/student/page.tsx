"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/shared/auth/AuthLayout";
import GoogleButton from "@/components/shared/auth/GoogleButton";
import { storeAuth, extractError } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!EMAIL_RE.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast(extractError(data));
        return;
      }

      storeAuth(data);
      router.push(data.user?.role === "teacher" ? "/teacher-dashboard/overview" : "/student-dashboard/overview");
    } catch {
      setToast("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const notify = (message: string) => setToast(message);

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, Student
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Log in to continue your learning journey.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="w-full rounded-xl border border-white/15 bg-[#0D172B]/60 px-4 py-3 text-sm text-white placeholder-white/30 transition focus:border-[#B5651D]/60 focus:outline-none focus:ring-2 focus:ring-[#B5651D]/30"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p id="email-error" className="mt-1.5 text-xs font-medium text-[#9C3B3B]">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <a href="#" className="text-xs font-medium text-white/50 transition hover:text-[#D18A4A]">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="w-full rounded-xl border border-white/15 bg-[#0D172B]/60 px-4 py-3 pr-12 text-sm text-white placeholder-white/30 transition focus:border-[#B5651D]/60 focus:outline-none focus:ring-2 focus:ring-[#B5651D]/30"
                placeholder="Enter your password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/50 transition hover:text-white"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1.5 text-xs font-medium text-[#9C3B3B]">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B5651D] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#9E581C] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Login as Student"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-medium uppercase tracking-wider text-white/40">OR</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <GoogleButton onComingSoon={() => notify("Google Sign-In is coming soon.")} />

        <p className="mt-7 text-center text-sm text-white/60">
          Don&apos;t have a Student account?{" "}
          <Link
            href="/register/student"
            className="font-semibold text-[#D18A4A] transition hover:text-[#E5A15F]"
          >
            Sign up as Student
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 transition hover:text-white"
          >
            ← Back to role selection
          </Link>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-[#18243A] px-4 py-3.5 text-sm text-white shadow-xl"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#B5651D]/20 text-[#D18A4A] text-xs font-bold">
            !
          </span>
          <span className="flex-1">{toast}</span>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setToast(null)}
            className="text-white/40 transition hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </AuthLayout>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}