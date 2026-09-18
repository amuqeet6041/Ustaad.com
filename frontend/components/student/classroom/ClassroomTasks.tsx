import EmptyState from "../EmptyState";
import { ClipboardIcon } from "../icons";

export default function ClassroomTasks() {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <ClipboardIcon className="h-5 w-5 text-[#D18A4A]" />
        <h2 className="text-base font-bold text-white">Tasks & Assignments</h2>
      </div>
      <EmptyState
        icon={<ClipboardIcon className="h-7 w-7" />}
        title="No tasks yet"
        description="Assignments and tasks from your Ustaad will appear here."
      />
    </section>
  );
}