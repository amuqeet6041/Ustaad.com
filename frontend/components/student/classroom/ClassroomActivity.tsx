import EmptyState from "../EmptyState";
import { ActivityIcon } from "../icons";

export default function ClassroomActivity() {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <ActivityIcon className="h-5 w-5 text-[#D18A4A]" />
        <h2 className="text-base font-bold text-white">Activity</h2>
      </div>
      <EmptyState
        icon={<ActivityIcon className="h-7 w-7" />}
        title="Your classroom activity will appear here."
        description="Updates on sessions, tasks, and milestones will appear here."
      />
    </section>
  );
}