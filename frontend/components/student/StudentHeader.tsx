"use client";

import { usePathname } from "next/navigation";
import { AuthUser } from "@/lib/auth";
import { getInitials } from "./initials";
import { BellIcon, MenuIcon } from "./icons";

const TITLES: Record<string, string> = {
  "/student-dashboard/overview": "Overview",
  "/student-dashboard/favorites": "Saved Ustaads",
  "/student-dashboard/classrooms": "Classrooms",
  "/student-dashboard/orders": "My Classes",
  "/student-dashboard/proposals": "Proposals",
  "/student-dashboard/messages": "Messages & Notifications",
  "/student-dashboard/payments": "Payments / Fees",
  "/student-dashboard/settings": "Settings",
};

interface StudentHeaderProps {
  user: AuthUser;
  onMenuClick: () => void;
}

export default function StudentHeader({ user, onMenuClick }: StudentHeaderProps) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Student Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0D172B]/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/70 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h1>

        <div className="flex-1" />

        <button
          type="button"
          aria-label="Notifications (coming soon)"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/70 transition hover:bg-white/[0.05] hover:text-white"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D18A4A]" />
        </button>

        <div className="mx-1 hidden h-8 w-px bg-white/10 sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#14213D] to-[#2A3A5E] text-sm font-extrabold text-white ring-1 ring-white/10">
            {getInitials(user.full_name)}
          </div>
          <div className="hidden leading-tight md:block">
            <p className="text-sm font-bold">{user.full_name}</p>
            <p className="text-[11px] text-white/45">Student</p>
          </div>
        </div>
      </div>
    </header>
  );
}