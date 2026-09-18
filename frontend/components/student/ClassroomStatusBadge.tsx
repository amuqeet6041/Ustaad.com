import { ClassroomStatus } from "./classroom";

const STYLES: Record<ClassroomStatus, string> = {
  active: "bg-[#3A5A40]/20 text-[#9CC5A8] ring-[#3A5A40]/40",
  completed: "bg-white/[0.06] text-white/55 ring-white/10",
  cancelled: "bg-[#B5651D]/15 text-[#D18A4A] ring-[#B5651D]/30",
};

const LABELS: Record<ClassroomStatus, string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function ClassroomStatusBadge({ status }: { status: ClassroomStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}