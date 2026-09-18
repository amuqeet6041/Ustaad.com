import Link from "next/link";
import { Classroom } from "../classroom";
import ClassroomStatusBadge from "../ClassroomStatusBadge";
import EmptyState from "../EmptyState";
import { getInitials } from "../initials";
import {
  ArrowRightIcon,
  CalendarIcon,
  ChartIcon,
  ClockIcon,
  GraduationCapIcon,
} from "../icons";

interface ClassroomOverviewProps {
  classroom?: Classroom;
}

export default function ClassroomOverview({ classroom }: ClassroomOverviewProps) {
  const teacherName = classroom?.teacher?.full_name;
  const gigTitle = classroom?.gig?.title;
  const gigHref = classroom?.gig ? `/gigs/${classroom.gig.id}` : undefined;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:col-span-2">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#B5651D]/10 blur-[80px]" />
          </div>

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14213D] to-[#2A3A5E] text-lg font-extrabold text-white ring-1 ring-white/10">
              {teacherName ? (
                getInitials(teacherName)
              ) : (
                <GraduationCapIcon className="h-7 w-7 text-[#D18A4A]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D18A4A]">
                Your Ustaad
              </p>
              <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-white">
                {teacherName ?? "Your Ustaad"}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-white/45">
                {gigTitle ?? "Your learning subject and Ustaad details will appear here."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {classroom?.status && <ClassroomStatusBadge status={classroom.status} />}
              {gigHref ? (
                <Link
                  href={gigHref}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-white/80 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                >
                  View Gig
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-bold text-white/30"
                >
                  View Gig
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <ChartIcon className="h-5 w-5 text-[#D18A4A]" />
            <h2 className="text-base font-bold text-white">Learning Progress</h2>
          </div>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">0%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-0 rounded-full bg-[#B5651D]" />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-white/45">
            Progress tracking will appear here once you start learning.
          </p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
            <CalendarIcon className="h-5 w-5 text-[#D18A4A]" />
            <h2 className="text-base font-bold text-white">Upcoming Sessions</h2>
          </div>
          <EmptyState
            icon={<CalendarIcon className="h-7 w-7" />}
            title="No upcoming sessions"
            description="Your scheduled learning sessions will appear here."
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
            <ClockIcon className="h-5 w-5 text-[#D18A4A]" />
            <h2 className="text-base font-bold text-white">Recent Activity</h2>
          </div>
          <EmptyState
            icon={<ClockIcon className="h-7 w-7" />}
            title="No recent activity"
            description="Classroom activity will appear here once you start learning."
          />
        </section>
      </div>
    </div>
  );
}