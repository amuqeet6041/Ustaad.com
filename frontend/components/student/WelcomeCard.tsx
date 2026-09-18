import Link from "next/link";
import { AuthUser } from "@/lib/auth";
import { CompassIcon } from "./icons";

export default function WelcomeCard({ user }: { user: AuthUser }) {
  const firstName = user.full_name.trim().split(/\s+/)[0] || "there";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#B5651D]/10 blur-[90px]" />
        <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#14213D]/50 blur-[90px]" />
      </div>

      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D18A4A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D18A4A]" />
            Student Dashboard
          </div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-2 text-sm text-white/60 sm:text-base">
            Ready to continue your learning journey?
          </p>
          <p className="mt-1 text-xs text-white/35">{user.email}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-xl bg-[#B5651D] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#B5651D]/20 transition hover:-translate-y-0.5 hover:bg-[#9E581C]"
            >
              <CompassIcon className="h-4 w-4" />
              Find an Ustaad
            </Link>
            <Link
              href="/student-dashboard/favorites"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-bold text-white/70 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
            >
              My Saved Ustaads
            </Link>
          </div>
        </div>

        <div className="hidden shrink-0 lg:block" aria-hidden="true">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-5 rounded-full border border-white/5" />
            <div className="absolute inset-0 rounded-full bg-[#B5651D]/10 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14213D] to-[#0D172B] text-3xl font-extrabold text-white ring-1 ring-white/10 shadow-xl shadow-black/40">
              U
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}