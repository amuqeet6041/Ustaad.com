import EmptyState from "../EmptyState";
import { PencilIcon } from "../icons";

export default function ClassroomNotes() {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <PencilIcon className="h-5 w-5 text-[#D18A4A]" />
        <h2 className="text-base font-bold text-white">Learning Notes</h2>
      </div>
      <EmptyState
        icon={<PencilIcon className="h-7 w-7" />}
        title="Your personal classroom notes will appear here."
        description="Notes you take during your sessions will be saved in this classroom."
      />
    </section>
  );
}