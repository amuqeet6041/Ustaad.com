import EmptyState from "./EmptyState";
import { ClockIcon } from "./icons";

export default function RecentActivity() {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <ClockIcon className="h-5 w-5 text-[#D18A4A]" />
        <h2 className="text-base font-bold text-white">Recent Activity</h2>
      </div>
      <EmptyState
        icon={<ClockIcon className="h-7 w-7" />}
        title="No recent activity yet."
        description="Your learning activity will appear here."
      />
    </section>
  );
}