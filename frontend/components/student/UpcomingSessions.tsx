import EmptyState from "./EmptyState";
import { CalendarIcon } from "./icons";

// NOTE (Step 4A): This overview card shows upcoming sessions ACROSS all of the
// student's classrooms. That needs a global "upcoming sessions" endpoint
// (teacher/marketplace side), which is intentionally NOT built in Step 4A to
// keep API scope minimal. The Sessions tab inside a single classroom is already
// live via GET /sessions/classroom/{classroom_id}. This component stays on its
// empty state and will be wired to the global endpoint in a later step.

export default function UpcomingSessions() {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <CalendarIcon className="h-5 w-5 text-[#D18A4A]" />
        <h2 className="text-base font-bold text-white">Upcoming Sessions</h2>
      </div>
      <EmptyState
        icon={<CalendarIcon className="h-7 w-7" />}
        title="No upcoming sessions."
        description="Your scheduled learning sessions will appear here."
      />
    </section>
  );
}