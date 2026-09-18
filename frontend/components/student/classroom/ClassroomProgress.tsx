import EmptyState from "../EmptyState";
import { ChartIcon } from "../icons";

export default function ClassroomProgress() {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <ChartIcon className="h-5 w-5 text-[#D18A4A]" />
        <h2 className="text-base font-bold text-white">Learning Progress</h2>
      </div>
      <EmptyState
        icon={<ChartIcon className="h-7 w-7" />}
        title="Progress tracking will appear here."
        description="Your milestones and learning progress will appear here."
      />
    </section>
  );
}