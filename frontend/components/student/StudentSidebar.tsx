"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthUser } from "@/lib/auth";
import { getInitials } from "./initials";
import {
  OverviewIcon,
  CompassIcon,
  HeartIcon,
  GraduationCapIcon,
  ChatIcon,
  CreditCardIcon,
  SettingsIcon,
  LogoutIcon,
} from "./icons";

interface NavItem {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/student-dashboard/overview", icon: OverviewIcon },
  { label: "Find an Ustaad", href: "/browse", icon: CompassIcon },
  { label: "Saved Ustaads", href: "/student-dashboard/favorites", icon: HeartIcon },
  { label: "Classrooms", href: "/student-dashboard/classrooms", icon: GraduationCapIcon },
  { label: "Messages & Notifications", href: "/student-dashboard/messages", icon: ChatIcon },
  { label: "Payments / Fees", href: "/student-dashboard/payments", icon: CreditCardIcon },
  { label: "Settings", href: "/student-dashboard/settings", icon: SettingsIcon },
];

interface StudentSidebarProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function StudentSidebar({ user, isOpen, onClose, onLogout }: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.08] bg-[#070A0D] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Student dashboard navigation"
        aria-hidden={isOpen ? undefined : true}
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-6">
          <Link
            href="/student-dashboard/overview"
            onClick={onClose}
            className="flex items-center gap-2.5"
            aria-label="Ustaad student dashboard"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D] text-xl font-bold text-white ring-1 ring-white/10">
              U
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Ustaad<span className="text-[#D18A4A]">.</span>
            </span>
          </Link>
        </div>

        <div className="mt-4 px-4">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
            Student Menu
          </p>
        </div>

        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-4 pb-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-white/[0.07] text-white ring-1 ring-white/10"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition ${
                    active ? "text-[#D18A4A]" : "text-white/40 group-hover:text-[#D18A4A]"
                  }`}
                />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D18A4A]" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.08] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#14213D] to-[#2A3A5E] text-sm font-extrabold text-white">
              {getInitials(user.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{user.full_name}</p>
              <p className="truncate text-xs text-white/45">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-xs font-bold text-white/55 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            <LogoutIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}