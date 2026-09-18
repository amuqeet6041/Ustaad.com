import Link from "next/link";
import { Classroom } from "./classroom";
import ClassroomStatusBadge from "./ClassroomStatusBadge";
import { getInitials } from "./initials";
import { ArrowRightIcon, GraduationCapIcon } from "./icons";

function formatUpdated(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Updated recently";
  return `Updated ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

interface ClassroomCardProps {
  classroom: Classroom;
}

export default function ClassroomCard({ classroom }: ClassroomCardProps) {
  const teacherName = classroom.teacher?.full_name;
  const gigTitle = classroom.gig?.title;

  return (
    <Link
      href={`/student-dashboard/classrooms/${classroom.id}`}
      className="group block rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#14213D] to-[#2A3A5E] text-sm font-extrabold text-white ring-1 ring-white/10">
          {teacherName ? (
            getInitials(teacherName)
          ) : (
            <GraduationCapIcon className="h-5 w-5 text-[#D18A4A]" />
          )}
        </div>
        <ClassroomStatusBadge status={classroom.status} />
      </div>

      <h3 className="mt-4 truncate text-base font-bold text-white">{classroom.title}</h3>

      <div className="mt-3 space-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <GraduationCapIcon className="h-4 w-4 shrink-0 text-[#D18A4A]" />
          <span className="min-w-0 truncate">{teacherName ?? "Your Ustaad"}</span>
        </p>
        <p className="truncate text-xs text-white/45">{gigTitle ?? "Learning subject"}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
        <span className="text-xs text-white/40">{formatUpdated(classroom.updated_at)}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#B5651D] px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-[#B5651D]/20 transition group-hover:bg-[#9E581C]">
          Open Classroom
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}