import EmptyState from "../EmptyState";
import { ChatIcon } from "../icons";

export default function ClassroomChat() {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <ChatIcon className="h-5 w-5 text-[#D18A4A]" />
        <h2 className="text-base font-bold text-white">Chat with your Ustaad</h2>
      </div>
      <EmptyState
        icon={<ChatIcon className="h-7 w-7" />}
        title="Your classroom conversation will appear here."
        description="Messages between you and your Ustaad will appear here once you start chatting."
      />
    </section>
  );
}