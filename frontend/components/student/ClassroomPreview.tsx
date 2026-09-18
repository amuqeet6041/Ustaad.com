import Link from "next/link";
import EmptyState from "./EmptyState";
import { GraduationCapIcon } from "./icons";

export default function ClassroomPreview() {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <GraduationCapIcon className="h-5 w-5 text-[#D18A4A]" />
        <h2 className="text-base font-bold text-white">Your Classrooms</h2>
      </div>
      <EmptyState
        icon={<GraduationCapIcon className="h-7 w-7" />}
        title="No active classrooms yet."
        description="Once you purchase or register for a learning session, your classroom will appear here."
      >
        <Link
          href="/browse"
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#B5651D] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#B5651D]/20 transition hover:-translate-y-0.5 hover:bg-[#9E581C]"
        >
          Find an Ustaad
        </Link>
      </EmptyState>
    </section>
  );
}