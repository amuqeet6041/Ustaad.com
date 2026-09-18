"use client";

import { ClassroomTabId } from "./classroom";
import {
  ActivityIcon,
  ChartIcon,
  ChatIcon,
  ClipboardIcon,
  OverviewIcon,
  PencilIcon,
  VideoIcon,
} from "./icons";

export const CLASSROOM_TABS: {
  id: ClassroomTabId;
  label: string;
  icon: (props: { className?: string }) => React.ReactNode;
}[] = [
  { id: "overview", label: "Overview", icon: OverviewIcon },
  { id: "sessions", label: "Sessions", icon: VideoIcon },
  { id: "chat", label: "Chat", icon: ChatIcon },
  { id: "tasks", label: "Tasks", icon: ClipboardIcon },
  { id: "notes", label: "Notepad", icon: PencilIcon },
  { id: "progress", label: "Progress", icon: ChartIcon },
  { id: "activity", label: "Activity", icon: ActivityIcon },
];

interface ClassroomTabsProps {
  active: ClassroomTabId;
  onChange: (tab: ClassroomTabId) => void;
}

export default function ClassroomTabs({ active, onChange }: ClassroomTabsProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
      <div
        role="tablist"
        aria-label="Classroom sections"
        className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CLASSROOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-white/[0.07] text-white ring-1 ring-white/10"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${isActive ? "text-[#D18A4A]" : "text-white/40"}`}
              />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}